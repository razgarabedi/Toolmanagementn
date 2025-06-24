'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Maintenance } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

interface MaintenanceHistoryTabProps {
  toolId: number;
}

const MaintenanceHistoryTab: React.FC<MaintenanceHistoryTabProps> = ({ toolId }) => {
  const { t } = useTranslation('common');

  const { data: history = [], isLoading, isError } = useQuery<Maintenance[]>({
    queryKey: ['maintenanceHistory', toolId],
    queryFn: () => api.get(`/maintenance/tool/${toolId}`).then(res => res.data),
    enabled: !!toolId,
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <p>{t('maintenance.history_load_error')}</p>;
  }

  return (
    <div className="space-y-4">
      {history.length > 0 ? (
        history.map((entry) => (
          <div key={entry.id} className="p-4 border rounded-lg">
            <p><strong>{t('maintenance.completed_on')}:</strong> {entry.endDate ? new Date(entry.endDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>{t('maintenance.completed_by')}:</strong> {entry.completedByUser?.username || t('maintenance.not_available')}</p>
            <p><strong>{t('maintenance.description')}:</strong> {entry.description}</p>
            {entry.notes && <p><strong>{t('maintenance.notes')}:</strong> {entry.notes}</p>}
          </div>
        ))
      ) : (
        <p>{t('maintenance.no_history')}</p>
      )}
    </div>
  );
};

export default MaintenanceHistoryTab; 