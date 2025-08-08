"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect } from 'wagmi'
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { useWalletType } from '../../lib/wallet-type-context'
import EVMWalletOptions from './EVMWalletOptions'
import SUIWalletOptions from './SUIWalletOptions'

const ConnectWallet = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [selectedWalletType, setSelectedWalletType] = useState<'evm' | 'sui' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { wallets, setEVMWallet, setSUIWallet, getConnectedCount, isEVMConnected, isSUIConnected } = useWalletType()
  const { address: evmAddress, isConnected: isEVMWalletConnected } = useAccount()
  const { disconnect: disconnectEVM } = useDisconnect()
  const suiAccount = useCurrentAccount()
  const { mutate: disconnectSUI } = useDisconnectWallet()

  const connectedCount = getConnectedCount()

  // Auto-sync with actual wallet states 
  useEffect(() => {
    if (isEVMWalletConnected && evmAddress) {
      setEVMWallet(evmAddress)
    } else if (!isEVMWalletConnected) {
      setEVMWallet(null)
    }
  }, [isEVMWalletConnected, evmAddress])  

  useEffect(() => {
    if (suiAccount?.address) {
      setSUIWallet(suiAccount.address)
    } else if (!suiAccount) {
      setSUIWallet(null)
    }
  }, [suiAccount?.address]) 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowWalletOptions(false)
        setSelectedWalletType(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDisconnect = async (walletType: 'evm' | 'sui') => {
    try {
      if (walletType === 'evm') {
        disconnectEVM()
      } else if (walletType === 'sui') {
        disconnectSUI()
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
    }
  }

  const handleWalletTypeSelect = (type: 'evm' | 'sui') => {
    setSelectedWalletType(type)
    setShowWalletOptions(true)
  }

  const handleWalletConnected = () => {
    setIsOpen(false)
    setShowWalletOptions(false)
    setSelectedWalletType(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getButtonText = () => {
    if (connectedCount === 0) return 'Connect Wallet'
    if (connectedCount === 1) return '1 Connected'
    return '2 Connected'
  }

  const getButtonColor = () => {
    if (connectedCount === 0) return 'from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
    if (connectedCount === 1) return 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
    return 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-gradient-to-r ${getButtonColor()} text-white font-medium transition-all shadow-lg hover:shadow-xl`}
      > 
        <span>{getButtonText()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
          >
            {!showWalletOptions ? (
              <div className="p-4">
                <h3 className="text-white font-semibold mb-4">
                  Wallet Connections ({connectedCount}/2)
                </h3>
                
                {/* EVM Wallet Section */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <img className="w-5 h-5 rounded-full" src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png" alt="ETH" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">EVM Wallet</div>
                        {isEVMConnected() ? (
                          <div className="text-slate-400 text-xs font-mono">
                            {formatAddress(wallets.evm!)}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-xs">Not connected</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEVMConnected() ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <button
                            onClick={() => handleDisconnect('evm')}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <LogOut size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleWalletTypeSelect('evm')}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SUI Wallet Section */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <img className="w-5 h-5 rounded-full" src="https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png" alt="SUI" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">SUI Wallet</div>
                        {isSUIConnected() ? (
                          <div className="text-slate-400 text-xs font-mono">
                            {formatAddress(wallets.sui!)}
                          </div>
                        ) : (
                          <div className="text-slate-500 text-xs">Not connected</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSUIConnected() ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <button
                            onClick={() => handleDisconnect('sui')}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <LogOut size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleWalletTypeSelect('sui')}
                          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {connectedCount === 2 && (
                  <div className="text-center text-slate-400 text-sm">
                    ✅ for cross-chain trading
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      setShowWalletOptions(false)
                      setSelectedWalletType(null)
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <h3 className="text-white font-semibold">
                    Connect {selectedWalletType === 'evm' ? 'EVM' : 'SUI'} Wallet
                  </h3>
                </div>
                
                {selectedWalletType === 'evm' ? (
                  <EVMWalletOptions onConnect={handleWalletConnected} />
                ) : (
                  <SUIWalletOptions onConnect={handleWalletConnected} />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConnectWallet