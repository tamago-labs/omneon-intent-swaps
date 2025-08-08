// "use client"

// import { useAccount } from 'wagmi'
// import { useCurrentAccount } from '@mysten/dapp-kit'
// import { useWalletType } from '../lib/wallet-type-context'

// export function useWalletInfo() {
//   const { walletType } = useWalletType()
//   const { address: evmAddress, isConnected: isEVMConnected, chain } = useAccount()
//   const suiAccount = useCurrentAccount()

//   // Determine actual wallet type based on connections
//   const actualWalletType = (() => {
//     if (isEVMConnected && evmAddress && !suiAccount) return 'evm'
//     if (suiAccount && suiAccount.address && !isEVMConnected) return 'sui'
//     return walletType
//   })()

//   const isConnected = isEVMConnected || !!suiAccount
//   const address = evmAddress || suiAccount?.address
//   const chainInfo = chain || null

//   return {
//     walletType: actualWalletType,
//     isConnected,
//     address,
//     chainInfo,
//     evmAddress,
//     suiAddress: suiAccount?.address,
//     isEVMConnected,
//     isSUIConnected: !!suiAccount
//   }
// }
