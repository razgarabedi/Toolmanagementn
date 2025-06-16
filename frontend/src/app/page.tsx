'use client';

import { useState } from 'react';
import Login from '@/components/Login';
import Register from '@/components/Register';
import { useTranslation } from 'react-i18next';

export default function StartPage() {
  const [showLogin, setShowLogin] = useState(true);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4 flex justify-around">
            <button
              className={`text-xl font-bold pb-2 ${showLogin ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
              onClick={() => setShowLogin(true)}
            >
              {t('login.title')}
            </button>
            <button
              className={`text-xl font-bold pb-2 ${!showLogin ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
              onClick={() => setShowLogin(false)}
            >
              {t('register.title')}
            </button>
          </div>
          {showLogin ? <Login /> : <Register />}
        </div>
      </div>
    </div>
  );
}
