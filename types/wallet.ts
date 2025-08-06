export type WalletType = 'evm' | 'sui' | null

export interface WalletInfo {
  walletType: WalletType
  isConnected: boolean
  address?: string
  chainInfo?: any
  evmAddress?: string
  suiAddress?: string
  isEVMConnected: boolean
  isSUIConnected: boolean
}

export interface SupportedChain {
  name: string
  symbol: string
  color: string
  icon: string
}

export interface ConnectWalletProps {
  onConnect?: () => void
  className?: string
}
