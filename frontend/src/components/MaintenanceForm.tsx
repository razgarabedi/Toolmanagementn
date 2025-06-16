'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Spinner from './Spinner';

interface MaintenanceFormProps {
    toolId: number;
    maintenanceId?: number;
    onFormSubmit?: () => void;
    isRepairRequest?: boolean;
}

interface NewMaintenance {
    toolId: number;
    description: string;
    cost: number;
    status: string;
}

interface SparePart {
    id: number;
    name: string;
    quantity: number;
}

const MaintenanceForm = ({ toolId, maintenanceId, onFormSubmit, isRepairRequest }: MaintenanceFormProps) => {
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState('');
    const [status, setStatus] = useState(isRepairRequest ? 'requested' : 'scheduled');
    const [selectedPart, setSelectedPart] = useState('');
    const [partQuantity, setPartQuantity] = useState(1);
    
    const queryClient = useQueryClient();

    const { data: spareParts } = useQuery<SparePart[]>({
        queryKey: ['spareParts'],
        queryFn: () => api.get('/spare-parts').then(res => res.data)
    });

    const mutation = useMutation({
        mutationFn: (newMaintenance: NewMaintenance) => 
            maintenanceId 
                ? api.put(`/maintenance/${maintenanceId}`, newMaintenance)
                : api.post('/maintenance', newMaintenance),
        onSuccess: (data) => {
            if(selectedPart && data.data.id) {
                assignPartMutation.mutate({
                    maintenanceId: data.data.id,
                    sparePartId: Number(selectedPart),
                    quantityUsed: partQuantity,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['maintenanceHistory', toolId] });
            queryClient.invalidateQueries({ queryKey: ['tool', toolId] });
            toast.success(isRepairRequest ? 'Repair requested successfully!' : 'Maintenance scheduled successfully!');
            onFormSubmit?.();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'An error occurred');
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
        mutation.mutate({
            toolId,
            description,
            cost: cost ? parseFloat(cost) : 0,
            status,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg my-4">
            <h3 className="text-xl font-bold mb-2">{maintenanceId ? 'Update' : (isRepairRequest ? 'Request' : 'Schedule')} Maintenance</h3>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full p-2 mb-2 border rounded"
                required
            />
            {!isRepairRequest && (
                <>
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="Cost"
                        className="w-full p-2 mb-2 border rounded"
                    />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 mb-2 border rounded">
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    
                    <h4 className="font-bold mt-2">Assign Spare Part</h4>
                    <div className="flex gap-2">
                        <select value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)} className="w-full p-2 border rounded">
                            <option value="">Select a part...</option>
                            {spareParts?.map(part => (
                                <option key={part.id} value={part.id}>
                                    {part.name} (Qty: {part.quantity})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={partQuantity}
                            onChange={(e) => setPartQuantity(Number(e.target.value))}
                            min="1"
                            className="w-1/4 p-2 border rounded"
                            disabled={!selectedPart}
                        />
                    </div>
                </>
            )}
            <button type="submit" className="bg-green-500 text-white p-2 rounded w-full mt-2" disabled={mutation.isPending}>
                {mutation.isPending ? <Spinner/> : 'Submit'}
            </button>
        </form>
    );
};

export default MaintenanceForm; 