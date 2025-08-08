// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/IntentRFQ.sol";
import "../src/ResolverRegistry.sol";

/**
 * @title DeployIntentRFQ
 * @notice Deploy IntentRFQ and ResolverRegistry to multiple testnets 
 * @dev Usage: 
 *   forge script script/DeployIntentRFQ.s.sol --rpc-url $ETHEREUM_SEPOLIA_RPC_URL --broadcast --verify
 *   forge script script/DeployIntentRFQ.s.sol --rpc-url $AVALANCHE_FUJI_RPC_URL --broadcast --verify
 *   forge script script/DeployIntentRFQ.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC_URL --broadcast --verify
 */
contract DeployIntentRFQ is Script {
    
    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // Handle private key with or without 0x prefix
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            deployerPrivateKey = vm.parseUint(privateKeyString);
        } else {
            deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
        
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("===========================================");
        console.log("Deploying IntentRFQ to testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number); 
         
        
        // Start broadcasting transactions to the real testnet
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy ResolverRegistry first
        ResolverRegistry resolverRegistry = new ResolverRegistry();
        console.log("ResolverRegistry deployed at:", address(resolverRegistry));
        
        // Deploy IntentRFQ
        IntentRFQ intentRFQ = new IntentRFQ(address(resolverRegistry));
        console.log("IntentRFQ deployed at:", address(intentRFQ));
        
        // Register some test resolvers
        address testResolver1 = 0x1000000000000000000000000000000000000001;
        address testResolver2 = 0x2000000000000000000000000000000000000002;
        
        resolverRegistry.registerResolver(testResolver1);
        resolverRegistry.registerResolver(testResolver2);
        
        console.log("Registered test resolver 1:", testResolver1);
        console.log("Registered test resolver 2:", testResolver2);
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Deployment completed successfully!");
        console.log("===========================================");
        console.log("ResolverRegistry:", address(resolverRegistry));
        console.log("IntentRFQ:", address(intentRFQ));
        console.log("Fee Rate:", intentRFQ.feeRate(), "basis points (0.3%)");
        console.log("Max Fee Rate:", intentRFQ.MAX_FEE_RATE(), "basis points (0.5%)");
        
        // Print environment variables for this chain
        _printEnvironmentVariable(address(resolverRegistry), address(intentRFQ));
    }
    
    function _printEnvironmentVariable(address resolverRegistry, address intentRFQ) internal view {
        string memory chainName = _getChainName(block.chainid);
        console.log("\n=== Environment Variables ===");
        console.log(string(abi.encodePacked(chainName, "_RESOLVER_REGISTRY=")), address(resolverRegistry));
        console.log(string(abi.encodePacked(chainName, "_INTENT_RFQ=")), address(intentRFQ));
    }
    
    function _getChainName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 11155111) return "ETHEREUM_SEPOLIA";
        if (chainId == 43113) return "AVALANCHE_FUJI";
        if (chainId == 421614) return "ARBITRUM_SEPOLIA";
        if (chainId == 84532) return "BASE_SEPOLIA";
        if (chainId == 11155420) return "OPTIMISM_SEPOLIA";
        if (chainId == 80002) return "POLYGON_AMOY";
        return "UNKNOWN_CHAIN";
    }
}
