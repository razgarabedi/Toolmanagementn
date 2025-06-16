'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import { useToolActions } from '@/hooks/useToolActions';
import useDebounce from '@/hooks/useDebounce';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Tool {
    id: number;
    name: string;
    type: string;
    description: string;
    status: string;
    condition: string;
    location?: { name: string };
    bookings?: { endDate: string }[];
}

const ToolList = ({ onEdit }: { onEdit: (tool: Tool) => void }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkoutMutation, checkinMutation } = useToolActions();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: tools, isLoading, isError } = useQuery({
    queryKey: ['tools', debouncedSearchTerm],
    queryFn: () => api.get('/tools', { params: { search: debouncedSearchTerm } }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/tools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      toast.success(t('toolList.deleteSuccess'));
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || t('toolList.error'));
    }
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>{t('toolList.errorFething')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t('toolList.title')}</h1>
        <input
          type="text"
          placeholder={t('toolList.searchPlaceholder')}
          value={searchTerm}
          autoComplete="off"
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">{t('toolList.name')}</th>
            <th className="py-2">{t('toolList.type')}</th>
            <th className="py-2">{t('toolList.description')}</th>
            <th className="py-2">{t('toolList.status')}</th>
            <th className="py-2">{t('toolList.condition')}</th>
            <th className="py-2">{t('toolList.location')}</th>
            {(user?.role === 'admin' || user?.role === 'manager') && <th className="py-2">{t('toolList.actions')}</th>}
            <th className="py-2">{t('toolList.availabilityActions')}</th>
          </tr>
        </thead>
        <tbody>
          {tools?.data.map((tool: Tool) => (
            <tr key={tool.id}>
              <td className="border px-4 py-2">
                <Link href={`/tools/${tool.id}`} className="text-blue-600 hover:underline">
                  {tool.name}
                </Link>
              </td>
              <td className="border px-4 py-2">{tool.type}</td>
              <td className="border px-4 py-2">{tool.description}</td>
              <td className="border px-4 py-2">{tool.status}</td>
              <td className="border px-4 py-2">
                {tool.condition}
                {tool.status === 'in_use' && tool.bookings && tool.bookings.length > 0 && new Date(tool.bookings[0].endDate) < new Date() && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {t('toolList.overdue')}
                    </span>
                )}
              </td>
              <td className="border px-4 py-2">{tool.location?.name}</td>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <td className="border px-4 py-2">
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => onEdit(tool)}
                  >
                    {t('toolList.edit')}
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteMutation.mutate(tool.id)}
                  >
                    {t('toolList.delete')}
                  </button>
                </td>
              )}
              <td className="border px-4 py-2">
                {tool.status === 'available' && (
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => checkoutMutation.mutate(tool.id)}
                  >
                    {t('toolList.checkOut')}
                  </button>
                )}
                {tool.status === 'in_use' && (
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => checkinMutation.mutate(tool.id)}
                  >
                    {t('toolList.checkIn')}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToolList; 