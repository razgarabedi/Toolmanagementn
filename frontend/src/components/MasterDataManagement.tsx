'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import MasterDataFormModal from './MasterDataFormModal';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-hot-toast';
import ToolTypeFormModal from './ToolTypeFormModal';

interface DataItem {
  id: number;
  name: string;
}

interface MasterDataManagementProps {
  resource: 'category' | 'manufacturer' | 'tool-type' | 'location';
  title: string;
}

const MasterDataManagement: React.FC<MasterDataManagementProps> = ({ resource, title }) => {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const resourcePath = resource === 'category' ? 'categories' : resource === 'tool-type' ? 'tool-types' : `${resource}s`;

  const { data, isLoading, isError, error } = useQuery<{ data: DataItem[] }>({
    queryKey: [resourcePath],
    queryFn: () => api.get(`/${resourcePath}`).then(res => res.data),
    onError: () => {
      toast.error(t('settings.masterData.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/${resourcePath}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [resourcePath] });
      toast.success(t('settings.masterData.deleteSuccess', { resource: title }));
      setItemToDelete(null);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || t('settings.masterData.deleteError', { resource: title.toLowerCase() });
      toast.error(errorMessage);
      setItemToDelete(null);
    },
  });

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: DataItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
    setIsConfirmOpen(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <PlusCircle className="mr-2" size={20} />
          {t('settings.masterData.add')}
        </button>
      </div>
      {isLoading && <p>{t('loading')}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left">{t('settings.masterData.name')}</th>
              <th className="py-2 px-4 border-b text-right">{t('settings.masterData.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {(data?.data || []).map((item) => (
              <tr key={item.id}>
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:text-blue-700">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-red-500 hover:text-red-700">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && resource === 'tool-type' && selectedItem === null && (
        <ToolTypeFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['tool-types'] });
            setIsModalOpen(false);
          }}
        />
      )}
      {isModalOpen && (resource !== 'tool-type' || selectedItem !== null) && (
        <MasterDataFormModal
          resource={resource}
          title={title}
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: [resourcePath] });
          }}
        />
      )}
      {isConfirmOpen && (
        <ConfirmationModal
          title={t('settings.masterData.deleteConfirmTitle', { resource: title })}
          message={t('settings.masterData.deleteConfirm', { resource: title.toLowerCase() })}
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default MasterDataManagement;
