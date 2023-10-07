import { cn } from '@/lib/utils';
import './globals.css';
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Roboto({
  weight: '400',
  subsets: ['latin'],
  preload: false,
});

export const metadata: Metadata = {
  title: 'Discord Bot Dashboard',
  description: 'A dashboard for my Discord bot.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="en" className="dark">
      <body
        className={cn('min-h-screen font-sans antialiased', inter.className)}
      >
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
