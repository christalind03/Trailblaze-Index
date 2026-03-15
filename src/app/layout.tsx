import type { Metadata } from 'next';

import { Poppins } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';

const poppinsFont = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '900'],
});

export const metadata: Metadata = {
  description:
    'Know what to keep. Discard the rest. Build your Honkai: Star Rail roster with confidence.',
  title: 'Trailblaze Index',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn('antialiased', poppinsFont.className)}>
        {children}
      </body>
    </html>
  );
}
