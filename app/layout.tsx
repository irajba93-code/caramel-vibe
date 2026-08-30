import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Caramel Vibe — Curated bags, made personal', description: 'A curated edit of pre-loved handbags with stories worth carrying.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html> }
