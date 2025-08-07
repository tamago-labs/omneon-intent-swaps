"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface WalletConnection {
  evm: string | null
  sui: string | null
}

interface WalletTypeContextType {
  wallets: WalletConnection
  setEVMWallet: (address: string | null) => void
  setSUIWallet: (address: string | null) => void
  getConnectedCount: () => number
  isEVMConnected: () => boolean
  isSUIConnected: () => boolean
}

const WalletTypeContext = createContext<WalletTypeContextType | undefined>(undefined)

export function WalletTypeProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<WalletConnection>({
    evm: null,
    sui: null
  })

  const setEVMWallet = (address: string | null) => {
    setWallets(prev => ({ ...prev, evm: address }))
  }

  const setSUIWallet = (address: string | null) => {
    setWallets(prev => ({ ...prev, sui: address }))
  }

  const getConnectedCount = () => {
    let count = 0
    if (wallets.evm) count++
    if (wallets.sui) count++
    return count
  }

  const isEVMConnected = () => !!wallets.evm
  const isSUIConnected = () => !!wallets.sui

  return (
    <WalletTypeContext.Provider value={{ 
      wallets, 
      setEVMWallet, 
      setSUIWallet, 
      getConnectedCount, 
      isEVMConnected, 
      isSUIConnected 
    }}>
      {children}
    </WalletTypeContext.Provider>
  )
}

export function useWalletType() {
  const context = useContext(WalletTypeContext)
  if (context === undefined) {
    throw new Error('useWalletType must be used within a WalletTypeProvider')
  }
  return context
}