'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ToolList from '@/components/ToolList';
import ToolForm from '@/components/ToolForm';
import useAuth from '@/hooks/useAuth';
import Spinner from '@/components/Spinner';

export default function ToolsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const handleEdit = (tool: any) => {
    setSelectedTool(tool);
  };

  const handleFinishEditing = () => {
    setSelectedTool(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spinner /></div>;
  }
  
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <div className="md:col-span-1">
            <ToolForm tool={selectedTool} onFormSubmit={handleFinishEditing} />
          </div>
        )}
        <div className={(user?.role === 'admin' || user?.role === 'manager') ? "md:col-span-2" : "md:col-span-3"}>
          <ToolList onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
} 