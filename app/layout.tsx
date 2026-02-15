import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Audit - AI-Powered Code Analysis',
  description: 'Get comprehensive security, quality, and architecture analysis of your codebase with AI.',
  keywords: ['code audit', 'ai', 'security', 'code quality', 'github'],
  openGraph: {
    title: 'AI Audit - AI-Powered Code Analysis',
    description: 'Get comprehensive security, quality, and architecture analysis of your codebase with AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
