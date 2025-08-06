"use client"

import React from 'react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

interface SUIWalletOptionsProps {
  onConnect: () => void
}

const SUIWalletOptions = ({ onConnect }: SUIWalletOptionsProps) => {
  const account = useCurrentAccount()

  // Only call onConnect when actually connected with an account
  React.useEffect(() => {
    if (account && account.address) {
      // Small delay to ensure SUI state is fully updated
      setTimeout(() => {
        onConnect()
      }, 100)
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
        .sui-connect-wrapper [data-testid="connect-button"] {
          width: 100% !important;
          background: rgb(51 65 85 / 0.5) !important;
          border: 1px solid rgb(51 65 85) !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem 1rem !important;
          color: white !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
          font-family: inherit !important;
        }
        
        .sui-connect-wrapper [data-testid="connect-button"]:hover {
          background: rgb(51 65 85) !important;
          border-color: rgb(71 85 105) !important;
        }
        
        .sui-connect-wrapper [data-testid="connect-button"]:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        /* Style the modal if it appears */
        .sui-connect-wrapper .dui-modal {
          background: rgb(30 41 59) !important;
          border: 1px solid rgb(51 65 85) !important;
          border-radius: 0.5rem !important;
        }

        .sui-connect-wrapper .dui-modal .dui-button {
          background: rgb(51 65 85 / 0.5) !important;
          border: 1px solid rgb(51 65 85) !important;
          color: white !important;
        }
      `}</style>
    </div>
  )
}

export default SUIWalletOptions
