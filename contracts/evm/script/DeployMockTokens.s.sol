// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import "../src/MockERC20.sol";

/**
 * @title DeployMockTokens
 * @notice Deploy mock tokens for testing cross-chain swaps
 * @dev Usage: 
 *   forge script script/DeployMockTokens.s.sol --rpc-url $ETHEREUM_SEPOLIA_RPC_URL --broadcast --verify
 *   forge script script/DeployMockTokens.s.sol --rpc-url $AVALANCHE_FUJI_RPC_URL --broadcast --verify
 *   forge script script/DeployMockTokens.s.sol --rpc-url $ARBITRUM_SEPOLIA_RPC_URL --broadcast --verify
 */
contract DeployMockTokens is Script {
    
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
        console.log("Deploying Mock Tokens to testnet");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer address:", deployer);
        console.log("Block number:", block.number); 
        
        // Check deployer balance
        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "ETH");
        require(balance > 0.01 ether, "Insufficient balance for deployment");
        
        // Start broadcasting transactions to the real testnet
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy mock tokens with initial supply
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 6, 1000000e6); // 1M USDC 
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 18, 1000000e18); // 1M WETH
        MockERC20 wbtc = new MockERC20("Wrapped Bitcoin", "WBTC", 8, 100000e8); // 100K WBTC 
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        console.log("===========================================");
        console.log("Mock Tokens deployed successfully!");
        console.log("===========================================");
        console.log("USDC:", address(usdc)); 
        console.log("WETH:", address(weth));
        console.log("WBTC:", address(wbtc)); 
         
        // Print environment variables for this chain
        _printEnvironmentVariables(address(usdc),   address(weth), address(wbtc) );
    }
    
    function _printEnvironmentVariables(
        address usdc,  
        address weth, 
        address wbtc
    ) internal view {
        string memory chainName = _getChainName(block.chainid);
        console.log("\n=== Environment Variables ===");
        console.log(string(abi.encodePacked(chainName, "_USDC=")), usdc); 
        console.log(string(abi.encodePacked(chainName, "_WETH=")), weth);
        console.log(string(abi.encodePacked(chainName, "_WBTC=")), wbtc); 
        
        console.log("\n=== Mint More Tokens (if needed) ===");
        console.log("Use MockERC20.mint(address to, uint256 amount) function");
        console.log("All tokens have public mint function for testing");
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
