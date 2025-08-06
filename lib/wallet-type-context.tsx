"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type WalletType = 'evm' | 'sui' | null

interface WalletTypeContextType {
  walletType: WalletType
  setWalletType: (type: WalletType) => void
}

const WalletTypeContext = createContext<WalletTypeContextType | undefined>(undefined)

export function WalletTypeProvider({ children }: { children: ReactNode }) {
  const [walletType, setWalletType] = useState<WalletType>(null)

  return (
    <WalletTypeContext.Provider value={{ walletType, setWalletType }}>
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
