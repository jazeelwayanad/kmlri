import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { DialogRoot } from '@/components/ui/DialogRoot';

export const metadata: Metadata = {
  title: 'Kunhīn Musliyār Library & Research Institute',
  description: 'The institute keeps, describes and makes available the written heritage of Malabar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <DialogRoot />
      </body>
    </html>
  );
}
