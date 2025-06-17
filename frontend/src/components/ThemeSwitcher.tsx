'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = () => {
  const { t } = useTranslation('common');

  // Theme logic will be added here

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{t('settings.general.theme.title')}</h2>
      <div className="flex items-center space-x-4">
        <p>{t('settings.general.theme.description')}</p>
        {/* Theme options will be rendered here */}
      </div>
    </div>
  );
};

export default ThemeSwitcher; 