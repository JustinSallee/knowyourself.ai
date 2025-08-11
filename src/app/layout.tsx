// app/layout.tsx
import './globals.css'

export const metadata = { title: 'KnowYourself.ai' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_0%,#f5f5f5_0%,#eaeaea_45%,#e5e7eb_100%)]">
        {children}
      </body>
    </html>
  )
}
