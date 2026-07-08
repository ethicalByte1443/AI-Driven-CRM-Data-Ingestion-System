import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import DashboardShell from '@/components/layout/DashboardShell';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GrowEasy — AI-Powered CRM Lead Importer',
  description:
    'Upload CSV files in any format and let AI map your leads into GrowEasy CRM fields automatically.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
