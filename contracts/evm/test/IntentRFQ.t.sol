// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Test } from "forge-std/Test.sol";
import { IntentRFQ } from "../src/IntentRFQ.sol";
import { ResolverRegistry } from "../src/ResolverRegistry.sol";
import { MockERC20 } from "../src/MockERC20.sol";
import { IIntentRFQ } from "../src/interfaces/IIntentRFQ.sol";

contract IntentRFQTest is Test {
    IntentRFQ intentRFQ;
    ResolverRegistry resolverRegistry;
    MockERC20 usdc;
    MockERC20 weth;

    address user = address(0x1);
    address resolver = address(0x2);
    address owner = address(this);
    
    address constant NATIVE = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    function setUp() public {
        resolverRegistry = new ResolverRegistry();
        intentRFQ = new IntentRFQ(address(resolverRegistry));
        
        usdc = new MockERC20("USD Coin", "USDC", 6, 1000000e6);
        weth = new MockERC20("Wrapped Ether", "WETH", 18, 1000e18);

        // Register resolver
        resolverRegistry.registerResolver(resolver);

        // Setup user with tokens
        deal(user, 10 ether);
        usdc.mint(user, 10000e6);
        weth.mint(user, 10e18);
    }

    function testCreateOrderWithERC20() public {
        vm.startPrank(user);
        
        uint256 amountIn = 1000e6; // 1000 USDC
        uint256 expectedFee = intentRFQ.calculateFee(amountIn);
        uint256 expectedToResolver = amountIn - expectedFee;

        usdc.approve(address(intentRFQ), amountIn);

        bytes32 intentId = intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,     // sourceType
            1,                            // sourceChainId
            address(usdc),                // tokenIn
            amountIn,                     // amountIn
            IIntentRFQ.ChainType.SOLANA,  // destType
            0,                            // destChainId
            address(weth),                // tokenOut
            1e17,                         // minAmountOut (0.1 WETH)
            resolver                      // resolver
        );

        assertNotEq(intentId, bytes32(0));
        
        // Check resolver received tokens minus fee
        assertEq(usdc.balanceOf(resolver), expectedToResolver);
        
        // Check fee was collected in contract
        assertEq(intentRFQ.getCollectedFees(address(usdc)), expectedFee);
        
        vm.stopPrank();
    }

    function testCreateOrderWithWETH() public {
        vm.startPrank(user);
        
        uint256 amountIn = 1e18; // 1 WETH
        uint256 expectedFee = intentRFQ.calculateFee(amountIn);
        uint256 expectedToResolver = amountIn - expectedFee;

        weth.approve(address(intentRFQ), amountIn);

        bytes32 intentId = intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,     // sourceType
            1,                            // sourceChainId (Ethereum)
            address(weth),                // tokenIn
            amountIn,                     // amountIn
            IIntentRFQ.ChainType.SUI,     // destType
            0,                            // destChainId (SUI)
            address(usdc),                // tokenOut
            3000e6,                       // minAmountOut
            resolver                      // resolver
        );

        assertNotEq(intentId, bytes32(0));
        
        // Check resolver received tokens minus fee
        assertEq(weth.balanceOf(resolver), expectedToResolver);
        
        // Check fee was collected
        assertEq(intentRFQ.getCollectedFees(address(weth)), expectedFee);
        
        vm.stopPrank();
    }

    function testCannotCreateOrderWithNativeToken() public {
        vm.startPrank(user);
        
        vm.expectRevert("Native tokens not supported");
        intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,
            1,
            NATIVE,                       // Should fail
            1 ether,
            IIntentRFQ.ChainType.SUI,
            0,
            address(usdc),
            3000e6,
            resolver
        );
        
        vm.stopPrank();
    }

    function testUpdatePendingOrdersRoot() public {
        bytes32 newRoot = keccak256("new_pending_root");
        
        vm.prank(resolver);
        intentRFQ.updatePendingOrdersRoot(newRoot);
        
        (bytes32 pending, , ) = intentRFQ.getStatusRoots();
        assertEq(pending, newRoot);
    }

    function testUpdateCompletedOrdersRoot() public {
        bytes32 newRoot = keccak256("new_completed_root");
        
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(newRoot);
        
        (, bytes32 completed, ) = intentRFQ.getStatusRoots();
        assertEq(completed, newRoot);
    }

    function testUpdateCancelledOrdersRoot() public {
        bytes32 newRoot = keccak256("new_cancelled_root");
        
        vm.prank(resolver);
        intentRFQ.updateCancelledOrdersRoot(newRoot);
        
        (, , bytes32 cancelled) = intentRFQ.getStatusRoots();
        assertEq(cancelled, newRoot);
    }

    function testBatchUpdateAllStatusRoots() public {
        bytes32 newPendingRoot = keccak256("new_pending");
        bytes32 newCompletedRoot = keccak256("new_completed");
        bytes32 newCancelledRoot = keccak256("new_cancelled");
        
        vm.prank(resolver);
        intentRFQ.updateAllStatusRoots(
            newPendingRoot,
            newCompletedRoot,
            newCancelledRoot
        );
        
        (bytes32 pending, bytes32 completed, bytes32 cancelled) = intentRFQ.getStatusRoots();
        assertEq(pending, newPendingRoot);
        assertEq(completed, newCompletedRoot);
        assertEq(cancelled, newCancelledRoot);
    }

    function testVerifyOrderStatusWithValidProof() public {
        bytes32 intentId = keccak256("test_order");
        bytes32 leaf = keccak256(abi.encodePacked(intentId));
        
        // Create a simple merkle tree with one leaf
        bytes32 root = leaf; // Single leaf tree
        
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(root);
        
        // Verify with empty proof (single leaf)
        bytes32[] memory emptyProof = new bytes32[](0);
        bool isValid = intentRFQ.verifyOrderStatus(
            intentId,
            IIntentRFQ.OrderStatus.Completed,
            emptyProof
        );
        
        assertTrue(isValid);
    }

    function testVerifyOrderStatusWithInvalidProof() public {
        bytes32 intentId = keccak256("test_order");
        bytes32 wrongRoot = keccak256("wrong_root");
        
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(wrongRoot);
        
        bytes32[] memory emptyProof = new bytes32[](0);
        bool isValid = intentRFQ.verifyOrderStatus(
            intentId,
            IIntentRFQ.OrderStatus.Completed,
            emptyProof
        );
        
        assertFalse(isValid);
    }

    function testGetOrderStatusReturnsCorrectStatus() public {
        bytes32 intentId = keccak256("test_order");
        bytes32 leaf = keccak256(abi.encodePacked(intentId));
        
        // Set as completed
        vm.prank(resolver);
        intentRFQ.updateCompletedOrdersRoot(leaf);
        
        bytes32[] memory emptyProof = new bytes32[](0);
        IIntentRFQ.OrderStatus status = intentRFQ.getOrderStatus(
            intentId,
            emptyProof, // pending proof
            emptyProof, // completed proof  
            emptyProof  // cancelled proof
        );
        
        assertEq(uint8(status), uint8(IIntentRFQ.OrderStatus.Completed));
    }

    function testGetOrderStatusReturnsUnknownForInvalidOrder() public {
        bytes32 intentId = keccak256("non_existent_order");
        
        bytes32[] memory emptyProof = new bytes32[](0);
        IIntentRFQ.OrderStatus status = intentRFQ.getOrderStatus(
            intentId,
            emptyProof,
            emptyProof,
            emptyProof
        );
        
        assertEq(uint8(status), uint8(IIntentRFQ.OrderStatus.Unknown));
    }

    function testOnlyAuthorizedCanUpdateRoots() public {
        bytes32 newRoot = keccak256("unauthorized_root");
        
        vm.prank(user); // user is not authorized
        vm.expectRevert("Not authorized to update status");
        intentRFQ.updatePendingOrdersRoot(newRoot);
    }

    function testOwnerCanUpdateRoots() public {
        bytes32 newRoot = keccak256("owner_root");
        
        // Owner should be able to update
        intentRFQ.updatePendingOrdersRoot(newRoot);
        
        (bytes32 pending, , ) = intentRFQ.getStatusRoots();
        assertEq(pending, newRoot);
    }

    function testWithdrawFeesERC20() public {
        // Create order to generate fees
        _createTestOrderUSDC();
        
        uint256 feeAmount = intentRFQ.getCollectedFees(address(usdc));
        uint256 ownerBalanceBefore = usdc.balanceOf(address(this));
        
        intentRFQ.withdrawFees(address(usdc), feeAmount);
        
        assertEq(usdc.balanceOf(address(this)), ownerBalanceBefore + feeAmount);
        assertEq(intentRFQ.getCollectedFees(address(usdc)), 0);
    }

    // function testWithdrawFeesETH() public {
    //     // Test that we can still withdraw ETH if somehow locked in contract
    //     deal(address(intentRFQ), 1 ether);
        
    //     uint256 ownerBalanceBefore = address(this).balance;
        
    //     intentRFQ.withdrawFees(NATIVE, 1 ether);
        
    //     assertEq(address(this).balance, ownerBalanceBefore + 1 ether);
    // }

    function testSetFeeRate() public {
        uint256 newFeeRate = 25; // 0.25%
        intentRFQ.setFeeRate(newFeeRate);
        assertEq(intentRFQ.feeRate(), newFeeRate);
    }

    function testCannotSetFeeRateTooHigh() public {
        vm.expectRevert("Fee rate too high");
        intentRFQ.setFeeRate(100); // 1% - should fail (max is 0.5%)
    }

    function testCalculateFee() public {
        uint256 amount = 1000e6;
        uint256 expectedFee = (amount * 30) / 10000; // 0.3%
        assertEq(intentRFQ.calculateFee(amount), expectedFee);
    }

    function testInvalidResolver() public {
        vm.startPrank(user);
        
        usdc.approve(address(intentRFQ), 1000e6);
        
        vm.expectRevert("Invalid resolver");
        intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,
            1,
            address(usdc),
            1000e6,
            IIntentRFQ.ChainType.SUI,
            0,
            address(weth),
            1e17,
            address(0x999) // Invalid resolver
        );
        
        vm.stopPrank();
    }

    function testCreateOrderWithDifferentChainTypes() public {
        vm.startPrank(user);
        
        // Test EVM to SUI
        usdc.approve(address(intentRFQ), 1000e6);
        bytes32 intentId1 = intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,
            1,
            address(usdc),
            1000e6,
            IIntentRFQ.ChainType.SUI,
            0,
            address(weth),
            1e17,
            resolver
        );
        
        // Test EVM to SOLANA
        weth.approve(address(intentRFQ), 1e18);
        bytes32 intentId2 = intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,
            1,
            address(weth),
            1e18,
            IIntentRFQ.ChainType.SOLANA,
            0,
            address(usdc),
            3000e6,
            resolver
        );
        
        assertNotEq(intentId1, intentId2);
        
        vm.stopPrank();
    }

    function _createTestOrderUSDC() internal returns (bytes32) {
        vm.startPrank(user);
        
        usdc.approve(address(intentRFQ), 1000e6);
        bytes32 intentId = intentRFQ.createOrder(
            IIntentRFQ.ChainType.EVM,
            1,
            address(usdc),
            1000e6,
            IIntentRFQ.ChainType.SUI,
            0,
            address(weth),
            1e17,
            resolver
        );
        
        vm.stopPrank();
        return intentId;
    }

    receive() external payable {}
}
