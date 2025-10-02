import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'WebsiteBuilder AI - Deine Website in 60 Sekunden',
    template: '%s | WebsiteBuilder AI',
  },
  description: 'Der einfachste KI-Website-Builder für deutsche Kleinunternehmen. Erstelle deine professionelle Website in unter 60 Sekunden mit KI-Power!',
  keywords: [
    'Website Builder',
    'KI Website',
    'Restaurant Website',
    'Handwerker Website',
    'Deutschland',
    'Kleinunternehmen',
    'Drag and Drop',
    'Voice to Website',
    'Foto zu Website'
  ],
  authors: [{ name: 'WebsiteBuilder AI Team' }],
  creator: 'WebsiteBuilder AI',
  publisher: 'WebsiteBuilder AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}