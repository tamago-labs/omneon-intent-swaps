"use client"

import React from 'react'
import { useWalletInfo } from '../../hooks/useWalletInfo'

const WalletStatus = () => {
  const {
    walletType,
    isConnected,
    address,
    chainInfo,
    isEVMConnected,
    isSUIConnected
  } = useWalletInfo()

  if (!isConnected) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-slate-400">No wallet connected</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-white font-semibold mb-3">Wallet Status</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Type:</span>
          <span className="text-white font-mono">{walletType?.toUpperCase()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Connected:</span>
          <span className="text-green-400">✓ Yes</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-400">Address:</span>
          <span className="text-white font-mono">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
          </span>
        </div>
        
        {chainInfo && (
          <div className="flex justify-between">
            <span className="text-slate-400">Chain:</span>
            <span className="text-white">{chainInfo.name}</span>
          </div>
        )}
        
        <div className="pt-2 border-t border-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">EVM:</span>
            <span className={isEVMConnected ? "text-green-400" : "text-slate-500"}>
              {isEVMConnected ? "✓" : "✗"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-slate-400">SUI:</span>
            <span className={isSUIConnected ? "text-green-400" : "text-slate-500"}>
              {isSUIConnected ? "✓" : "✗"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletStatus
