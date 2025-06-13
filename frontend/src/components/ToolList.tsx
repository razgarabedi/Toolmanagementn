'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import useAuth from '@/hooks/useAuth';
import Spinner from './Spinner';
import toast from 'react-hot-toast';

const ToolList = ({ onEdit }: { onEdit: (tool: any) => void }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tools, isLoading, isError } = useQuery({
    queryKey: ['tools'],
    queryFn: () => api.get('/tools'),
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

  const checkoutMutation = useMutation({
    mutationFn: (id: number) => {
        return api.post(`/tools/${id}/checkout`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
        toast.success('Tool checked out successfully!');
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'An error occurred');
    }
  });

    const checkinMutation = useMutation({
        mutationFn: (id: number) => {
            return api.post(`/tools/${id}/checkin`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tools'] });
            toast.success('Tool checked in successfully!');
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
      <h1 className="text-2xl font-bold mb-4">Tools</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Description</th>
            <th className="py-2">Status</th>
            <th className="py-2">Condition</th>
            {user?.role === 'admin' && <th className="py-2">Actions</th>}
            <th className="py-2">Availability Actions</th>
          </tr>
        </thead>
        <tbody>
          {tools?.data.map((tool: any) => (
            <tr key={tool.id}>
              <td className="border px-4 py-2">{tool.name}</td>
              <td className="border px-4 py-2">{tool.description}</td>
              <td className="border px-4 py-2">{tool.status}</td>
              <td className="border px-4 py-2">{tool.condition}</td>
              {user?.role === 'admin' && (
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