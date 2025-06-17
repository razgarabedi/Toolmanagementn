import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import MainLayout from "@/components/MainLayout";
import { ClientQueryProvider } from "@/lib/clientQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <ClientQueryProvider>
          <Providers>
            <MainLayout>{children}</MainLayout>
          </Providers>
        </ClientQueryProvider>
      </body>
    </html>
  );
}
