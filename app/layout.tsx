import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
