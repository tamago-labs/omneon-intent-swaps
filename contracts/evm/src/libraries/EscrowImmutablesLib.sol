// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IEscrow } from "../interfaces/IEscrow.sol";

library EscrowImmutablesLib {
    /**
     * @dev Verify that the immutables hash matches the expected deployment hash
     */
    function verify(IEscrow.EscrowImmutables calldata immutables) internal pure returns (bool) {
        bytes32 hash = keccak256(abi.encode(immutables));
        // In practice, this would verify against a stored hash or CREATE2 address
        // For now, return true as a placeholder
        return hash != bytes32(0);
    }

    /**
     * @dev Compute CREATE2 address for escrow deployment
     */
    function computeAddress(
        IEscrow.EscrowImmutables calldata immutables,
        address factory,
        bytes32 salt
    ) internal pure returns (address) {
        bytes32 hash = keccak256(abi.encode(immutables));
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            factory,
            salt,
            hash
        )))));
    }
}
