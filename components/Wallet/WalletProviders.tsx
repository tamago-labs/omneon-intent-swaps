"use client"

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { wagmiConfig } from '../../lib/wagmi-config'
import { suiNetworks } from '../../lib/sui-config'
import { WalletTypeProvider } from '../../lib/wallet-type-context'

// Import SUI dApp Kit styles
import '@mysten/dapp-kit/dist/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

interface WalletProvidersProps {
  children: React.ReactNode
}

const WalletProviders = ({ children }: WalletProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SuiClientProvider networks={suiNetworks} defaultNetwork="testnet">
          <WalletProvider>
            <WalletTypeProvider>
              {children}
            </WalletTypeProvider>
          </WalletProvider>
        </SuiClientProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default WalletProviders
