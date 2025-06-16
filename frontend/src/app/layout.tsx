'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/QueryProvider";
import '../i18n';
import Providers from "@/components/Providers";
import MainLayout from "@/components/MainLayout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <QueryProvider>
          <Providers>
            <MainLayout>{children}</MainLayout>
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
