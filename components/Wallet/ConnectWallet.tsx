"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Wallet, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect } from 'wagmi'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useWalletType } from '../../lib/wallet-type-context'
import EVMWalletOptions from './EVMWalletOptions'
import SUIWalletOptions from './SUIWalletOptions'

const ConnectWallet = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [selectedWalletType, setSelectedWalletType] = useState<'evm' | 'sui' | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { walletType, setWalletType } = useWalletType()
  const { address: evmAddress, isConnected: isEVMConnected } = useAccount()
  const { disconnect: disconnectEVM } = useDisconnect()
  const suiAccount = useCurrentAccount()

  const isConnected = isEVMConnected || !!suiAccount
  const connectedAddress = evmAddress || suiAccount?.address

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

  const handleDisconnect = () => {
    if (walletType === 'evm' && isEVMConnected) {
      disconnectEVM()
    }
    // SUI disconnect is handled by the SUI components
    setWalletType(null)
    setIsOpen(false)
  }

  const handleWalletTypeSelect = (type: 'evm' | 'sui') => {
    setSelectedWalletType(type)
    setShowWalletOptions(true)
  }

  const handleWalletConnected = (type: 'evm' | 'sui') => {
    setWalletType(type)
    setIsOpen(false)
    setShowWalletOptions(false)
    setSelectedWalletType(null)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && connectedAddress) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          <Wallet size={16} />
          <span className="hidden sm:inline">{formatAddress(connectedAddress)}</span>
          <span className="sm:hidden">Connected</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
            >
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${walletType === 'evm' ? 'bg-blue-500' : 'bg-cyan-500'}`} />
                  <span className="text-xs text-slate-400 uppercase font-medium">
                    {walletType === 'evm' ? 'EVM Wallet' : 'SUI Wallet'}
                  </span>
                </div>
                <div className="text-white font-mono text-sm">{formatAddress(connectedAddress)}</div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-slate-700 rounded transition-colors"
                >
                  <LogOut size={16} />
                  Disconnect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all"
      > 
        <span>Connect Wallet</span>
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
                <h3 className="text-white font-semibold mb-3">Choose Wallet Type</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleWalletTypeSelect('evm')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <img className="w-6 h-6 rounded-full"  src="https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png"/>
                    </div> 
                    <div className="text-left">
                      <div className="text-white font-medium">EVM Wallets</div>
                      <div className="text-slate-400 text-sm">MetaMask, Phantom, Nightly</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleWalletTypeSelect('sui')}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <img className="w-6 h-6 rounded-full"  src="https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png"/>
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">SUI Wallets</div>
                      <div className="text-slate-400 text-sm">Slush Wallet, Suiet, Martian</div>
                    </div>
                  </button>
                </div>
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
                    {selectedWalletType === 'evm' ? 'EVM Wallets' : 'SUI Wallets'}
                  </h3>
                </div>
                
                {selectedWalletType === 'evm' ? (
                  <EVMWalletOptions onConnect={() => handleWalletConnected('evm')} />
                ) : (
                  <SUIWalletOptions onConnect={() => handleWalletConnected('sui')} />
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
