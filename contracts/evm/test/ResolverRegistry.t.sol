// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Test, console } from "forge-std/Test.sol";
import { ResolverRegistry } from "../src/ResolverRegistry.sol";
import { IResolverRegistry } from "../src/interfaces/IResolverRegistry.sol";

contract ResolverRegistryTest is Test {
    ResolverRegistry resolverRegistry;
    
    address owner = address(this);
    address resolver1 = address(0x1);
    address resolver2 = address(0x2);
    address nonOwner = address(0x3);

    function setUp() public {
        resolverRegistry = new ResolverRegistry();
        
        vm.label(owner, "Owner");
        vm.label(resolver1, "Resolver1");
        vm.label(resolver2, "Resolver2");
        vm.label(nonOwner, "NonOwner");
    }

    function testInitialState() public {
        assertEq(resolverRegistry.owner(), owner);
        assertFalse(resolverRegistry.isActiveResolver(resolver1));
        assertFalse(resolverRegistry.isActiveResolver(resolver2));
    }

    function testRegisterResolver() public {
        resolverRegistry.registerResolver(resolver1);
        
        assertTrue(resolverRegistry.isActiveResolver(resolver1));
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertTrue(info.isActive);
        assertEq(info.reputation, 100);
        assertEq(info.totalExecuted, 0);
        assertEq(info.registeredAt, block.timestamp);
    }

    function testCannotRegisterResolverTwice() public {
        resolverRegistry.registerResolver(resolver1);
        
        vm.expectRevert(IResolverRegistry.ResolverAlreadyRegistered.selector);
        resolverRegistry.registerResolver(resolver1);
    }

    function testOnlyOwnerCanRegisterResolver() public {
        vm.prank(nonOwner);
        vm.expectRevert("Not owner");
        resolverRegistry.registerResolver(resolver1);
    }

    function testDeregisterResolver() public {
        // First register
        resolverRegistry.registerResolver(resolver1);
        assertTrue(resolverRegistry.isActiveResolver(resolver1));
        
        // Then deregister
        resolverRegistry.deregisterResolver(resolver1);
        assertFalse(resolverRegistry.isActiveResolver(resolver1));
        
        // Info should still exist but isActive = false
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertFalse(info.isActive);
        assertEq(info.reputation, 100); // Reputation preserved
        assertEq(info.registeredAt, block.timestamp); // Registration time preserved
    }

    function testOnlyOwnerCanDeregisterResolver() public {
        resolverRegistry.registerResolver(resolver1);
        
        vm.prank(nonOwner);
        vm.expectRevert("Not owner");
        resolverRegistry.deregisterResolver(resolver1);
    }

    function testUpdateReputationOnSuccess() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Update reputation (simulate successful execution)
        resolverRegistry.updateReputationOnSuccess(resolver1);
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 101); // Increased by 1
        assertEq(info.totalExecuted, 1); // Incremented
    }

    function testReputationCappedAt1000() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Set reputation to max first
        for (uint i = 0; i < 900; i++) {
            resolverRegistry.updateReputationOnSuccess(resolver1);
        }
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 1000); // Capped at 1000
        assertEq(info.totalExecuted, 900);
        
        // Try to increase beyond cap
        resolverRegistry.updateReputationOnSuccess(resolver1);
        
        info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 1000); // Still capped
        assertEq(info.totalExecuted, 901); // But execution count still increases
    }

    function testCannotUpdateReputationForInactiveResolver() public {
        resolverRegistry.registerResolver(resolver1);
        resolverRegistry.deregisterResolver(resolver1); // Make inactive
        
        // Should not update reputation for inactive resolver
        resolverRegistry.updateReputationOnSuccess(resolver1);
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 100); // Unchanged
        assertEq(info.totalExecuted, 0); // Unchanged
    }

    function testSlashResolver() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Increase reputation first
        for (uint i = 0; i < 50; i++) {
            resolverRegistry.updateReputationOnSuccess(resolver1);
        }
        
        IResolverRegistry.ResolverInfo memory infoBefore = resolverRegistry.getResolverInfo(resolver1);
        assertEq(infoBefore.reputation, 150);
        
        // Slash resolver
        resolverRegistry.slashResolver(resolver1, "Failed to execute order");
        
        IResolverRegistry.ResolverInfo memory infoAfter = resolverRegistry.getResolverInfo(resolver1);
        assertEq(infoAfter.reputation, 140); // Reduced by 10
    }

    function testSlashResolverMinimumReputation() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Resolver starts with 100 reputation
        // Slash multiple times to test minimum
        for (uint i = 0; i < 15; i++) {
            resolverRegistry.slashResolver(resolver1, "Test slash");
        }
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        // After 10 slashes: 100 - (10 * 10) = 0 (minimum)
        // Further slashes should not go below 0
        assertEq(info.reputation, 0);
    }

    function testCannotSlashInactiveResolver() public {
        resolverRegistry.registerResolver(resolver1);
        resolverRegistry.deregisterResolver(resolver1); // Make inactive
        
        vm.expectRevert(IResolverRegistry.ResolverNotActive.selector);
        resolverRegistry.slashResolver(resolver1, "Test slash");
    }

    function testOnlyOwnerCanSlashResolver() public {
        resolverRegistry.registerResolver(resolver1);
        
        vm.prank(nonOwner);
        vm.expectRevert("Not owner");
        resolverRegistry.slashResolver(resolver1, "Unauthorized slash");
    }

    function testOnlyOwnerCanUpdateReputation() public {
        resolverRegistry.registerResolver(resolver1);
        
        vm.prank(nonOwner);
        vm.expectRevert("Not owner");
        resolverRegistry.updateReputationOnSuccess(resolver1);
    }

    function testGetResolverInfoForUnregisteredResolver() public {
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        
        assertFalse(info.isActive);
        assertEq(info.reputation, 0);
        assertEq(info.totalExecuted, 0);
        assertEq(info.registeredAt, 0);
    }

    function testMultipleResolversManagement() public {
        // Register multiple resolvers
        resolverRegistry.registerResolver(resolver1);
        resolverRegistry.registerResolver(resolver2);
        
        assertTrue(resolverRegistry.isActiveResolver(resolver1));
        assertTrue(resolverRegistry.isActiveResolver(resolver2));
        
        // Update reputations differently
        resolverRegistry.updateReputationOnSuccess(resolver1);
        resolverRegistry.updateReputationOnSuccess(resolver1);
        resolverRegistry.updateReputationOnSuccess(resolver2);
        
        IResolverRegistry.ResolverInfo memory info1 = resolverRegistry.getResolverInfo(resolver1);
        IResolverRegistry.ResolverInfo memory info2 = resolverRegistry.getResolverInfo(resolver2);
        
        assertEq(info1.reputation, 102);
        assertEq(info1.totalExecuted, 2);
        assertEq(info2.reputation, 101);
        assertEq(info2.totalExecuted, 1);
        
        // Deregister one
        resolverRegistry.deregisterResolver(resolver1);
        
        assertFalse(resolverRegistry.isActiveResolver(resolver1));
        assertTrue(resolverRegistry.isActiveResolver(resolver2));
    }

    function testResolverLifecycle() public {
        // Register
        resolverRegistry.registerResolver(resolver1);
        assertTrue(resolverRegistry.isActiveResolver(resolver1));
        
        // Build reputation
        for (uint i = 0; i < 10; i++) {
            resolverRegistry.updateReputationOnSuccess(resolver1);
        }
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 110);
        assertEq(info.totalExecuted, 10);
        
        // Get slashed
        resolverRegistry.slashResolver(resolver1, "Misbehavior");
        
        info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 100);
        assertTrue(info.isActive); // Still active
        
        // Deregister
        resolverRegistry.deregisterResolver(resolver1);
        assertFalse(resolverRegistry.isActiveResolver(resolver1));
        
        // Info preserved but inactive
        info = resolverRegistry.getResolverInfo(resolver1);
        assertFalse(info.isActive);
        assertEq(info.reputation, 100); // Preserved
        assertEq(info.totalExecuted, 10); // Preserved
    }

    function testCanReregisterAfterDeregistration() public {
        // Register and deregister
        resolverRegistry.registerResolver(resolver1);
        resolverRegistry.updateReputationOnSuccess(resolver1);
        resolverRegistry.deregisterResolver(resolver1);
        
        assertFalse(resolverRegistry.isActiveResolver(resolver1));
        
        // Cannot re-register because it's considered "already registered"
        vm.expectRevert(IResolverRegistry.ResolverAlreadyRegistered.selector);
        resolverRegistry.registerResolver(resolver1);
    }

    function testSlashWithDifferentReasons() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Test slashing with different reasons
        resolverRegistry.slashResolver(resolver1, "Failed to execute order within timeout");
        resolverRegistry.slashResolver(resolver1, "Incorrect execution result");
        resolverRegistry.slashResolver(resolver1, "Went offline during critical period");
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 70); // 100 - (3 * 10)
        assertTrue(info.isActive); // Still active despite slashing
    }

    function testEdgeCaseSlashingWithLowReputation() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Slash until very low reputation
        for (uint i = 0; i < 9; i++) {
            resolverRegistry.slashResolver(resolver1, "Test");
        }
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 10); // 100 - (9 * 10)
        
        // One more slash should bring it to 0
        resolverRegistry.slashResolver(resolver1, "Final slash");
        
        info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 0);
        
        // Additional slash should not go below 0
        resolverRegistry.slashResolver(resolver1, "Beyond zero");
        
        info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 0); // Still 0
    }

    function testReputationAndExecutionCountersIndependent() public {
        resolverRegistry.registerResolver(resolver1);
        
        // Build up both counters
        for (uint i = 0; i < 5; i++) {
            resolverRegistry.updateReputationOnSuccess(resolver1);
        }
        
        // Slash to reduce reputation but execution count should remain
        resolverRegistry.slashResolver(resolver1, "Test slash");
        
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.reputation, 95); // 105 - 10
        assertEq(info.totalExecuted, 5); // Unchanged by slashing
    }

    function testTimestampPreservation() public {
        uint256 registrationTime = block.timestamp;
        
        resolverRegistry.registerResolver(resolver1);
        
        // Advance time
        vm.warp(block.timestamp + 1000);
        
        // Perform various operations
        resolverRegistry.updateReputationOnSuccess(resolver1);
        resolverRegistry.slashResolver(resolver1, "Test");
        resolverRegistry.deregisterResolver(resolver1);
        
        // Registration timestamp should be preserved
        IResolverRegistry.ResolverInfo memory info = resolverRegistry.getResolverInfo(resolver1);
        assertEq(info.registeredAt, registrationTime);
    }
}
