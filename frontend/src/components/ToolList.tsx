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

const ToolList = ({ onEdit }: { onEdit: (tool: any) => void }) => {
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
      toast.success('Tool deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error fetching tools</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tools</h1>
        <input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Type</th>
            <th className="py-2">Description</th>
            <th className="py-2">Status</th>
            <th className="py-2">Condition</th>
            <th className="py-2">Location</th>
            {(user?.role === 'admin' || user?.role === 'manager') && <th className="py-2">Actions</th>}
            <th className="py-2">Availability Actions</th>
          </tr>
        </thead>
        <tbody>
          {tools?.data.map((tool: any) => (
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
                {tool.status === 'in_use' && tool.bookings?.length > 0 && new Date(tool.bookings[0].endDate) < new Date() && (
                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Overdue
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
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteMutation.mutate(tool.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
              <td className="border px-4 py-2">
                {tool.status === 'available' && (
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => checkoutMutation.mutate(tool.id)}
                  >
                    Check Out
                  </button>
                )}
                {tool.status === 'in_use' && (
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                    onClick={() => checkinMutation.mutate(tool.id)}
                  >
                    Check In
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