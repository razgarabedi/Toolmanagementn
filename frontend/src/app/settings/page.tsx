'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MasterDataManagement from '@/components/MasterDataManagement';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import RegistrationSettings from '@/components/RegistrationSettings';

const SettingsPage = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState('masterData');

  const tabs = [
    { id: 'masterData', label: t('settings.tabs.masterData') },
    { id: 'notifications', label: t('settings.tabs.notifications') },
    { id: 'general', label: t('settings.tabs.general') },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('settings.title')}</h1>
      <div className="flex flex-col md:flex-row">
        <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-left ${
                activeTab === tab.id
                  ? 'border-b-2 md:border-b-0 md:border-l-2 border-blue-500 bg-blue-50'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-grow p-4">
          {activeTab === 'masterData' && (
            <div className="space-y-8">
              <MasterDataManagement resource="category" title={t('settings.masterData.categories')} />
              <MasterDataManagement resource="manufacturer" title={t('settings.masterData.manufacturers')} />
              <MasterDataManagement resource="tool-type" title={t('settings.masterData.toolTypes')} />
              <MasterDataManagement resource="location" title={t('settings.masterData.locations')} />
            </div>
          )}
          {activeTab === 'notifications' && (
            <div>{t('settings.placeholder', { tab: t('settings.tabs.notifications') })}</div>
          )}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <ThemeSwitcher />
              <RegistrationSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 