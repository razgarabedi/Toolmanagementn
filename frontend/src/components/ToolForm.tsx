'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import Spinner from './Spinner';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Tool {
    id: number;
    toolTypeId: string;
    status: string;
    condition: string;
    purchaseDate: string | null;
    locationId: string | null;
}

interface Location {
    id: number;
    name: string;
}

interface ToolType {
    id: number;
    name: string;
}

const ToolForm = ({ tool, onFormSubmit }: { tool?: Tool, onFormSubmit: () => void }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<{
    toolTypeId: string;
    status: string;
    condition: string;
    purchaseDate: string | null;
    locationId: string | null;
  }>({
    toolTypeId: '',
    status: 'available',
    condition: 'new',
    purchaseDate: null,
    locationId: null,
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: () => api.get('/locations').then(res => res.data),
  });

  const { data: toolTypes } = useQuery<ToolType[]>({
    queryKey: ['tool-types'],
    queryFn: () => api.get('/tool-types').then(res => res.data),
  });

  useEffect(() => {
    if (tool) {
      setFormData({
        toolTypeId: tool.toolTypeId || '',
        status: tool.status,
        condition: tool.condition,
        purchaseDate: tool.purchaseDate,
        locationId: tool.locationId,
      });
    } else {
      setFormData({
        toolTypeId: '',
        status: 'available',
        condition: 'new',
        purchaseDate: null,
        locationId: null,
      });
    }
  }, [tool]);

  const mutation = useMutation({
    mutationFn: (newTool: Partial<Tool>) => {
      return tool
        ? api.put(`/tools/${tool.id}`, newTool)
        : api.post('/tools', newTool);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      onFormSubmit();
      toast.success(tool ? t('toolForm.updateSuccess') : t('toolForm.createSuccess'));
    },
    onError: (error: { response?: { data?: { message?: string } }, message?: string }) => {
      toast.error(error.response?.data?.message || t('toolForm.error'));
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">{tool ? t('toolForm.editTitle') : t('toolForm.addTitle')}</h2>
      {mutation.isError && (
        <p className="text-red-500">{ (mutation.error as { response?: { data?: { message?: string } }, message?: string }).message}</p>
      )}
      <div className="mb-4">
        <label className="block mb-2">{t('toolForm.toolTypeLabel')}</label>
        <select name="toolTypeId" value={formData.toolTypeId} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">{t('toolForm.selectToolType')}</option>
            {toolTypes?.map(toolType => (
                <option key={toolType.id} value={toolType.id}>{toolType.name}</option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">{t('toolForm.locationLabel')}</label>
        <select name="locationId" value={formData.locationId || ''} onChange={handleChange} className="w-full p-2 border rounded" autoComplete="off">
            <option value="">{t('toolForm.selectLocation')}</option>
            {locations?.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">{t('toolForm.purchaseDateLabel')}</label>
        <input type="date" name="purchaseDate" value={formData.purchaseDate ? formData.purchaseDate.split('T')[0] : ''} onChange={handleChange} className="w-full p-2 border rounded" autoComplete="off" />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">{t('toolForm.statusLabel')}</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          autoComplete="off"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="available">{t('toolForm.status.available')}</option>
          <option value="in_use">{t('toolForm.status.in_use')}</option>
          <option value="in_maintenance">{t('toolForm.status.in_maintenance')}</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="condition" className="block text-gray-700 text-sm font-bold mb-2">{t('toolForm.conditionLabel')}</label>
        <select
          name="condition"
          id="condition"
          value={formData.condition}
          onChange={handleChange}
          autoComplete="off"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="new">{t('toolForm.condition.new')}</option>
          <option value="good">{t('toolForm.condition.good')}</option>
          <option value="fair">{t('toolForm.condition.fair')}</option>
          <option value="poor">{t('toolForm.condition.poor')}</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded flex justify-center items-center"
          disabled={mutation.isPending || !(user?.role === 'admin' || user?.role === 'manager')}
        >
          {mutation.isPending ? <Spinner /> : t('toolForm.saveButton')}
        </button>
        {tool && (
            <button
                type="button"
                className="w-full bg-gray-500 text-white p-2 rounded"
                onClick={onFormSubmit}
            >
                {t('toolForm.cancelButton')}
            </button>
        )}
      </div>
    </form>
  );
};

export default ToolForm; 