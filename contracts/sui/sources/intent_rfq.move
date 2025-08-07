// SPDX-License-Identifier: MIT

// An intent-based swap contract using off-chain resolvers and Merkle tree proofs  

module omneon::intent_rfq {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::bag::{Self, Bag};
    use sui::event;
    use sui::hash;
    use sui::bcs;
    use std::vector;
    use std::string::{Self, String}; 
    use std::ascii::{ into_bytes};
    use std::type_name::{get, into_string};
    
    use omneon::merkle_proof;

    // ======== Constants ========
    
    const MAX_FEE_RATE: u64 = 50; // 0.5% in basis points
    const DEFAULT_FEE_RATE: u64 = 30; // 0.3% in basis points

    // ======== Errors ========
    
    const EInvalidResolver: u64 = 0;
    const EInvalidAmounts: u64 = 1;
    const ENotAuthorized: u64 = 2;
    const EFeeRateTooHigh: u64 = 3;
    const EInsufficientFees: u64 = 4;
    const EInvalidChainType: u64 = 5;

    // ======== Types ========

    /// Chain types for cross-chain operations
    public struct ChainType has store, copy, drop {
        chain_type: u8 // 0: EVM, 1: SUI, 2: SOLANA, 3: APTOS, 4: BITCOIN
    }

    /// Order status enumeration
    public struct OrderStatus has store, copy, drop {
        status: u8 // 0: Unknown, 1: Pending, 2: Completed, 3: Cancelled
    }

    /// Main Intent RFQ contract
    public struct IntentRFQ has key {
        id: UID,
        owner: address,
        resolver_registry: ID,
        fee_rate: u64,
        pending_orders_root: vector<u8>,
        completed_orders_root: vector<u8>,
        cancelled_orders_root: vector<u8>,
        collected_fees: Bag, // token_type => Balance<T>
    }

    /// Resolver registry for managing authorized resolvers
    public struct ResolverRegistry has key {
        id: UID,
        owner: address,
        resolvers: Bag, // address => ResolverInfo
    }

    /// Information about a resolver
    public struct ResolverInfo has store {
        is_active: bool,
        reputation: u64,
        total_executed: u64,
        registered_at: u64,
    }

    // ======== Events ========

    /// Event emitted when a new order is created
    public struct OrderCreated has copy, drop {
        intent_id: vector<u8>,
        user: address,
        source_type: u8,
        source_chain_id: u64,
        dest_type: u8,
        dest_chain_id: u64,
        resolver: address,
        amount_in: u64,
        fee_amount: u64,
        token_type: String,
    }

    /// Event emitted when an order is completed
    public struct OrderCompleted has copy, drop {
        intent_id: vector<u8>,
        resolver: address,
        tx_hash: String,
    }

    /// Event emitted when status roots are updated
    public struct StatusRootsUpdated has copy, drop {
        pending_root: vector<u8>,
        completed_root: vector<u8>,
        cancelled_root: vector<u8>,
        updater: address,
    }

    /// Event emitted when fees are withdrawn
    public struct FeesWithdrawn has copy, drop {
        token_type: String,
        amount: u64,
    }

    /// Event emitted when a resolver is registered
    public struct ResolverRegistered has copy, drop {
        resolver: address,
        reputation: u64,
    }

    // ======== Module Initialize ========

    /// Initialize the module with registry and intent RFQ contracts
    fun init(ctx: &mut TxContext) {
        let registry = ResolverRegistry {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            resolvers: bag::new(ctx),
        };

        let intent_rfq = IntentRFQ {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            resolver_registry: object::id(&registry),
            fee_rate: DEFAULT_FEE_RATE,
            pending_orders_root: vector::empty(),
            completed_orders_root: vector::empty(),
            cancelled_orders_root: vector::empty(),
            collected_fees: bag::new(ctx),
        };

        transfer::share_object(registry);
        transfer::share_object(intent_rfq);
    }

    // ======== Resolver Registry Functions ========

    /// Register a new resolver
    public fun register_resolver(
        registry: &mut ResolverRegistry,
        resolver: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.owner, ENotAuthorized);
        
        let resolver_info = ResolverInfo {
            is_active: true,
            reputation: 100,
            total_executed: 0,
            registered_at: tx_context::epoch(ctx),
        };

        bag::add(&mut registry.resolvers, resolver, resolver_info);

        event::emit(ResolverRegistered {
            resolver,
            reputation: 100,
        });
    }

    /// Check if a resolver is active
    public fun is_active_resolver(registry: &ResolverRegistry, resolver: address): bool {
        if (bag::contains(&registry.resolvers, resolver)) {
            let info = bag::borrow<address, ResolverInfo>(&registry.resolvers, resolver);
            info.is_active
        } else {
            false
        }
    }

    /// Deactivate a resolver
    public fun deactivate_resolver(
        registry: &mut ResolverRegistry,
        resolver: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.owner, ENotAuthorized);
        
        if (bag::contains(&registry.resolvers, resolver)) {
            let info = bag::borrow_mut<address, ResolverInfo>(&mut registry.resolvers, resolver);
            info.is_active = false;
        }
    }

    /// Update resolver reputation on successful execution
    public fun update_resolver_reputation(
        registry: &mut ResolverRegistry,
        resolver: address,
        success: bool,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == registry.owner, ENotAuthorized);
        
        if (bag::contains(&registry.resolvers, resolver)) {
            let info = bag::borrow_mut<address, ResolverInfo>(&mut registry.resolvers, resolver);
            if (success) {
                info.total_executed = info.total_executed + 1;
                if (info.reputation < 1000) {
                    info.reputation = info.reputation + 1;
                }
            } else if (info.reputation >= 10) {
                info.reputation = info.reputation - 10;
            }
        }
    }

    // ======== Intent RFQ Functions ========

    /// Create a new order with ERC20-like token transfer
    public fun create_order<T>(
        intent_rfq: &mut IntentRFQ,
        registry: &ResolverRegistry,
        source_type: ChainType,
        source_chain_id: u64,
        mut payment: Coin<T>,
        dest_type: ChainType,
        dest_chain_id: u64,
        min_amount_out: u64,
        resolver: address,
        ctx: &mut TxContext
    ): vector<u8> {
        // Validate resolver
        assert!(is_active_resolver(registry, resolver), EInvalidResolver);
        
        let amount_in = coin::value(&payment);
        assert!(amount_in > 0 && min_amount_out > 0, EInvalidAmounts);
        assert!(source_type.chain_type <= 4 && dest_type.chain_type <= 4, EInvalidChainType);

        // Generate intent ID
        let intent_id = generate_intent_id(
            tx_context::sender(ctx),
            source_type.chain_type,
            source_chain_id,
            amount_in,
            dest_type.chain_type,
            dest_chain_id,
            min_amount_out,
            resolver,
            ctx
        );

        // Calculate fee
        let fee_amount = (amount_in * intent_rfq.fee_rate) / 10000;
        let amount_to_resolver = amount_in - fee_amount;

        // Split payment for fee and resolver transfer
        let fee_balance = coin::into_balance(coin::split(&mut payment, fee_amount, ctx));
        
        // Get token type string for fee storage
        let token_type = get_token_type_string<T>();
        
        // Store fee in collected_fees bag using Balance<T>
        if (bag::contains_with_type<String, Balance<T>>(&intent_rfq.collected_fees, token_type)) {
            let existing_balance = bag::borrow_mut<String, Balance<T>>(&mut intent_rfq.collected_fees, token_type);
            balance::join(existing_balance, fee_balance);
        } else {
            bag::add(&mut intent_rfq.collected_fees, token_type, fee_balance);
        };

        // Transfer remaining tokens directly to resolver (simulating ERC20 transfer)
        transfer::public_transfer(payment, resolver);

        // Emit event
        event::emit(OrderCreated {
            intent_id,
            user: tx_context::sender(ctx),
            source_type: source_type.chain_type,
            source_chain_id,
            dest_type: dest_type.chain_type,
            dest_chain_id,
            resolver,
            amount_in,
            fee_amount,
            token_type,
        });

        intent_id
    }

    // ======== Status Root Management ========

    /// Update all merkle tree roots in a single transaction (gas optimized)
    public fun update_all_status_roots(
        intent_rfq: &mut IntentRFQ,
        registry: &ResolverRegistry,
        new_pending_root: vector<u8>,
        new_completed_root: vector<u8>,
        new_cancelled_root: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            sender == intent_rfq.owner || is_active_resolver(registry, sender),
            ENotAuthorized
        );

        intent_rfq.pending_orders_root = new_pending_root;
        intent_rfq.completed_orders_root = new_completed_root;
        intent_rfq.cancelled_orders_root = new_cancelled_root;

        event::emit(StatusRootsUpdated {
            pending_root: new_pending_root,
            completed_root: new_completed_root,
            cancelled_root: new_cancelled_root,
            updater: sender,
        });
    }

    /// Update pending orders root
    public fun update_pending_orders_root(
        intent_rfq: &mut IntentRFQ,
        registry: &ResolverRegistry,
        new_root: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            sender == intent_rfq.owner || is_active_resolver(registry, sender),
            ENotAuthorized
        );

        intent_rfq.pending_orders_root = new_root;
    }

    /// Update completed orders root
    public fun update_completed_orders_root(
        intent_rfq: &mut IntentRFQ,
        registry: &ResolverRegistry,
        new_root: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            sender == intent_rfq.owner || is_active_resolver(registry, sender),
            ENotAuthorized
        );

        intent_rfq.completed_orders_root = new_root;
    }

    /// Update cancelled orders root
    public fun update_cancelled_orders_root(
        intent_rfq: &mut IntentRFQ,
        registry: &ResolverRegistry,
        new_root: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(
            sender == intent_rfq.owner || is_active_resolver(registry, sender),
            ENotAuthorized
        );

        intent_rfq.cancelled_orders_root = new_root;
    }

    /// Verify if an order has a specific status using merkle proof
    public fun verify_order_status(
        intent_rfq: &IntentRFQ,
        intent_id: vector<u8>,
        status: u8,
        proof: &vector<vector<u8>>
    ): bool {
        let leaf = hash_intent_id(&intent_id);
        let root = if (status == 1) { // Pending
            &intent_rfq.pending_orders_root
        } else if (status == 2) { // Completed  
            &intent_rfq.completed_orders_root
        } else if (status == 3) { // Cancelled
            &intent_rfq.cancelled_orders_root
        } else {
            return false
        };

        if (vector::length(root) == 0) {
            false
        } else {
            merkle_proof::verify(proof, *root, leaf)
        }
    }

    // ======== Fee Management ========

    /// Set new fee rate (only owner)
    public fun set_fee_rate(
        intent_rfq: &mut IntentRFQ,
        new_fee_rate: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == intent_rfq.owner, ENotAuthorized);
        assert!(new_fee_rate <= MAX_FEE_RATE, EFeeRateTooHigh);
        
        intent_rfq.fee_rate = new_fee_rate;
    }

    /// Get collected fees for a specific token type
    public fun get_collected_fees<T>(intent_rfq: &IntentRFQ): u64 {
        let token_type = get_token_type_string<T>();
        if (bag::contains_with_type<String, Balance<T>>(&intent_rfq.collected_fees, token_type)) {
            let fee_balance = bag::borrow<String, Balance<T>>(&intent_rfq.collected_fees, token_type);
            balance::value(fee_balance)
        } else {
            0
        }
    }

    /// Withdraw collected fees (owner only)
    public fun withdraw_fees<T>(
        intent_rfq: &mut IntentRFQ,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(tx_context::sender(ctx) == intent_rfq.owner, ENotAuthorized);
        
        let token_type = get_token_type_string<T>();
        assert!(
            bag::contains_with_type<String, Balance<T>>(&intent_rfq.collected_fees, token_type),
            EInsufficientFees
        );

        let fee_balance = bag::borrow_mut<String, Balance<T>>(&mut intent_rfq.collected_fees, token_type);
        assert!(balance::value(fee_balance) >= amount, EInsufficientFees);

        let withdrawn_balance = balance::split(fee_balance, amount);

        event::emit(FeesWithdrawn {
            token_type,
            amount,
        });

        coin::from_balance(withdrawn_balance, ctx)
    }

    /// Withdraw all fees of a specific token type
    public fun withdraw_all_fees<T>(
        intent_rfq: &mut IntentRFQ,
        ctx: &mut TxContext
    ): Coin<T> {
        assert!(tx_context::sender(ctx) == intent_rfq.owner, ENotAuthorized);
        
        let token_type = get_token_type_string<T>();
        assert!(
            bag::contains_with_type<String, Balance<T>>(&intent_rfq.collected_fees, token_type),
            EInsufficientFees
        );

        let fee_balance = bag::remove<String, Balance<T>>(&mut intent_rfq.collected_fees, token_type);
        let amount = balance::value(&fee_balance);

        event::emit(FeesWithdrawn {
            token_type,
            amount,
        });

        coin::from_balance(fee_balance, ctx)
    }

    // ======== View Functions ========

    /// Get all status roots
    public fun get_status_roots(intent_rfq: &IntentRFQ): (vector<u8>, vector<u8>, vector<u8>) {
        (
            intent_rfq.pending_orders_root,
            intent_rfq.completed_orders_root, 
            intent_rfq.cancelled_orders_root
        )
    }

    /// Calculate fee for a given amount
    public fun calculate_fee(intent_rfq: &IntentRFQ, amount: u64): u64 {
        (amount * intent_rfq.fee_rate) / 10000
    }

    /// Get resolver information
    public fun get_resolver_info(registry: &ResolverRegistry, resolver: address): (bool, u64, u64) {
        if (bag::contains(&registry.resolvers, resolver)) {
            let info = bag::borrow<address, ResolverInfo>(&registry.resolvers, resolver);
            (info.is_active, info.reputation, info.total_executed)
        } else {
            (false, 0, 0)
        }
    }

    /// Create ChainType helper
    public fun create_chain_type(chain_type: u8): ChainType {
        assert!(chain_type <= 4, EInvalidChainType);
        ChainType { chain_type }
    }

    /// Create OrderStatus helper
    public fun create_order_status(status: u8): OrderStatus {
        OrderStatus { status }
    }

    // ======== Helper Functions ========

    /// Generate a unique intent ID
    fun generate_intent_id(
        user: address,
        source_type: u8,
        source_chain_id: u64,
        amount_in: u64,
        dest_type: u8,
        dest_chain_id: u64,
        min_amount_out: u64,
        resolver: address,
        ctx: &mut TxContext
    ): vector<u8> {
        let mut data = vector::empty<u8>();
        vector::append(&mut data, bcs::to_bytes(&user));
        vector::append(&mut data, bcs::to_bytes(&source_type));
        vector::append(&mut data, bcs::to_bytes(&source_chain_id));
        vector::append(&mut data, bcs::to_bytes(&amount_in));
        vector::append(&mut data, bcs::to_bytes(&dest_type));
        vector::append(&mut data, bcs::to_bytes(&dest_chain_id));
        vector::append(&mut data, bcs::to_bytes(&min_amount_out));
        vector::append(&mut data, bcs::to_bytes(&resolver));
        vector::append(&mut data, bcs::to_bytes(&tx_context::epoch(ctx)));
        vector::append(&mut data, bcs::to_bytes(&tx_context::sender(ctx)));
        
        hash::keccak256(&data)
    }

    /// Hash intent ID for merkle tree leaf
    fun hash_intent_id(intent_id: &vector<u8>): vector<u8> {
        hash::keccak256(intent_id)
    }

    /// Get token type string for fee tracking 
    public fun get_token_type_string<T>(): String {
        string::utf8(into_bytes(into_string(get<T>())))
    }

    // ======== Test Functions ========
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
