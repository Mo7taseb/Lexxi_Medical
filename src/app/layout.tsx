import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexxi Medical - AI Medical Transcription System",
  description: "Advanced voice-to-medical-note system with Arabic support and AI enhancement",
  manifest: '/favicon_io/site.webmanifest',

  // PWA Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lexxi Medical',
    startupImage: '/favicon_io/apple-touch-icon.png'
  },

  icons: {
    icon: [
      { url: '/favicon_io/favicon-16x16.png?v=4', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png?v=4', sizes: '32x32', type: 'image/png' },
      { url: '/favicon_io/favicon.ico?v=4', sizes: 'any' }
    ],
    apple: '/favicon_io/apple-touch-icon.png?v=4',
    other: [
      { url: '/favicon_io/android-chrome-192x192.png?v=4', sizes: '192x192', type: 'image/png' },
      { url: '/favicon_io/android-chrome-512x512.png?v=4', sizes: '512x512', type: 'image/png' },
    ]
  },

  // Mobile and PWA meta tags
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Lexxi Medical',
    'mobile-web-app-capable': 'yes',
    'application-name': 'Lexxi Medical',
    'theme-color': '#2563eb',
    'msapplication-TileColor': '#2563eb',
    'format-detection': 'telephone=no',
    'HandheldFriendly': 'true',
    'MobileOptimized': 'width'
  }
};

// Separate viewport export (Next.js 15+ requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="auto">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon_io/favicon.ico?v=4" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png?v=4" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png?v=4" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png?v=4" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
