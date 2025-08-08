import { http, createConfig } from 'wagmi'
import { base, mainnet, optimism, polygon, bsc, cronos, sepolia } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

// const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const wagmiConfig = createConfig({
  chains: [mainnet, base, optimism, polygon, bsc, cronos, sepolia],
  connectors: [
    injected(),
    metaMask(),
    // walletConnect({ projectId }),
    // coinbaseWallet({ appName: 'Omneon' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [bsc.id]: http(),
    [cronos.id]: http(),
    [sepolia.id]: http()
  },
})
