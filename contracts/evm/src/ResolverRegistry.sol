// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;
 
import { IResolverRegistry } from "./interfaces/IResolverRegistry.sol";

contract ResolverRegistry is IResolverRegistry {

    mapping(address => ResolverInfo) public resolvers;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerResolver(address resolverAddress) external override onlyOwner {
        if (resolvers[msg.sender].registeredAt > 0) revert ResolverAlreadyRegistered();
        
        resolvers[resolverAddress] = ResolverInfo({
            isActive: true,
            reputation: 100, // Starting reputation
            totalExecuted: 0,
            registeredAt: block.timestamp
        });
        
        emit ResolverRegistered(resolverAddress);
    }

    function deregisterResolver() external override onlyOwner {
        resolvers[msg.sender].isActive = false;
        
        emit ResolverDeregistered(msg.sender);
    }

    function updateReputationOnSuccess(address resolver) external onlyOwner {
        ResolverInfo storage info = resolvers[resolver];
        if (info.isActive) {
            info.totalExecuted++;
            if (info.reputation < 1000) {
                info.reputation += 1;
            }
        }
    }

    function slashResolver(address resolver, string calldata reason) external override onlyOwner {
        ResolverInfo storage info = resolvers[resolver];
        if (!info.isActive) revert ResolverNotActive();
        
        // Reputation penalty
        if (info.reputation >= 10) {
            info.reputation -= 10;
        }
        
        emit ResolverSlashed(resolver, reason);
    }

    function isActiveResolver(address resolver) external view override returns (bool) {
        return resolvers[resolver].isActive;
    }

    function getResolverInfo(address resolver) external view override returns (ResolverInfo memory) {
        return resolvers[resolver];
    }

}