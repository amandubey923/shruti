import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppClientLayout } from '@/components/layout/AppClientLayout';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0A09' },
  ],
};

export const metadata: Metadata = {
  title: 'SHRUTI — Spoken Audio Archive & Listening Sanctuary',
  description:
    'An archival listening room and curated library for long-form spiritual discourses, Upanishadic commentaries, and philosophical audio recordings.',
  keywords: [
    'Shruti',
    'Spoken Audio Archive',
    'Osho Discourses',
    'Krishna Smriti',
    'Ek Omkar Satnam',
    'Mahaveer Vani',
    'Nirvan Upanishad',
    'Philosophy',
    'Meditation',
    'Audio Archive',
  ],
  authors: [{ name: 'SHRUTI Archive' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/shruti-mark.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/brand/apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'SHRUTI — Spoken Audio Archive',
    description: 'Listen. Contemplate. Return. A dedicated archival sanctuary for spoken audio.',
    type: 'website',
    images: [{ url: '/brand/shruti-logo.svg' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
        <AppClientLayout>{children}</AppClientLayout>
      </body>
    </html>
  );
}
