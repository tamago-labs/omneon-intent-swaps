// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/ResolverRegistry.sol";

contract RegisterResolverScript is Script {

    address constant RESOLVER_REGISTRY = 0x10FeBd90D273858Af2B7d93094b1822838ddC511; 
    address constant NEW_RESOLVER = 0x91C65f404714Ac389b38335CccA4A876a8669d32;

    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 ownerPrivateKey;

        // Normalize 0x prefix
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            ownerPrivateKey = vm.parseUint(privateKeyString);
        } else {
            ownerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }

        address owner = vm.addr(ownerPrivateKey);
        console.log("===========================================");
        console.log("Register Resolver Script");
        console.log("===========================================");
        console.log("Owner address:", owner);
        console.log("Chain ID:", block.chainid);

        if (RESOLVER_REGISTRY == address(0)) {
            console.log("Please set RESOLVER_REGISTRY to your deployed address.");
            return;
        }

        ResolverRegistry registry = ResolverRegistry(RESOLVER_REGISTRY);

        vm.startBroadcast(ownerPrivateKey);

        console.log("Registering resolver...");
        registry.registerResolver(NEW_RESOLVER); 
        console.log("Resolver registered:", NEW_RESOLVER);

        vm.stopBroadcast();
        console.log("Script completed successfully!");
    }
}
