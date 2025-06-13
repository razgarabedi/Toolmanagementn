'use client';

import { useState } from 'react';
import ToolList from '@/components/ToolList';
import ToolForm from '@/components/ToolForm';
import useAuth from '@/hooks/useAuth';

export default function ToolsPage() {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState(null);

  const handleEdit = (tool: any) => {
    setSelectedTool(tool);
  };

  const handleFinishEditing = () => {
    setSelectedTool(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {user?.role === 'admin' && (
          <div className="md:col-span-1">
            <ToolForm tool={selectedTool} onFormSubmit={handleFinishEditing} />
          </div>
        )}
        <div className={user?.role === 'admin' ? "md:col-span-2" : "md:col-span-3"}>
          <ToolList onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
} 