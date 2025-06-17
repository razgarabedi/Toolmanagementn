'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import ToolTypeFormModal from './ToolTypeFormModal';
import MasterDataFormModal from './MasterDataFormModal';
import Image from 'next/image';
import axios from 'axios';

interface ToolInstanceFormData {
    toolTypeId: string;
    rfid: string;
    serialNumber: string;
    status: string;
    condition: string;
    purchaseDate: string;
    cost: string;
    warrantyEndDate: string;
    locationId: string;
    manufacturerId: string;
    instanceImage: File | null;
    attachments: File[];
    description: string;
    name: string;
}

interface ToolType {
    id: number;
    name: string;
    description: string;
    category?: { name: string };
}

interface Location {
    id: number;
    name: string;
}

interface Manufacturer {
    id: number;
    name: string;
}

const ToolInstanceForm = ({ instance, onFormSubmit }: { instance?: ToolInstance | null, onFormSubmit: () => void }) => {
    const { t } = useTranslation('common');
    const queryClient = useQueryClient();
    const [isToolTypeModalOpen, setIsToolTypeModalOpen] = useState(false);
    const [isManufacturerModalOpen, setIsManufacturerModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [selectedToolType, setSelectedToolType] = useState<ToolType | null>(null);

    const [formData, setFormData] = useState<ToolInstanceFormData>({
        toolTypeId: '',
        name: '',
        rfid: '',
        serialNumber: '',
        status: 'available',
        condition: 'new',
        purchaseDate: '',
        cost: '',
        warrantyEndDate: '',
        locationId: '',
        manufacturerId: '',
        instanceImage: null,
        attachments: [],
        description: '',
    });

    const { data: toolTypesData } = useQuery<{ data: ToolType[] }>({
        queryKey: ['tool-types'],
        queryFn: () => api.get('/tool-types').then(res => res.data),
    });
    const toolTypes = toolTypesData?.data;

    const { data: locationsData } = useQuery<{ data: Location[] }>({
        queryKey: ['locations'],
        queryFn: () => api.get('/locations').then(res => res.data),
    });
    const locations = locationsData?.data;

    const { data: manufacturersData } = useQuery<{ data: Manufacturer[] }>({
        queryKey: ['manufacturers'],
        queryFn: () => api.get('/manufacturers').then(res => res.data),
    });
    const manufacturers = manufacturersData?.data;

    useEffect(() => {
        if (instance) {
            setFormData({
                toolTypeId: instance.toolTypeId || '',
                name: instance.name || '',
                rfid: instance.rfid || '',
                serialNumber: instance.serialNumber || '',
                status: instance.status || 'available',
                condition: instance.condition || 'new',
                purchaseDate: instance.purchaseDate || '',
                cost: instance.cost || '',
                warrantyEndDate: instance.warrantyEndDate || '',
                locationId: instance.locationId || '',
                manufacturerId: instance.manufacturerId || '',
                instanceImage: null,
                attachments: [],
                description: instance.description || '',
            });
        } else {
            setFormData({
                toolTypeId: '',
                name: '',
                rfid: '',
                serialNumber: '',
                status: 'available',
                condition: 'new',
                purchaseDate: '',
                cost: '',
                warrantyEndDate: '',
                locationId: '',
                manufacturerId: '',
                instanceImage: null,
                attachments: [],
                description: '',
            });
        }
    }, [instance]);

    useEffect(() => {
        if (formData.toolTypeId) {
            const toolType = toolTypes?.find(tt => tt.id === parseInt(formData.toolTypeId));
            setSelectedToolType(toolType || null);
            if (toolType) {
                setFormData(prev => ({
                    ...prev, 
                    description: toolType.description || '',
                    name: toolType.name || ''
                }));
            }
        } else {
            setSelectedToolType(null);
            setFormData(prev => ({
                ...prev, 
                description: '',
                name: ''
            }));
        }
    }, [formData.toolTypeId, toolTypes]);

    const mutation = useMutation({
        mutationFn: (formData: FormData) => {
            if (instance) {
                return api.put(`/tool-instances/${instance.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            return api.post('/tool-instances', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (e.target.name === 'instanceImage') {
                setFormData({ ...formData, instanceImage: e.target.files[0] });
            } else {
                setFormData({ ...formData, attachments: [...formData.attachments, ...Array.from(e.target.files)] });
            }
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, closeOnSubmit: boolean = true) => {
        e.preventDefault();
        const postData = new FormData();
        (Object.keys(formData) as Array<keyof ToolInstanceFormData>).forEach(key => {
            const value = formData[key];
            if (key === 'attachments' && Array.isArray(value)) {
                value.forEach((file: File) => {
                    postData.append('attachments', file);
                });
            } else if (key === 'instanceImage' && value) {
                postData.append(key, value as Blob);
            }
            else if (value !== null && key !== 'instanceImage') {
                postData.append(key, value as string);
            }
        });
        mutation.mutate(postData, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['tool-instances'] });
                queryClient.invalidateQueries({ queryKey: ['tool-types'] });
                toast.success(t(instance ? 'toolInstanceForm.updateSuccess' : 'toolInstanceForm.success'));
                if (closeOnSubmit) {
                    onFormSubmit();
                }
                // Reset form for "Save and New"
                setFormData({
                    toolTypeId: '',
                    name: '',
                    rfid: '',
                    serialNumber: '',
                    description: '',
                    status: 'available',
                    condition: 'new',
                    purchaseDate: '',
                    cost: '',
                    warrantyEndDate: '',
                    locationId: '',
                    manufacturerId: '',
                    instanceImage: null,
                    attachments: []
                });
            },
            onError: (error: unknown) => {
                let message = t('toolInstanceForm.error');
                if (axios.isAxiosError<{ message: string }>(error) && error.response?.data?.message) {
                    message = error.response.data.message;
                }
                toast.error(message);
            }
        });
    
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{instance ? t('toolInstanceForm.editTitle') : t('toolInstanceForm.addTitle')}</h2>
                        <button onClick={onFormSubmit} className="text-gray-500 hover:text-gray-800">&times;</button>
                    </div>

                    <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-6">
                        {/* Form fields will go here */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Werkzeugtyp */}
                            <div className="col-span-2">
                                <label htmlFor="toolTypeId" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.toolType')}</label>
                                <div className="flex items-center space-x-2">
                                    <select id="toolTypeId" name="toolTypeId" value={formData.toolTypeId} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                                        <option value="">{t('toolInstanceForm.selectToolType')}</option>
                                        {toolTypes?.map(tt => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setIsToolTypeModalOpen(true)} className="mt-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">+</button>
                                </div>
                            </div>

                            {/* Instanzname & RFID */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.instanceName')}</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="rfid" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.rfid')}</label>
                                <input type="text" id="rfid" name="rfid" value={formData.rfid} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>

                            {/* Seriennummer */}
                            <div className="col-span-2">
                                <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.serialNumber')}</label>
                                <input type="text" id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            
                            {/* Beschreibung */}
                            <div className="col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.description')}</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>

                            {/* Instanzbild */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.instanceImage')}</label>
                                <div className="mt-1 flex items-center">
                                    <input type="file" name="instanceImage" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                </div>
                                {formData.instanceImage && <Image src={URL.createObjectURL(formData.instanceImage)} alt="preview" className="mt-2 h-32" width={128} height={128} />}
                            </div>
                            
                            {/* Kategorie & Hersteller */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.category')}</label>
                                <input type="text" value={selectedToolType?.category?.name || ''} readOnly className="mt-1 block w-full p-2 bg-gray-100 border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.manufacturer')}</label>
                                <div className="flex items-center space-x-2">
                                    <select id="manufacturerId" name="manufacturerId" value={formData.manufacturerId} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                                        <option value="">{t('toolInstanceForm.selectManufacturer')}</option>
                                        {manufacturers?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setIsManufacturerModalOpen(true)} className="mt-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">+</button>
                                </div>
                            </div>

                            {/* Status & Zustand */}
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.status')}</label>
                                <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                                    <option value="available">{t('toolInstanceForm.status.available')}</option>
                                    <option value="in_use">{t('toolInstanceForm.status.in_use')}</option>
                                    <option value="in_maintenance">{t('toolInstanceForm.status.in_maintenance')}</option>
                                    <option value="booked">{t('toolInstanceForm.status.booked')}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.condition')}</label>
                                <select id="condition" name="condition" value={formData.condition} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                                    <option value="new">{t('toolInstanceForm.condition.new')}</option>
                                    <option value="good">{t('toolInstanceForm.condition.good')}</option>
                                    <option value="fair">{t('toolInstanceForm.condition.fair')}</option>
                                    <option value="poor">{t('toolInstanceForm.condition.poor')}</option>
                                </select>
                            </div>

                            {/* Kaufdatum & Kaufkosten */}
                            <div>
                                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.purchaseDate')}</label>
                                <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            <div>
                                <label htmlFor="cost" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.cost')}</label>
                                <input type="number" id="cost" name="cost" value={formData.cost} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>
                            
                            {/* Standort */}
                            <div className="col-span-2">
                                <label htmlFor="locationId" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.location')}</label>
                                <div className="flex items-center space-x-2">
                                    <select id="locationId" name="locationId" value={formData.locationId} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                                        <option value="">{t('toolInstanceForm.selectLocation')}</option>
                                        {locations?.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                    <button type="button" onClick={() => setIsLocationModalOpen(true)} className="mt-1 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">+</button>
                                </div>
                            </div>
                            
                            {/* Garantieablaufdatum */}
                            <div className="col-span-2">
                                <label htmlFor="warrantyEndDate" className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.warrantyEndDate')}</label>
                                <input type="date" id="warrantyEndDate" name="warrantyEndDate" value={formData.warrantyEndDate} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm"/>
                            </div>

                            {/* Anhänge */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">{t('toolInstanceForm.attachments')}</label>
                                <input type="file" name="attachments" multiple onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={onFormSubmit} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('toolInstanceForm.cancel')}</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={mutation.isPending}>
                                {mutation.isPending ? <Spinner /> : t('toolInstanceForm.save')}
                            </button>
                            <button type="button" onClick={(e) => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>, false)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" disabled={mutation.isPending}>
                                {t('toolInstanceForm.saveAndNew')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {isToolTypeModalOpen && (
                <ToolTypeFormModal
                    onClose={() => setIsToolTypeModalOpen(false)}
                    onSuccess={(newToolType) => {
                        queryClient.setQueryData(['tool-types'], (old: ToolType[] | undefined) => [...(old || []), newToolType]);
                        setFormData(prev => ({ ...prev, toolTypeId: newToolType.id.toString() }));
                        setIsToolTypeModalOpen(false);
                    }}
                />
            )}

            {isManufacturerModalOpen && (
                <MasterDataFormModal
                    resource="manufacturer"
                    title={t('settings.masterData.manufacturers')}
                    item={null}
                    onClose={() => setIsManufacturerModalOpen(false)}
                    onSuccess={(newManufacturer) => {
                        queryClient.setQueryData(['manufacturers'], (old: Manufacturer[] | undefined) => [...(old || []), newManufacturer]);
                        setFormData(prev => ({...prev, manufacturerId: newManufacturer.id.toString() }));
                    }}
                />
            )}

            {isLocationModalOpen && (
                <MasterDataFormModal
                    resource="location"
                    title={t('settings.masterData.locations')}
                    item={null}
                    onClose={() => setIsLocationModalOpen(false)}
                    onSuccess={(newLocation) => {
                        queryClient.setQueryData(['locations'], (old: Location[] | undefined) => [...(old || []), newLocation]);
                        setFormData(prev => ({...prev, locationId: newLocation.id.toString() }));
                    }}
                />
            )}
        </>
    );
};

export default ToolInstanceForm; 