// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { MerkleProof } from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { SafeERC20 } from "./libraries/SafeERC20.sol";
import { IIntentRFQ } from "./interfaces/IIntentRFQ.sol";
import { IResolverRegistry } from "./interfaces/IResolverRegistry.sol";
import { AddressLib, Address } from "./libraries/AddressLib.sol";

/**
 * @title IntentRFQ
 * @dev An intent-based swap contract using off-chain resolvers and Merkle tree proofs 
 *      to track and validate order execution statuses.
 */

contract IntentRFQ is IIntentRFQ {
    using SafeERC20 for IERC20;
    using AddressLib for address;
    using AddressLib for Address;

    IResolverRegistry public immutable resolverRegistry;
    
    // Merkle roots for different order statuses
    bytes32 public pendingOrdersRoot;
    bytes32 public completedOrdersRoot; 
    bytes32 public cancelledOrdersRoot;
    
    mapping(address => uint256) public collectedFees; // token => amount
    
    address public owner;
    uint256 public feeRate = 30; // 0.3% in basis points (30/10000 = 0.003)
    uint256 public constant MAX_FEE_RATE = 50; // 0.5% maximum

    address constant NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
     
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorizedUpdater() {
        require(
            resolverRegistry.isActiveResolver(msg.sender) || msg.sender == owner,
            "Not authorized to update status"
        );
        _;
    }

    constructor(address _resolverRegistry) {
        resolverRegistry = IResolverRegistry(_resolverRegistry);
        owner = msg.sender;
    }

    /**
     * @dev User creates order and sends tokens directly to resolver
     */
    function createOrder(
        ChainType sourceType,
        uint256 sourceChainId,
        address tokenIn,
        uint256 amountIn,
        ChainType destType,
        uint256 destChainId,
        address tokenOut,
        uint256 minAmountOut,
        address resolver
    ) external returns (bytes32 intentId) {
        
        require(resolverRegistry.isActiveResolver(resolver), "Invalid resolver");
        require(amountIn > 0 && minAmountOut > 0, "Invalid amounts");

        intentId = keccak256(abi.encode(
            msg.sender,
            sourceType,
            sourceChainId,
            tokenIn,
            amountIn,
            destType,
            destChainId,
            tokenOut,
            minAmountOut,
            resolver,
            block.timestamp,
            block.chainid
        ));

        // Calculate fee
        uint256 feeAmount = (amountIn * feeRate) / 10000;
        uint256 amountToResolver = amountIn - feeAmount;

        // Transfer ERC20 tokens only
        require(tokenIn != NATIVE_TOKEN, "Native tokens not supported");
        
        // Transfer total from user to contract first
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Keep fee in contract
        if (feeAmount > 0) {
            collectedFees[tokenIn] += feeAmount;
        }
        
        // Send remaining to resolver
        IERC20(tokenIn).safeTransfer(resolver, amountToResolver);

        emit OrderCreated(
            intentId,
            msg.sender, 
            resolver
        );

        // Order is automatically added to pending status (tracked off-chain)
    }

    /**
     * @dev Update pending orders merkle root
     */
    function updatePendingOrdersRoot(bytes32 newRoot) external onlyAuthorizedUpdater {
        bytes32 oldRoot = pendingOrdersRoot;
        pendingOrdersRoot = newRoot;
        emit PendingOrdersRootUpdated(oldRoot, newRoot, msg.sender);
    }

    /**
     * @dev Update completed orders merkle root
     */
    function updateCompletedOrdersRoot(bytes32 newRoot) external onlyAuthorizedUpdater {
        bytes32 oldRoot = completedOrdersRoot;
        completedOrdersRoot = newRoot;
        emit CompletedOrdersRootUpdated(oldRoot, newRoot, msg.sender);
    }

    /**
     * @dev Update cancelled orders merkle root
     */
    function updateCancelledOrdersRoot(bytes32 newRoot) external onlyAuthorizedUpdater {
        bytes32 oldRoot = cancelledOrdersRoot;
        cancelledOrdersRoot = newRoot;
        emit CancelledOrdersRootUpdated(oldRoot, newRoot, msg.sender);
    }

    /**
     * @dev Batch update all status roots
     */
    function updateAllStatusRoots(
        bytes32 newPendingRoot,
        bytes32 newCompletedRoot,
        bytes32 newCancelledRoot
    ) external onlyAuthorizedUpdater {
        bytes32 oldPendingRoot = pendingOrdersRoot;
        bytes32 oldCompletedRoot = completedOrdersRoot;
        bytes32 oldCancelledRoot = cancelledOrdersRoot;

        pendingOrdersRoot = newPendingRoot;
        completedOrdersRoot = newCompletedRoot;
        cancelledOrdersRoot = newCancelledRoot;

        emit BatchStatusRootsUpdated(
            oldPendingRoot, newPendingRoot,
            oldCompletedRoot, newCompletedRoot,
            oldCancelledRoot, newCancelledRoot,
            msg.sender
        );
    }

    /**
     * @dev Verify if an order is in a specific status (using merkle proof)
     */
    function verifyOrderStatus(
        bytes32 intentId,
        OrderStatus status,
        bytes32[] calldata proof
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(intentId));
        bytes32 root;

        if (status == OrderStatus.Pending) {
            root = pendingOrdersRoot;
        } else if (status == OrderStatus.Completed) {
            root = completedOrdersRoot;
        } else if (status == OrderStatus.Cancelled) {
            root = cancelledOrdersRoot;
        } else {
            return false;
        }

        if (root == bytes32(0)) return false;
        return MerkleProof.verify(proof, root, leaf);
    }

    /**
     * @dev Get order status by checking all merkle trees
     */
    function getOrderStatus(
        bytes32 intentId,
        bytes32[] calldata pendingProof,
        bytes32[] calldata completedProof,
        bytes32[] calldata cancelledProof
    ) external view returns (OrderStatus) {
        bytes32 leaf = keccak256(abi.encodePacked(intentId));

        if (completedOrdersRoot != bytes32(0) && MerkleProof.verify(completedProof, completedOrdersRoot, leaf)) {
            return OrderStatus.Completed;
        }
        if (cancelledOrdersRoot != bytes32(0) && MerkleProof.verify(cancelledProof, cancelledOrdersRoot, leaf)) {
            return OrderStatus.Cancelled;
        }
        if (pendingOrdersRoot != bytes32(0) && MerkleProof.verify(pendingProof, pendingOrdersRoot, leaf)) {
            return OrderStatus.Pending;
        }
        
        return OrderStatus.Unknown;
    }

    /**
     * @dev Owner withdraws collected fees
     */
    function withdrawFees(address token, uint256 amount) external onlyOwner {
        require(collectedFees[token] >= amount, "Insufficient fees");
        
        collectedFees[token] -= amount;
        
        if (token == NATIVE_TOKEN) {
            (bool success, ) = owner.call{value: amount}("");
            require(success, "ETH withdrawal failed");
        } else {
            IERC20(token).safeTransfer(owner, amount);
        }

        emit FeesWithdrawn(token, amount);
    }

    /**
     * @dev Owner updates fee rate (max 0.5%)
     */
    function setFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= MAX_FEE_RATE, "Fee rate too high");
        uint256 oldFeeRate = feeRate;
        feeRate = newFeeRate;
        emit FeeRateUpdated(oldFeeRate, newFeeRate);
    }

    /**
     * @dev Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }

    /**
     * @dev Get collected fees for a token
     */
    function getCollectedFees(address token) external view returns (uint256) {
        return collectedFees[token];
    }

    /**
     * @dev Calculate fee for an amount
     */
    function calculateFee(uint256 amount) external view returns (uint256) {
        return (amount * feeRate) / 10000;
    }

    /**
     * @dev Get all current status roots
     */
    function getStatusRoots() external view returns (
        bytes32 pending,
        bytes32 completed,
        bytes32 cancelled
    ) {
        return (pendingOrdersRoot, completedOrdersRoot, cancelledOrdersRoot);
    }

    receive() external payable {}
}
