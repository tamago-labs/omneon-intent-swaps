"use client"

import React from 'react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { Loader2 } from 'lucide-react'

interface SUIWalletOptionsProps {
  onConnect: () => void
}

const SUIWalletOptions = ({ onConnect }: SUIWalletOptionsProps) => {
  const account = useCurrentAccount()

  React.useEffect(() => {
    if (account) {
      onConnect()
    }
  }, [account, onConnect])

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-400 mb-4">
        Click below to connect your SUI wallet
      </div>
      
      {/* Custom styled SUI Connect Button */}
      <div className="sui-connect-wrapper">
        <ConnectButton />
      </div>
      
      <style jsx global>{`
        .sui-connect-wrapper .dui-button {
          width: 100% !important;
          background: rgb(51 65 85 / 0.5) !important;
          border: none !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1rem !important;
          color: white !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
        }
        
        .sui-connect-wrapper .dui-button:hover {
          background: rgb(51 65 85) !important;
        }
        
        .sui-connect-wrapper .dui-button:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </div>
  )
}

export default SUIWalletOptions
