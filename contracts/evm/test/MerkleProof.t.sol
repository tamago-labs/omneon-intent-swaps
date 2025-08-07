// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Test } from "forge-std/Test.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { IntentRFQ } from "../src/IntentRFQ.sol";
import { ResolverRegistry } from "../src/ResolverRegistry.sol";
import { IIntentRFQ } from "../src/interfaces/IIntentRFQ.sol";

contract MerkleProofTest is Test {
    IntentRFQ intentRFQ;
    ResolverRegistry resolverRegistry;
    
    address resolver = address(0x2);

    function setUp() public {
        resolverRegistry = new ResolverRegistry();
        intentRFQ = new IntentRFQ(address(resolverRegistry));
        resolverRegistry.registerResolver(resolver);
    }

    function testMerkleProofWithTwoOrders() public {
        // Create two order IDs
        bytes32 order1 = keccak256("order1");
        bytes32 order2 = keccak256("order2");
        
        // Create leaves (how we hash order IDs)
        bytes32 leaf1 = keccak256(abi.encodePacked(order1));
        bytes32 leaf2 = keccak256(abi.encodePacked(order2));
        
        // Create merkle tree manually for 2 leaves
        bytes32 root = keccak256(abi.encodePacked(
            leaf1 <= leaf2 ? leaf1 : leaf2,
            leaf1 <= leaf2 ? leaf2 : leaf1
        ));
        
        // Update completed orders root
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(root);
        
        // Create proof for order1
        bytes32[] memory proof1 = new bytes32[](1);
        proof1[0] = leaf2; // order1's sibling is order2
        
        // Create proof for order2  
        bytes32[] memory proof2 = new bytes32[](1);
        proof2[0] = leaf1; // order2's sibling is order1
        
        // Verify both orders are in completed status
        assertTrue(intentRFQ.verifyOrderStatus(
            order1,
            IIntentRFQ.OrderStatus.Completed,
            proof1
        ));
        
        assertTrue(intentRFQ.verifyOrderStatus(
            order2,
            IIntentRFQ.OrderStatus.Completed,
            proof2
        ));
        
        // Test non-existent order fails
        bytes32 fakeOrder = keccak256("fake");
        bytes32[] memory fakeProof = new bytes32[](1);
        fakeProof[0] = leaf1;
        
        assertFalse(intentRFQ.verifyOrderStatus(
            fakeOrder,
            IIntentRFQ.OrderStatus.Completed,
            fakeProof
        ));
    }

    function testMerkleProofWithSingleOrder() public {
        bytes32 order = keccak256("single_order");
        bytes32 leaf = keccak256(abi.encodePacked(order));
        
        // For single leaf, root equals leaf
        bytes32 root = leaf;
        
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(root);
        
        // Empty proof for single leaf tree
        bytes32[] memory emptyProof = new bytes32[](0);
        
        assertTrue(intentRFQ.verifyOrderStatus(
            order,
            IIntentRFQ.OrderStatus.Completed,
            emptyProof
        ));
    }

    function testOpenZeppelinMerkleProofDirectly() public {
        // Test OpenZeppelin's MerkleProof directly
        bytes32 leaf = keccak256("test_leaf");
        bytes32 root = leaf;
        bytes32[] memory emptyProof = new bytes32[](0);
        
        // This should work for single leaf tree
        assertTrue(MerkleProof.verify(emptyProof, root, leaf));
        
        // This should fail with wrong leaf
        bytes32 wrongLeaf = keccak256("wrong_leaf");
        assertFalse(MerkleProof.verify(emptyProof, root, wrongLeaf));
    }

    function testGetOrderStatusWithMultipleProofs() public {
        bytes32 order = keccak256("test_order");
        bytes32 leaf = keccak256(abi.encodePacked(order));
        
        // Set order as completed
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(leaf);
        
        bytes32[] memory emptyProof = new bytes32[](0);
        
        // Should return Completed when correct proof provided
        IIntentRFQ.OrderStatus status = intentRFQ.getOrderStatus(
            order,
            emptyProof, // pending proof (empty)
            emptyProof, // completed proof (valid)
            emptyProof  // cancelled proof (empty)
        );
        
        assertEq(uint8(status), uint8(IIntentRFQ.OrderStatus.Completed));
        
        // Test precedence: completed > cancelled > pending
        vm.prank(resolver);
        intentRFQ.updateCancelledOrdersRoot(leaf); // Also set as cancelled
        
        status = intentRFQ.getOrderStatus(
            order,
            emptyProof, // pending
            emptyProof, // completed (should win)
            emptyProof  // cancelled
        );
        
        // Should still return Completed (has precedence)
        assertEq(uint8(status), uint8(IIntentRFQ.OrderStatus.Completed));
    }
}
