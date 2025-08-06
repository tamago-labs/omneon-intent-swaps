"use client"

import React from 'react'
import { useConnect, useAccount } from 'wagmi'
import { Loader2 } from 'lucide-react'

interface EVMWalletOptionsProps {
  onConnect: () => void
}

const EVMWalletOptions = ({ onConnect }: EVMWalletOptionsProps) => {
  const { connectors, connect, isPending } = useConnect()
  const { isConnected } = useAccount()

  React.useEffect(() => {
    if (isConnected) {
      onConnect()
    }
  }, [isConnected, onConnect])

  const getConnectorIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('metamask')) return '🦊'
    if (lowerName.includes('walletconnect')) return '🔗'
    if (lowerName.includes('coinbase')) return '🔵'
    if (lowerName.includes('injected')) return '💻'
    return '🔌'
  }

  return (
    <div className="space-y-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-xl">{getConnectorIcon(connector.name)}</span>
          <span className="text-white font-medium">{connector.name}</span>
          {isPending && <Loader2 size={16} className="animate-spin text-slate-400 ml-auto" />}
        </button>
      ))}
    </div>
  )
}

export default EVMWalletOptions
