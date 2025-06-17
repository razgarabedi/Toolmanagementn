'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useAuth from '@/hooks/useAuth';

interface Credentials {
  email?: string;
  password?: string;
}

const Login = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { isAuthenticated, login, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, loading]);

  const mutation = useMutation({
    mutationFn: (credentials: Credentials) => {
      return api.post('/auth/login', credentials);
    },
    onSuccess: (data) => {
      login(data.data.token);
      router.push('/dashboard');
      window.location.reload();
    },
  });

  if (loading || isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-lg font-bold mb-4">{t('login.title')}</h2>
        {mutation.isError && (
          <p className="text-red-500">{t('login.error')}</p>
        )}
        {mutation.isSuccess && (
          <p className="text-green-500">{t('login.success')}</p>
        )}
        <div className="mb-4">
          <label className="block text-gray-700">{t('login.emailLabel')}</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">{t('login.passwordLabel')}</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('login.loggingIn') : t('login.button')}
        </button>
      </form>
    </div>
  );
};

export default Login; 