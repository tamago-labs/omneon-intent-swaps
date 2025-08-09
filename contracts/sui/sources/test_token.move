// SPDX-License-Identifier: MIT
module omneon::test_token {
    use sui::coin::{Self, TreasuryCap};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::option;

    /// One-time witness for the TEST_TOKEN
    public struct TEST_TOKEN has drop {}

    /// Capability to mint TEST_TOKEN
    public struct TestTokenCap has key {
        id: UID,
        cap: TreasuryCap<TEST_TOKEN>,
    }

    /// Initialize the TEST_TOKEN currency
    fun init(witness: TEST_TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            6, // decimals
            b"TEST",
            b"Test Token",
            b"Test token for Omneon Intent RFQ",
            option::none(),
            ctx
        );

        // Freeze the metadata so it cannot be modified
        transfer::public_freeze_object(metadata);

        // Create capability wrapper and transfer to sender
        let test_cap = TestTokenCap {
            id: object::new(ctx),
            cap: treasury_cap,
        };

        transfer::transfer(test_cap, tx_context::sender(ctx));
    }

    /// Mint new TEST_TOKEN coins
    public entry fun mint(
        cap: &mut TestTokenCap,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(&mut cap.cap, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Burn TEST_TOKEN coins
    public entry fun burn(
        cap: &mut TestTokenCap,
        coin: coin::Coin<TEST_TOKEN>
    ) {
        coin::burn(&mut cap.cap, coin);
    }

    /// Get total supply of TEST_TOKEN
    public fun total_supply(cap: &TestTokenCap): u64 {
        coin::total_supply(&cap.cap)
    }

    #[test_only]
    /// Initialize for testing
    public fun init_for_testing(ctx: &mut TxContext) {
        init(TEST_TOKEN {}, ctx);
    }
}
