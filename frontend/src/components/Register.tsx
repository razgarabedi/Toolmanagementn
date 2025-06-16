'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface NewUser {
    username?: string;
    email?: string;
    password?: string;
}

const Register = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const mutation = useMutation({
    mutationFn: (newUser: NewUser) => {
      return api.post('/auth/register', newUser);
    },
  });

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
        <h2 className="text-lg font-bold mb-4">{t('register.title')}</h2>
        {mutation.isError && (
          <p className="text-red-500">{t('register.errorPrefix')} {(mutation.error as { response?: { data?: { message?: string } }, message?: string })?.response?.data?.message || mutation.error.message}</p>
        )}
        {mutation.isSuccess && (
          <p className="text-green-500">{t('register.success')}</p>
        )}
        <div className="mb-4">
          <label className="block text-gray-700">{t('register.usernameLabel')}</label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">{t('register.emailLabel')}</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">{t('register.passwordLabel')}</label>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded mt-1"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? t('register.registering') : t('register.button')}
        </button>
      </form>
    </div>
  );
};

export default Register; 