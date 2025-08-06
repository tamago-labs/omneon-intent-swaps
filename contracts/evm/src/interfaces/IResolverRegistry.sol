// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

interface IResolverRegistry {
    struct ResolverInfo {
        bool isActive; 
        uint256 reputation;
        uint256 totalExecuted;
        uint256 registeredAt;
    }

    error ResolverNotActive();  
    error ResolverAlreadyRegistered();

    event ResolverRegistered(address indexed resolver);
    event ResolverDeregistered(address indexed resolver);
    event ResolverSlashed(address indexed resolver, string reason);
    
    function registerResolver(address resolverAddress) external;
    function deregisterResolver() external;
    function slashResolver(address resolver, string calldata reason) external;
 
    
    function isActiveResolver(address resolver) external view returns (bool);
    function getResolverInfo(address resolver) external view returns (ResolverInfo memory);
   
}
