'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToolActions } from '@/hooks/useToolActions';
import Spinner from '@/components/Spinner';
import { IDetectedBarcode } from '@yudiel/react-qr-scanner';

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });

const ScannerPage = () => {
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const { checkoutMutation, checkinMutation } = useToolActions();

    const { data: tool, isLoading, isError, error } = useQuery({
        queryKey: ['tool', scannedId],
        queryFn: () => api.get(`/tools/${scannedId}`),
        enabled: !!scannedId,
    });

    const handleScan = (result: IDetectedBarcode[]) => {
        if (result && result.length > 0 && isScanning) {
            setScannedId(result[0].rawValue);
            setIsScanning(false);
        }
    };

    const handleError = (error: any) => {
        console.error('QR Scanner Error:', error);
    };

    const handleReset = () => {
        setScannedId(null);
        setIsScanning(true);
    };
    
    const handleAction = () => {
        if(tool?.data.status === 'available') {
            checkoutMutation.mutate(tool.data.id, {
                onSuccess: handleReset
            });
        } else {
            checkinMutation.mutate(tool.data.id, {
                onSuccess: handleReset
            });
        }
    }

    return (
        <div className="container mx-auto p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Scan Tool Barcode/QR Code</h1>
            
            {isScanning && (
                <div style={{ width: '500px' }}>
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        styles={{ container: { width: '100%' } }}
                    />
                </div>
            )}

            {isLoading && <Spinner />}
            
            {isError && (
                 <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    <p><strong>Error:</strong> {(error as any)?.response?.data?.message || 'Tool not found'}</p>
                    <button onClick={handleReset} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                        Scan Again
                    </button>
                </div>
            )}

            {tool && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-center">
                    <h2 className="text-xl font-semibold">{tool.data.name}</h2>
                    <p><strong>Status:</strong> {tool.data.status}</p>
                    <p><strong>Condition:</strong> {tool.data.condition}</p>
                    <div className="mt-4">
                        {tool.data.status === 'available' ? (
                            <button onClick={handleAction} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                                Check Out
                            </button>
                        ) : (
                             <button onClick={handleAction} className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
                                Check In
                            </button>
                        )}
                        <button onClick={handleReset} className="bg-gray-500 text-white px-4 py-2 rounded">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScannerPage; 