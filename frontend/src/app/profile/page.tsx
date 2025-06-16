'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
    const { t } = useTranslation();

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p>{t('profile.wip')}</p>
            </div>
        </div>
    );
};

export default ProfilePage; 