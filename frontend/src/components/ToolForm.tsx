'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
    type: '',
    status: 'available',
    condition: 'new',
    purchaseDate: null,
    locationId: null,
  });

  const { data: locations } = useQuery<any[]>({
    queryKey: ['locations'],
    queryFn: () => api.get('/locations').then(res => res.data),
  });

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        description: tool.description,
        type: tool.type || '',
        status: tool.status,
        condition: tool.condition,
        purchaseDate: tool.purchaseDate,
        locationId: tool.locationId,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: '',
        status: 'available',
        condition: 'new',
        purchaseDate: null,
        locationId: null,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Type</label>
        <input
          type="text"
          name="type"
          id="type"
          value={formData.type}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Location</label>
        <select name="locationId" value={formData.locationId || ''} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select a location</option>
            {locations?.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
            ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
        <textarea
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Purchase Date</label>
        <input type="date" name="purchaseDate" value={formData.purchaseDate ? formData.purchaseDate.split('T')[0] : ''} onChange={handleChange} className="w-full p-2 border rounded" />
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status</label>
        <select
          name="status"
          id="status"
          value={formData.status}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="in_maintenance">In Maintenance</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="condition" className="block text-gray-700 text-sm font-bold mb-2">Condition</label>
        <select
          name="condition"
          id="condition"
          value={formData.condition}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
          disabled={mutation.isPending || !(user?.role === 'admin' || user?.role === 'manager')}
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