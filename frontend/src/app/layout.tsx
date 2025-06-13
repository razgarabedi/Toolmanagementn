'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/QueryProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <html lang="de">
      <body className={inter.className}>
        <QueryProvider>
          <Toaster />
          <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between">
              <Link href="/tools" className="font-bold">Werkzeugmeister Pro</Link>
              <div>
                <Link href="/profile" className="mr-4">Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
