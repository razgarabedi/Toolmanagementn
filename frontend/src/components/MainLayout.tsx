'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import useAuth from '@/hooks/useAuth';
import Notifications from './Notifications';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Hammer,
  Book,
  Calendar,
  Wrench,
  Package,
  History,
  CheckSquare,
  Users,
  BarChart,
  Search,
  Settings,
  Menu,
  X,
  User as UserIcon,
  Bell,
  BookCheck
} from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading, user, logout, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
      router.push('/');
    }
  }, [isAuthenticated, loading, pathname, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileMenuRef]);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsMenuOpen(false);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navLinks = [
    { href: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard, roles: ['user', 'manager', 'admin'] },
    { href: '/notifications', label: 'nav.notifications', icon: Bell, roles: ['user', 'manager', 'admin'] },
    { href: '/tools', label: 'nav.tools', icon: Hammer, roles: ['user', 'manager', 'admin'] },
    { href: '/bookings', label: 'nav.bookings', icon: Book, roles: ['user', 'manager', 'admin'] },
    { href: '/my-bookings', label: 'nav.myBookings', icon: BookCheck, roles: ['user', 'manager', 'admin'] },
    { href: '/calendar', label: 'nav.calendarView', icon: Calendar, roles: ['user', 'manager', 'admin'] },
    { href: '/maintenance', label: 'nav.maintenance', icon: Wrench, roles: ['manager', 'admin'] },
    { href: '/spare-parts', label: 'nav.spareParts', icon: Package, roles: ['manager', 'admin'] },
    { href: '/tool-lifecycle', label: 'nav.toolLifecycle', icon: History, roles: ['manager', 'admin'] },
    { href: '/commissioning', label: 'nav.commissioning', icon: CheckSquare, roles: ['manager', 'admin'] },
    { href: '/users', label: 'nav.users', icon: Users, roles: ['admin'] },
    { href: '/reports', label: 'nav.reports', icon: BarChart, roles: ['admin'] },
    { href: '/missing-tools', label: 'nav.missingTools', icon: Search, roles: ['manager', 'admin'] },
    { href: '/settings', label: 'nav.settings', icon: Settings, roles: ['admin'] },
  ];

  const showNav = isAuthenticated && !['/', '/login', '/register'].includes(pathname);

  if (loading) {
    return <div>{t('loading')}</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    // For unauthenticated users, we only render the children, which will be the login/register pages or the root splash page.
    return (
        <>
          <Toaster />
          <main>{children}</main>
        </>
    );
  }

  if (!showNav) {
    return (
      <>
        <Toaster />
        <main>{children}</main>
      </>
    );
  }

  return (
    <>
      <Toaster />
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-purple-600">GB Gebrüder Beckers</h1>
            <button className="md:hidden" onClick={() => setIsMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="mt-4 flex flex-col justify-between" style={{ height: 'calc(100% - 140px)'}}>
            <div>
                {navLinks.map((link) => {
                const Icon = link.icon;
                const userHasAccess = hasRole(link.roles as ('user' | 'manager' | 'admin')[]);
                if (!userHasAccess) return null;
                
                return (
                    <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-4 py-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 transition-colors duration-200 ${pathname === link.href ? 'bg-purple-200 text-purple-700 font-bold' : ''}`}
                    >
                    <Icon size={20} className="mr-3" />
                    <span>{t(link.label)}</span>
                    </Link>
                );
                })}
            </div>
            {isClient && (
                <div className="px-4 py-2">
                    <button onClick={() => changeLanguage('en')} className={`mr-2 ${i18n.language === 'en' ? 'font-bold' : ''}`}>EN</button>
                    <button onClick={() => changeLanguage('de')} className={`${i18n.language === 'de' ? 'font-bold' : ''}`}>DE</button>
                </div>
            )}
          </nav>

          <div className="absolute bottom-0 w-full p-4 border-t">
              {!loading && isAuthenticated && user && (
                <div className="flex items-center">
                  <UserIcon size={32} className="rounded-full mr-3" />
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
            <header className="flex items-center justify-between p-4 bg-white shadow-md">
                <button onClick={() => setIsMenuOpen(true)} className="md:hidden">
                    <Menu size={24} />
                </button>
                <div className="flex-1" />
                <div className="flex items-center space-x-4">
                    <Notifications />
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center space-x-2">
                            <UserIcon size={24} className="rounded-full" />
                            <span className="hidden md:block">{user?.username}</span>
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('nav.profile')}</Link>
                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('nav.logout')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
      </div>
    </>
  );
} 