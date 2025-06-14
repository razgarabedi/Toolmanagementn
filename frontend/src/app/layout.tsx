'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/QueryProvider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from 'react-hot-toast';
import useAuth from "@/hooks/useAuth";
import Notifications from '../components/Notifications';
import { useTranslation } from "react-i18next";
import '../i18n';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, user, logout, hasRole } = useAuth();
  
  const handleLogout = () => {
    logout();
    router.push("/login");
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const showNav = !['/login', '/register'].includes(pathname);

  return (
    <html lang="de">
      <body className={inter.className}>
        <QueryProvider>
          <Toaster />
          {showNav && (
            <nav className="bg-gray-800 text-white p-4">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="font-bold">{t('nav.brand')}</Link>
                <div className="flex items-center">
                  <div className="mr-4">
                    <button onClick={() => changeLanguage('en')} className={`mr-2 ${i18n.language === 'en' ? 'font-bold' : ''}`}>EN</button>
                    <button onClick={() => changeLanguage('de')} className={`${i18n.language === 'de' ? 'font-bold' : ''}`}>DE</button>
                  </div>
                  {!loading && (
                    <>
                      {isAuthenticated ? (
                        <>
                          <Link href="/dashboard" className="mr-4">{t('nav.dashboard')}</Link>
                          {hasRole(['admin', 'manager']) && <Link href="/manager-dashboard" className="mr-4">{t('nav.managerDashboard')}</Link>}
                          {hasRole(['admin', 'manager']) && <Link href="/spare-parts" className="mr-4">{t('nav.spareParts')}</Link>}
                          {hasRole(['admin', 'manager']) && <Link href="/locations" className="mr-4">{t('nav.locations')}</Link>}
                          {hasRole(['admin', 'manager']) && <Link href="/reports" className="mr-4">{t('nav.reports')}</Link>}
                          <Link href="/tools" className="mr-4">{t('nav.tools')}</Link>
                          <Link href="/scanner" className="mr-4">{t('nav.scan')}</Link>
                          <Link href="/my-bookings" className="mr-4">{t('nav.myBookings')}</Link>
                          <Link href="/booking-calendar" className="mr-4">{t('nav.calendar')}</Link>
                          {user?.role === 'admin' && (
                            <Link href="/admin" className="mr-4">{t('nav.admin')}</Link>
                          )}
                          <Link href="/profile" className="mr-4">{t('nav.profile')}</Link>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <span className="text-white mr-4">{t('nav.welcome', { username: user.username })}</span>
                              <Notifications />
                              <button onClick={handleLogout} className="ml-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">{t('nav.logout')}</button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Link href="/login" className="mr-4">{t('nav.login')}</Link>
                          <Link href="/register">{t('nav.register')}</Link>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </nav>
          )}
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
