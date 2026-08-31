import type { Metadata } from 'next';
import './globals.css';
import { AppClientLayout } from '@/components/layout/AppClientLayout';

export const metadata: Metadata = {
  title: 'SHRUTI — Sacred Sound, Discourses & Contemplation',
  description:
    'A tranquil digital archive and listening sanctuary for spiritual discourses, meditation audio, philosophy, Indian classical ragas, and profound wisdom.',
  keywords: [
    'Shruti',
    'Audio platform',
    'Spiritual discourses',
    'Osho Krishna Smriti',
    'Meditation audio',
    'Bhagavad Gita talks',
    'Indian Classical Ragas',
    'Philosophical talks',
    'Krishnamurti',
  ],
  authors: [{ name: 'SHRUTI Audio' }],
  openGraph: {
    title: 'SHRUTI — Sacred Sound, Discourses & Contemplation',
    description: 'Listen, discover, and return to stillness with SHRUTI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        <AppClientLayout>{children}</AppClientLayout>
      </body>
    </html>
  );
}

