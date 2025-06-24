'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';
import { Tool } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface MaintenanceFormProps {
    toolId?: number;
    tools?: Tool[];
    maintenanceId?: number;
    onFormSubmit?: () => void;
    isRepairRequest?: boolean;
}

interface NewMaintenance {
    toolId: number;
    description: string;
    cost: number;
    status: string;
    startDate: Date;
}

interface SparePart {
    id: number;
    name: string;
    quantity: number;
}

interface ToolType {
    id: number;
    name: string;
}

const MaintenanceForm = ({ toolId, tools, maintenanceId, onFormSubmit, isRepairRequest }: MaintenanceFormProps) => {
    const { t } = useTranslation('common');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [status, setStatus] = useState(isRepairRequest ? 'requested' : 'scheduled');
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [selectedPart, setSelectedPart] = useState('');
    const [partQuantity, setPartQuantity] = useState(1);
    const [internalToolId, setInternalToolId] = useState<number | undefined>(toolId);
    const [selectedToolTypeId, setSelectedToolTypeId] = useState<number | ''>('');

    useEffect(() => {
        setInternalToolId(toolId);
    }, [toolId]);
    
    const queryClient = useQueryClient();

    const { data: toolTypes = [] } = useQuery<ToolType[]>({
        queryKey: ['toolTypes'],
        queryFn: () => api.get('/tool-types').then(res => res.data.data),
    });

    const { data: spareParts } = useQuery<SparePart[]>({
        queryKey: ['spareParts'],
        queryFn: () => api.get('/spare-parts').then(res => res.data)
    });

    const mutation = useMutation({
        mutationFn: (newMaintenance: NewMaintenance) => 
            maintenanceId 
                ? api.put(`/maintenance/${maintenanceId}`, newMaintenance)
                : api.post('/maintenance', newMaintenance),
        onSuccess: async (data) => {
            if(selectedPart && data.data.id) {
                await assignPartMutation.mutateAsync({
                    maintenanceId: data.data.id,
                    sparePartId: Number(selectedPart),
                    quantityUsed: partQuantity,
                });
            }
            // Await all invalidations to ensure data is fresh before proceeding
            await Promise.all([
                internalToolId ? queryClient.invalidateQueries({ queryKey: ['maintenanceHistory', internalToolId] }) : Promise.resolve(),
                internalToolId ? queryClient.invalidateQueries({ queryKey: ['tool', internalToolId] }) : Promise.resolve(),
                queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] })
            ]);

            toast.success(t(isRepairRequest ? 'maintenanceForm.repair_request_success' : 'maintenanceForm.schedule_success'));
            onFormSubmit?.();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || t('maintenanceForm.generic_error'));
        }
    });
    
    const assignPartMutation = useMutation({
        mutationFn: (data: {maintenanceId: number, sparePartId: number, quantityUsed: number}) =>
            api.post('/spare-parts/assign', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spareParts'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!internalToolId) {
            toast.error(t('maintenanceForm.select_tool_error'));
            return;
        }
        mutation.mutate({
            toolId: internalToolId,
            description,
            cost: cost ? parseFloat(cost) : 0,
            status,
            startDate,
        });
    };

    const filteredTools = useMemo(() => {
        if (!selectedToolTypeId || !tools) {
            return [];
        }
        return tools.filter(tool => tool.toolTypeId === selectedToolTypeId);
    }, [selectedToolTypeId, tools]);

    const handleToolTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const typeId = e.target.value ? Number(e.target.value) : '';
        setSelectedToolTypeId(typeId);
        setInternalToolId(undefined); // Reset tool instance selection
    };

    const getTitle = () => {
        if (maintenanceId) return t('maintenanceForm.update_title');
        if (isRepairRequest) return t('maintenanceForm.request_title');
        return t('maintenanceForm.schedule_title');
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
            <h3 className="text-xl font-bold mb-2">{getTitle()}</h3>
            
            {!toolId && tools && (
                <div className="space-y-2">
                    <select 
                        value={selectedToolTypeId} 
                        onChange={handleToolTypeChange}
                        className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        required
                    >
                        <option value="" disabled>{t('maintenanceForm.select_tool_type_placeholder')}</option>
                        {toolTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>

                    <select 
                        value={internalToolId || ''} 
                        onChange={(e) => setInternalToolId(Number(e.target.value))}
                        className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        required
                        disabled={!selectedToolTypeId}
                    >
                        <option value="" disabled>{t('maintenanceForm.select_tool_placeholder')}</option>
                        {filteredTools.map(tool => (
                            <option key={tool.id} value={tool.id}>{tool.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="mb-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('maintenanceForm.start_date')}
                </label>
                <DatePicker
                    id="startDate"
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    showTimeSelect
                    dateFormat="Pp"
                />
            </div>

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('maintenanceForm.description_placeholder')}
                className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                required
            />
            {!isRepairRequest && (
                <>
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder={t('maintenanceForm.cost_placeholder')}
                        className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 mb-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="scheduled">{t('maintenanceDashboard.status_scheduled')}</option>
                        <option value="in-progress">{t('maintenanceDashboard.status_in_progress')}</option>
                        <option value="completed">{t('maintenanceDashboard.status_completed')}</option>
                    </select>
                    
                    <h4 className="font-bold mt-2">{t('maintenanceForm.assign_spare_part_title')}</h4>
                    <div className="flex gap-2">
                        <select value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">{t('maintenanceForm.select_part_placeholder')}</option>
                            {spareParts?.map(part => (
                                <option key={part.id} value={part.id}>
                                    {part.name} ({t('maintenanceForm.quantity_short')} {part.quantity})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={partQuantity}
                            onChange={(e) => setPartQuantity(Number(e.target.value))}
                            min="1"
                            className="w-1/4 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            disabled={!selectedPart}
                        />
                    </div>
                </>
            )}
            <button type="submit" className="bg-green-500 text-white p-2 rounded w-full mt-2" disabled={mutation.isPending || !internalToolId}>
                {mutation.isPending ? <Spinner/> : t('maintenanceForm.submit_button')}
            </button>
        </form>
    );
};

export default MaintenanceForm; 