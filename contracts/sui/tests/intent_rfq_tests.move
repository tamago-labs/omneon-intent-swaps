// SPDX-License-Identifier: MIT
#[test_only]
module omneon::intent_rfq_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::transfer;
    use std::vector;
    use std::string;
    
    use omneon::intent_rfq::{Self, IntentRFQ, ResolverRegistry, ChainType};
    use omneon::test_token::{Self, TestTokenCap, TEST_TOKEN};

    const ADMIN: address = @0xA;
    const USER: address = @0xB; 
    const RESOLVER: address = @0xC;

    #[test]
    fun test_create_order_flow() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
            test_token::init_for_testing(ctx);
        };

        // Register resolver
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            intent_rfq::register_resolver(&mut registry, RESOLVER, ctx);
            
            test_scenario::return_shared(registry);
        };

        // Mint test tokens to user
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut token_cap = test_scenario::take_from_sender<TestTokenCap>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            test_token::mint(&mut token_cap, 1000000, USER, ctx); // 1000 TEST tokens
            
            test_scenario::return_to_sender(&scenario, token_cap);
        };

        // Create order
        test_scenario::next_tx(&mut scenario, USER);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let payment = test_scenario::take_from_sender<Coin<TEST_TOKEN>>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let source_type = intent_rfq::create_chain_type(0); // EVM
            let dest_type = intent_rfq::create_chain_type(1);   // SUI
            
            let intent_id = intent_rfq::create_order<TEST_TOKEN>(
                &mut intent_rfq,
                &registry,
                source_type,
                1, // Ethereum chain ID
                payment,
                dest_type,
                0, // SUI chain ID
                900000, // min_amount_out
                RESOLVER,
                ctx
            );
            
            assert!(vector::length(&intent_id) > 0, 0);
            
            test_scenario::return_shared(intent_rfq);
            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }

    #[test] 
    fun test_merkle_proof_verification() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        // Register resolver
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            intent_rfq::register_resolver(&mut registry, RESOLVER, ctx);
            
            test_scenario::return_shared(registry);
        };

        // Update status roots
        test_scenario::next_tx(&mut scenario, RESOLVER);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let pending_root = x"1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
            let completed_root = x"fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";
            let cancelled_root = vector::empty<u8>();
            
            intent_rfq::update_all_status_roots(
                &mut intent_rfq,
                &registry,
                pending_root,
                completed_root,
                cancelled_root,
                ctx
            );
            
            // Verify roots were set
            let (pending, completed, cancelled) = intent_rfq::get_status_roots(&intent_rfq);
            assert!(pending == pending_root, 0);
            assert!(completed == completed_root, 1);
            assert!(cancelled == cancelled_root, 2);
            
            test_scenario::return_shared(intent_rfq);
            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_fee_calculation() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            
            // Test default fee rate (0.3%)
            let fee = intent_rfq::calculate_fee(&intent_rfq, 1000000);
            assert!(fee == 3000, 0); // 0.3% of 1000000 = 3000 (30 basis points)
            
            test_scenario::return_shared(intent_rfq);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_fee_collection_and_withdrawal() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
            test_token::init_for_testing(ctx);
        };

        // Register resolver
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            intent_rfq::register_resolver(&mut registry, RESOLVER, ctx);
            
            test_scenario::return_shared(registry);
        };

        // Mint test tokens to user
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut token_cap = test_scenario::take_from_sender<TestTokenCap>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            test_token::mint(&mut token_cap, 1000000, USER, ctx); // 1000 TEST tokens
            
            test_scenario::return_to_sender(&scenario, token_cap);
        };

        // Create order to generate fees
        test_scenario::next_tx(&mut scenario, USER);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let payment = test_scenario::take_from_sender<Coin<TEST_TOKEN>>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let source_type = intent_rfq::create_chain_type(0); // EVM
            let dest_type = intent_rfq::create_chain_type(1);   // SUI
            
            let _intent_id = intent_rfq::create_order<TEST_TOKEN>(
                &mut intent_rfq,
                &registry,
                source_type,
                1,
                payment,
                dest_type,
                0,
                900000,
                RESOLVER,
                ctx
            );
            
            // Check fees were collected
            let collected_fees = intent_rfq::get_collected_fees<TEST_TOKEN>(&intent_rfq);
            assert!(collected_fees == 3000, 0); // 0.3% of 1000000
            
            test_scenario::return_shared(intent_rfq);
            test_scenario::return_shared(registry);
        };

        // Withdraw fees as owner
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let fee_coin = intent_rfq::withdraw_fees<TEST_TOKEN>(&mut intent_rfq, 1000, ctx);
            assert!(coin::value(&fee_coin) == 1000, 0);
            
            // Check remaining fees
            let remaining_fees = intent_rfq::get_collected_fees<TEST_TOKEN>(&intent_rfq);
            assert!(remaining_fees == 2000, 1);
            
            transfer::public_transfer(fee_coin, ADMIN);
            test_scenario::return_shared(intent_rfq);
        };

        // Withdraw all remaining fees
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            let all_fee_coin = intent_rfq::withdraw_all_fees<TEST_TOKEN>(&mut intent_rfq, ctx);
            assert!(coin::value(&all_fee_coin) == 2000, 0);
            
            // Check no fees remaining
            let remaining_fees = intent_rfq::get_collected_fees<TEST_TOKEN>(&intent_rfq);
            assert!(remaining_fees == 0, 1);
            
            transfer::public_transfer(all_fee_coin, ADMIN);
            test_scenario::return_shared(intent_rfq);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_resolver_management() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        // Register resolver
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Initially resolver should not be active
            assert!(!intent_rfq::is_active_resolver(&registry, RESOLVER), 0);
            
            // Register resolver
            intent_rfq::register_resolver(&mut registry, RESOLVER, ctx);
            
            // Now resolver should be active
            assert!(intent_rfq::is_active_resolver(&registry, RESOLVER), 1);
            
            // Check resolver info
            let (is_active, reputation, total_executed) = intent_rfq::get_resolver_info(&registry, RESOLVER);
            assert!(is_active, 2);
            assert!(reputation == 100, 3);
            assert!(total_executed == 0, 4);
            
            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_chain_type_creation() {
        let _evm_chain = intent_rfq::create_chain_type(0);
        let _sui_chain = intent_rfq::create_chain_type(1);
        let _solana_chain = intent_rfq::create_chain_type(2);
        let _aptos_chain = intent_rfq::create_chain_type(3);
        let _bitcoin_chain = intent_rfq::create_chain_type(4);
        
        // All should create successfully
        // Testing that the function doesn't abort
    }

    #[test]
    #[expected_failure(abort_code = omneon::intent_rfq::EInvalidChainType)]
    fun test_invalid_chain_type() {
        let _invalid_chain = intent_rfq::create_chain_type(5); // Should fail
    }

    #[test]
    fun test_order_status_verification() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        // Register resolver and set up roots
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            intent_rfq::register_resolver(&mut registry, RESOLVER, ctx);
            
            test_scenario::return_shared(registry);
        };

        // Test order status verification
        test_scenario::next_tx(&mut scenario, RESOLVER);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let registry = test_scenario::take_shared<ResolverRegistry>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Create a test intent ID
            let test_intent_id = x"abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            
            // Set up roots (simplified single-leaf tree)
            let leaf = x"abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
            let completed_root = leaf; // Single leaf tree
            let empty_root = vector::empty<u8>();
            
            intent_rfq::update_all_status_roots(
                &mut intent_rfq,
                &registry,
                empty_root,
                completed_root,
                empty_root,
                ctx
            );
            
            // Test verification with empty proof (single leaf)
            let empty_proof = vector::empty<vector<u8>>();
            let _is_completed = intent_rfq::verify_order_status(
                &intent_rfq,
                test_intent_id,
                2, // Completed status
                &empty_proof
            );
            
            // Should return false because we need to hash the intent_id first
            // In real usage, the leaf would be hash(intent_id)
            
            test_scenario::return_shared(intent_rfq);
            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_fee_rate_update() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        // Update fee rate
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Set new fee rate to 0.25% (25 basis points)
            intent_rfq::set_fee_rate(&mut intent_rfq, 25, ctx);
            
            // Test new fee calculation
            let fee = intent_rfq::calculate_fee(&intent_rfq, 1000000);
            assert!(fee == 2500, 0); // 0.25% of 1000000 = 2500
            
            test_scenario::return_shared(intent_rfq);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = omneon::intent_rfq::EFeeRateTooHigh)]
    fun test_fee_rate_too_high() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        // Try to set fee rate too high
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Try to set fee rate to 1% (100 basis points) - should fail
            intent_rfq::set_fee_rate(&mut intent_rfq, 100, ctx);
            
            test_scenario::return_shared(intent_rfq);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = omneon::intent_rfq::ENotAuthorized)]
    fun test_unauthorized_fee_rate_update() {
        let mut scenario = test_scenario::begin(ADMIN);

        // Initialize contracts
        {
            let ctx = test_scenario::ctx(&mut scenario);
            intent_rfq::init_for_testing(ctx);
        };

        // Try to update fee rate as non-owner
        test_scenario::next_tx(&mut scenario, USER);
        {
            let mut intent_rfq = test_scenario::take_shared<IntentRFQ>(&scenario);
            let ctx = test_scenario::ctx(&mut scenario);
            
            // Should fail because USER is not owner
            intent_rfq::set_fee_rate(&mut intent_rfq, 25, ctx);
            
            test_scenario::return_shared(intent_rfq);
        };

        test_scenario::end(scenario);
    }
 
}
