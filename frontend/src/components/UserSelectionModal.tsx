'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Spinner from './Spinner';
import { X } from 'lucide-react';

interface User {
    id: number;
    username: string;
}

interface UserSelectionModalProps {
    onSelect: (userId: number) => void;
    onClose: () => void;
}

const UserSelectionModal = ({ onSelect, onClose }: UserSelectionModalProps) => {
    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: () => api.get('/users').then(res => res.data)
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm relative">
                <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-4">Select User</h3>
                {isLoading ? <Spinner /> : (
                    <ul className="max-h-60 overflow-y-auto">
                        {users?.map(user => (
                            <li key={user.id} onClick={() => onSelect(user.id)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                {user.username}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UserSelectionModal; 