'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

const ToolForm = ({ tool, onFormSubmit }: { tool?: any, onFormSubmit: () => void }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'available',
    condition: 'new',
  });

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description,
        status: tool.status,
        condition: tool.condition,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'available',
        condition: 'new',
      });
    }
  }, [tool]);

  const mutation = useMutation({
    mutationFn: (newTool: any) => {
      return tool
        ? api.put(`/tools/${tool.id}`, newTool)
        : api.post('/tools', newTool);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      onFormSubmit();
      toast.success(`Tool ${tool ? 'updated' : 'created'} successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
      <h2 className="text-lg font-bold mb-4">{tool ? 'Edit Tool' : 'Add New Tool'}</h2>
      {mutation.isError && (
        <p className="text-red-500">{mutation.error.message}</p>
      )}
      <div className="mb-4">
        <label className="block text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        >
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="in_maintenance">In Maintenance</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Condition</label>
        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded mt-1"
        >
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded flex justify-center items-center"
          disabled={mutation.isPending || user?.role !== 'admin'}
        >
          {mutation.isPending ? <Spinner /> : 'Save'}
        </button>
        {tool && (
            <button
                type="button"
                className="w-full bg-gray-500 text-white p-2 rounded"
                onClick={onFormSubmit}
            >
                Cancel
            </button>
        )}
      </div>
    </form>
  );
};

export default ToolForm; 