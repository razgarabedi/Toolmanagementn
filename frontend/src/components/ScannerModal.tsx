'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';
import Modal from './Modal';
import { IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { useTranslation } from 'react-i18next';

const Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const ScannerModal: FC<ScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const { t } = useTranslation();

  const handleScan = (result: IDetectedBarcode[]) => {
    if (result && result.length > 0) {
      onScan(result[0].rawValue);
      onClose();
    }
  };

  const handleError = (error: unknown) => {
    console.error('QR Scanner Error:', error);
    // Optionally, add user-facing error handling here
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('scanner.title')}>
      <div style={{ width: '100%' }}>
        <Scanner
          onScan={handleScan}
          onError={handleError}
          styles={{ container: { width: '100%' } }}
        />
      </div>
    </Modal>
  );
};

export default ScannerModal; 