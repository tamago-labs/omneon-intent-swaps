// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Address } from "../libraries/AddressLib.sol";

interface IIntentRFQ {
    enum ChainType { EVM, SUI, SOLANA, APTOS, BITCOIN }
    enum OrderStatus { Unknown, Pending, Completed, Cancelled }

    error InvalidResolver();
    error InvalidAmounts();
    error NativeTokensNotSupported();
    error TransferFailed();
    error InsufficientFees();
    error FeeRateTooHigh();
    error InvalidNewOwner();
    error NotAuthorized();

    event OrderCreated(
        bytes32 indexed intentId,
        address indexed user,
        address indexed resolver
    );

    event PendingOrdersRootUpdated(
        bytes32 indexed oldRoot,
        bytes32 indexed newRoot,
        address indexed updater
    );

    event CompletedOrdersRootUpdated(
        bytes32 indexed oldRoot,
        bytes32 indexed newRoot,
        address indexed updater
    );

    event CancelledOrdersRootUpdated(
        bytes32 indexed oldRoot,
        bytes32 indexed newRoot,
        address indexed updater
    );

    event BatchStatusRootsUpdated(
        bytes32 oldPendingRoot,
        bytes32 newPendingRoot,
        bytes32 oldCompletedRoot,
        bytes32 newCompletedRoot,
        bytes32 oldCancelledRoot,
        bytes32 newCancelledRoot,
        address indexed updater
    );

    event FeesWithdrawn(
        address indexed token,
        uint256 amount
    );

    event FeeRateUpdated(
        uint256 oldRate,
        uint256 newRate
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

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
    ) external returns (bytes32 intentId);

    function updatePendingOrdersRoot(bytes32 newRoot) external;

    function updateCompletedOrdersRoot(bytes32 newRoot) external;

    function updateCancelledOrdersRoot(bytes32 newRoot) external;

    function updateAllStatusRoots(
        bytes32 newPendingRoot,
        bytes32 newCompletedRoot,
        bytes32 newCancelledRoot
    ) external;

    function verifyOrderStatus(
        bytes32 intentId,
        OrderStatus status,
        bytes32[] calldata proof
    ) external view returns (bool);

    function getOrderStatus(
        bytes32 intentId,
        bytes32[] calldata pendingProof,
        bytes32[] calldata completedProof,
        bytes32[] calldata cancelledProof
    ) external view returns (OrderStatus);

    function withdrawFees(address token, uint256 amount) external;

    function setFeeRate(uint256 newFeeRate) external;

    function getCollectedFees(address token) external view returns (uint256);

    function calculateFee(uint256 amount) external view returns (uint256);

    function getStatusRoots() external view returns (
        bytes32 pending,
        bytes32 completed,
        bytes32 cancelled
    );
}
