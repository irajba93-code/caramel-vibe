import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/ToastContext'

export const metadata: Metadata = {
  title: 'Caramel Vibe — Curated bags, made personal',
  description: 'A curated edit of pre-loved handbags with stories worth carrying.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-accent selection:text-foreground">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}

