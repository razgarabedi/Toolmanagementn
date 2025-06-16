'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/Spinner';

const localizer = momentLocalizer(moment);

interface Tool {
    id: number;
    rfid: string;
    toolType: {
        name: string;
    }
}

interface Booking {
    id: number;
    startDate: string;
    endDate: string;
    tool: {
        id: number;
        name: string;
    }
}

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource?: string;
}

const CalendarPage = () => {
    const { t } = useTranslation();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedTool, setSelectedTool] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: tools, isLoading: isLoadingTools } = useQuery<Tool[]>({
        queryKey: ['tools'],
        queryFn: () => api.get('/tools').then(res => res.data),
    });

    const { data: bookings, isLoading: isLoadingBookings } = useQuery<Booking[]>({
        queryKey: ['bookings', selectedTool],
        queryFn: () => api.get(`/bookings/tool/${selectedTool}`).then(res => res.data),
        enabled: !!selectedTool,
    });

    useEffect(() => {
        if (bookings) {
            const calendarEvents = bookings.map(booking => ({
                title: 'Booked',
                start: new Date(booking.startDate),
                end: new Date(booking.endDate),
                allDay: true,
            }));
            setEvents(calendarEvents);
        }
    }, [bookings]);

    const handleNavigate = (date: Date) => {
        setCurrentDate(date);
    };
    
    const dayPropGetter = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            return {
                className: 'rbc-day-bg past-day',
                style: {
                    backgroundColor: '#f3f4f6',
                    cursor: 'not-allowed',
                },
            };
        }
        return {};
    };

    const CustomToolbar = (toolbar: { label: string, onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void }) => {
        const goToBack = () => toolbar.onNavigate('PREV');
        const goToNext = () => toolbar.onNavigate('NEXT');
        const goToCurrent = () => toolbar.onNavigate('TODAY');

        return (
            <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                    <button type="button" onClick={goToBack}>{t('calendar.previousMonth')}</button>
                    <button type="button" onClick={goToCurrent}>{t('calendar.today')}</button>
                    <button type="button" onClick={goToNext}>{t('calendar.nextMonth')}</button>
                </span>
                <span className="rbc-toolbar-label">{toolbar.label}</span>
                <span className="rbc-btn-group"></span>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6">{t('nav.calendarView')}</h1>
            <div className="mb-4">
                 <label htmlFor="tool-select" className="block text-sm font-medium text-gray-700 mb-1">{t('calendar.selectTool')}</label>
                <select
                    id="tool-select"
                    value={selectedTool}
                    onChange={(e) => setSelectedTool(e.target.value)}
                    className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
                >
                    <option value="" disabled>{t('calendar.selectTool')}</option>
                    {tools?.map(tool => (
                        <option key={tool.id} value={tool.id}>
                            {tool.toolType.name} (RFID: {tool.rfid})
                        </option>
                    ))}
                </select>
            </div>
            
            {(isLoadingTools || (selectedTool && isLoadingBookings)) && <Spinner />}

            {selectedTool ? (
                <>
                    <p className="text-center mb-4">{t('calendar.selectDay')}</p>
                    <div style={{ height: '70vh' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            views={[Views.MONTH]}
                            date={currentDate}
                            onNavigate={handleNavigate}
                            dayPropGetter={dayPropGetter}
                            components={{ toolbar: CustomToolbar }}
                        />
                    </div>
                </>
            ) : (
                <p>{t('calendar.pleaseSelectTool')}</p>
            )}
             <style jsx global>{`
                .past-day .rbc-button-link {
                    color: #9ca3af;
                }
                .past-day:after {
                    content: '${t('calendar.pastDay')}';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #9ca3af;
                    font-size: 0.8rem;
                }
                .rbc-day-bg:not(.past-day):not(.rbc-off-range-bg):not(.rbc-today) {
                    background-color: #f0fff4;
                }
                .rbc-day-bg:not(.past-day):not(.rbc-off-range-bg):not(.rbc-today):after {
                    content: '${t('calendar.availableDay')}';
                    position: absolute;
                    bottom: 5px;
                    right: 5px;
                    color: #2f855a;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default CalendarPage; 