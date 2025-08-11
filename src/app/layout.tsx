import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KnowYourself.ai',
  description: 'No-BS self insight',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Make the gradient global so every page gets the color theme */}
      <body className="min-h-screen bg-gradient-to-b from-teal-50 via-emerald-100 to-teal-200 text-gray-900">
        {children}
      </body>
    </html>
  )
}
