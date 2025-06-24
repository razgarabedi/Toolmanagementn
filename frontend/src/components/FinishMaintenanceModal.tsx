'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Maintenance } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

interface FinishMaintenanceModalProps {
  maintenance: Maintenance;
  onClose: () => void;
}

const FinishMaintenanceModal: React.FC<FinishMaintenanceModalProps> = ({ maintenance, onClose }) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: (formData: FormData) => api.patch(`/maintenance/${maintenance.id}/finish`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('notes', notes);
    if (file) {
      formData.append('file', file);
    }
    mutation.mutate(formData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t('finish_maintenance.title')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('finish_maintenance.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('finish_maintenance.attach_file')}
          </label>
          <input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {mutation.isPending ? <Spinner /> : t('finish_maintenance.complete_maintenance')}
          </button>
        </div>
        {mutation.isError && (
          <p className="text-red-500 mt-2">{t('finish_maintenance.error_completing')}</p>
        )}
      </form>
    </div>
  );
};

export default FinishMaintenanceModal; 