import { http, createConfig } from 'wagmi'
import { pulsechain } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [pulsechain],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [pulsechain.id]: http(),
  },
})
