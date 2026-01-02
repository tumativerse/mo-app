import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/lib/contexts/theme-provider';
import { ThemedToaster } from '@/components/theme-aware-toaster';
import './globals.css';

// Force dynamic rendering for all pages (required for next-themes)
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mo - Fitness Tracker',
  description: 'Track your workouts, weight, and progress',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Mo - Fitness Tracker</title>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-200`}
      >
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#3b82f6',
            },
          }}
        >
          <ThemeProvider>
            {children}
            <ThemedToaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
