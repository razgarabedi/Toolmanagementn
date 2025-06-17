'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

interface DataItem {
  id: number;
  name: string;
}

interface MasterDataFormModalProps {
  resource: 'category' | 'manufacturer' | 'tool-type' | 'location';
  title: string;
  item: DataItem | null;
  onClose: () => void;
  onSuccess?: (item: DataItem) => void;
}

const MasterDataFormModal: React.FC<MasterDataFormModalProps> = ({ resource, title, item, onClose, onSuccess }) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [name, setName] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
    } else {
      setName('');
    }
  }, [item]);

  const resourcePath = resource === 'category' ? 'categories' : resource === 'tool-type' ? 'tool-types' : `${resource}s`;

  const mutation = useMutation({
    mutationFn: (newName: string) => {
      const payload = { name: newName };
      if (item) {
        return api.put(`/${resourcePath}/${item.id}`, payload);
      }
      return api.post(`/${resourcePath}`, payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [resourcePath] });
      toast.success(t(item ? 'settings.masterData.editSuccess' : 'settings.masterData.addSuccess', { resource: title }));
      if (onSuccess) {
        onSuccess(result.data);
      }
      onClose();
    },
    onError: () => {
      toast.error(t('settings.masterData.formError', { resource: title.toLowerCase() }));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {item ? t('settings.masterData.editTitle', { resource: title }) : t('settings.masterData.addTitle', { resource: title })}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('settings.masterData.name')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
              {t('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" disabled={mutation.isPending}>
              {mutation.isPending ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MasterDataFormModal; 