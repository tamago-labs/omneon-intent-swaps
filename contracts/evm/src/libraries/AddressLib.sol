// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

type Address is uint256;

library AddressLib {
    function get(Address a) internal pure returns (address) {
        return address(uint160(uint256(Address.unwrap(a))));
    }

    function toAddress(address a) internal pure returns (Address) {
        return Address.wrap(uint256(uint160(a)));
    }
}
