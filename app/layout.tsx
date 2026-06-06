import './globals.css'
import '@mysten/dapp-kit/dist/index.css'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>MemoryChain AI - Decentralized Memory for AI Agents</title>
        <meta name="description" content="Permanent AI memory powered by Sui blockchain and Walrus storage" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
