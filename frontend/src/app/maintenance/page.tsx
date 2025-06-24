'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaExclamationTriangle, FaTools, FaRegCalendarAlt, FaDollarSign } from 'react-icons/fa';
import api from '@/lib/api';
import Spinner from '@/components/Spinner';
import { Maintenance, Tool } from '@/lib/types';
import Modal from '@/components/Modal';
import MaintenanceForm from '@/components/MaintenanceForm';
import { useTranslation } from 'react-i18next';
import FinishMaintenanceModal from '@/components/FinishMaintenanceModal';

interface MaintenanceTask extends Maintenance {
  tool: Pick<Tool, 'id' | 'name' | 'instanceImage'>;
}

const MaintenanceDashboard = () => {
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

  const { data: maintenanceTasks = [], isLoading: isLoadingMaintenance, error: maintenanceError } = useQuery<MaintenanceTask[]>({
    queryKey: ['maintenanceTasks'],
    queryFn: () => api.get('/maintenance').then(res => res.data)
  });

  const { data: tools = [], isLoading: isLoadingTools, error: toolsError } = useQuery<Tool[]>({
    queryKey: ['tools'],
    queryFn: () => api.get('/tools').then(res => res.data)
  });

  const isLoading = isLoadingMaintenance || isLoadingTools;

  // KPIs calculation
  const now = new Date();
  const overdueTasks = maintenanceTasks.filter(task => new Date(task.startDate) < now && task.status !== 'completed');
  const upcomingTasks = maintenanceTasks.filter(task => new Date(task.startDate) >= now && task.status === 'scheduled');
  const toolsUnderMaintenance = tools.filter(tool => tool.status === 'in_maintenance');
  const totalMaintenanceCost = maintenanceTasks.reduce((acc, task) => acc + (task.cost || 0), 0);

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    // queryClient.invalidateQueries(['maintenanceTasks']);
    // queryClient.invalidateQueries(['tools']);
  };

  const handleOpenFinishModal = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsFinishModalOpen(true);
  };

  const handleOpenFinishModalForTool = (tool: Tool) => {
    const task = maintenanceTasks.find(t => t.toolId === tool.id && t.status !== 'completed');
    if (task) {
      handleOpenFinishModal(task);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (maintenanceError || toolsError) {
    return <p>{t('maintenanceDashboard.error_loading')}</p>;
  }

  const getStatusLabel = (status: string) => {
    const statusKey = `maintenanceDashboard.status_${status.toLowerCase().replace(' ', '_')}`;
    // Fallback to the original status if no translation is found
    return t(statusKey, { defaultValue: status });
  };

  const renderMaintenanceTable = (tasks: MaintenanceTask[], title: string) => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded my-6">
      <h2 className="text-xl font-bold p-4 border-b dark:border-gray-700">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-max w-full table-auto">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">{t('maintenanceDashboard.tool')}</th>
              <th className="py-3 px-6 text-left">{t('maintenanceDashboard.description')}</th>
              <th className="py-3 px-6 text-center">{t('maintenanceDashboard.status')}</th>
              <th className="py-3 px-6 text-center">{t('maintenanceDashboard.scheduled_date')}</th>
              <th className="py-3 px-6 text-center">{t('maintenanceDashboard.cost')}</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-200 text-sm font-light">
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onClick={() => handleOpenFinishModal(task)}>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="font-medium">{task.tool.name}</span>
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  <span>{task.description}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span className={`py-1 px-3 rounded-full text-xs ${task.status === 'overdue' ? 'bg-red-200 text-red-600' : 'bg-purple-200 text-purple-600'}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>{new Date(task.startDate).toLocaleDateString()}</span>
                </td>
                <td className="py-3 px-6 text-center">
                  <span>{task.cost ? task.cost.toFixed(2) : t('maintenanceDashboard.not_available')}</span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="py-3 px-6 text-center">{t('maintenanceDashboard.no_tasks_found')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderToolsTable = (toolsList: Tool[], title: string) => (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded my-6">
        <h2 className="text-xl font-bold p-4 border-b dark:border-gray-700">{title}</h2>
        <div className="overflow-x-auto">
            <table className="min-w-max w-full table-auto">
                <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">{t('maintenanceDashboard.tool')}</th>
                        <th className="py-3 px-6 text-left">{t('maintenanceDashboard.serial_number')}</th>
                        <th className="py-3 px-6 text-center">{t('maintenanceDashboard.condition')}</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-200 text-sm font-light">
                    {toolsList.map(tool => (
                        <tr key={tool.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer" onClick={() => handleOpenFinishModalForTool(tool)}>
                            <td className="py-3 px-6 text-left">{tool.name}</td>
                            <td className="py-3 px-6 text-left">{tool.serialNumber}</td>
                            <td className="py-3 px-6 text-center">{t(`toolInstanceForm.condition.${tool.condition}`)}</td>
                        </tr>
                    ))}
                    {toolsList.length === 0 && (
                        <tr>
                            <td colSpan={3} className="py-3 px-6 text-center">{t('maintenanceDashboard.no_tools_found')}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t('maintenanceDashboard.maintenance_dashboard')}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {t('maintenanceDashboard.schedule_maintenance')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-100 dark:bg-red-800 p-4 rounded-lg shadow flex items-center">
          <FaExclamationTriangle className="text-red-500 dark:text-red-300 text-3xl mr-4" />
          <div>
            <div className="text-2xl font-bold">{overdueTasks.length}</div>
            <div className="text-gray-600 dark:text-gray-300">{t('maintenanceDashboard.overdue_tasks')}</div>
          </div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-lg shadow flex items-center">
          <FaRegCalendarAlt className="text-blue-500 dark:text-blue-300 text-3xl mr-4" />
          <div>
            <div className="text-2xl font-bold">{upcomingTasks.length}</div>
            <div className="text-gray-600 dark:text-gray-300">{t('maintenanceDashboard.upcoming_tasks')}</div>
          </div>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-800 p-4 rounded-lg shadow flex items-center">
          <FaTools className="text-yellow-500 dark:text-yellow-300 text-3xl mr-4" />
          <div>
            <div className="text-2xl font-bold">{toolsUnderMaintenance.length}</div>
            <div className="text-gray-600 dark:text-gray-300">{t('maintenanceDashboard.tools_in_maintenance')}</div>
          </div>
        </div>
        <div className="bg-green-100 dark:bg-green-800 p-4 rounded-lg shadow flex items-center">
          <FaDollarSign className="text-green-500 dark:text-green-300 text-3xl mr-4" />
          <div>
            <div className="text-2xl font-bold">{totalMaintenanceCost.toFixed(2)}</div>
            <div className="text-gray-600 dark:text-gray-300">{t('maintenanceDashboard.total_maintenance_cost')}</div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('maintenanceDashboard.schedule_new_maintenance')}>
        <MaintenanceForm tools={tools} onFormSubmit={handleFormSubmit} />
      </Modal>

      {selectedTask && (
        <Modal isOpen={isFinishModalOpen} onClose={() => setIsFinishModalOpen(false)} title={t('finish_maintenance.title')}>
          <FinishMaintenanceModal maintenance={selectedTask} onClose={() => setIsFinishModalOpen(false)} />
        </Modal>
      )}

      {renderMaintenanceTable(overdueTasks, t('maintenanceDashboard.overdue_maintenance'))}
      {renderMaintenanceTable(upcomingTasks, t('maintenanceDashboard.upcoming_maintenance'))}
      {renderToolsTable(toolsUnderMaintenance, t('maintenanceDashboard.tools_currently_under_maintenance'))}
    </div>
  );
};

export default MaintenanceDashboard; 