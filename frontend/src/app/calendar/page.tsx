'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';
import Spinner from '@/components/Spinner';
import BookingForm from '@/components/BookingForm';
import useAuth from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { extendMoment } from 'moment-range';
import Moment from 'moment';
import ScannerModal from '@/components/ScannerModal';
import { ScanLine } from 'lucide-react';

const moment = extendMoment(Moment);

const localizer = momentLocalizer(moment);

interface Tool {
    id: number;
    rfid: string;
    name: string;
    toolType: {
        name: string;
    }
}

interface Booking {
    id: number;
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
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
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedTool, setSelectedTool] = useState<string>('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, hasRole } = useAuth();
    const [bookingStartDate, setBookingStartDate] = useState<Date | null>(null);
    const [bookingEndDate, setBookingEndDate] = useState<Date | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [toolToBook, setToolToBook] = useState<Tool | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);

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
        moment.locale(i18n.language);
    }, [i18n.language]);

    useEffect(() => {
        if (bookings && selectedTool) {
            const activeBookings = bookings.filter(b => ['pending', 'approved', 'active'].includes(b.status));
            const calendarEvents = activeBookings.map(booking => ({
                title: t('calendar.booked'),
                start: new Date(booking.startDate),
                end: moment(booking.endDate).add(1, 'day').toDate(),
                allDay: true,
            }));
            setEvents(calendarEvents);
        } else {
            setEvents([]);
        }
    }, [bookings, selectedTool, t, i18n.language]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleScanSuccess = async (scannedId: string) => {
        try {
            const { data: foundTool } = await api.get(`/tools/${scannedId}`);
            if (foundTool) {
                setSelectedTool(foundTool.id.toString());
                setSearchTerm(`${foundTool.toolType.name} (RFID: ${foundTool.rfid})`);
                setIsDropdownOpen(false);
            } else {
                toast.error(t('calendar.toolNotFound'));
            }
        } catch (error) {
            toast.error(t('calendar.toolNotFound'));
        } finally {
            setIsScannerOpen(false);
        }
    };

    const handleNavigate = (date: Date) => {
        setCurrentDate(date);
    };
    
    const handleSelectSlot = ({ start }: { start: Date }) => {
        if (!selectedTool) {
            toast.error(t('calendar.pleaseSelectToolFirst'));
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
            toast.error(t('calendar.cannotBookPastDates'));
            return;
        }

        const isDateBooked = (bookings || [])
            .filter(b => ['pending', 'approved', 'active'].includes(b.status))
            .some(booking =>
            moment(start).isBetween(moment(booking.startDate), moment(booking.endDate), 'day', '[]')
        );

        if (isDateBooked) {
            toast.error(t('calendar.dateAlreadyBooked'));
            return;
        }

        if (!bookingStartDate || (bookingStartDate && bookingEndDate)) {
            setBookingStartDate(start);
            setBookingEndDate(null);
            setIsBookingModalOpen(false);
            toast.success(t('calendar.startDateSelected'));
        } else {
            if (moment(start).isBefore(bookingStartDate, 'day')) {
                setBookingStartDate(start);
                toast.success(t('calendar.newStartDateSelected'));
            } else {
                const selectionRange = moment.range(bookingStartDate, start);
                const isRangeOverlapping = (bookings || [])
                    .filter(b => ['pending', 'approved', 'active'].includes(b.status))
                    .some(booking => {
                    const eventRange = moment.range(moment(booking.startDate), moment(booking.endDate));
                    return selectionRange.overlaps(eventRange);
                });

                if (isRangeOverlapping) {
                    toast.error(t('calendar.rangeAlreadyBooked'));
                    setBookingStartDate(null);
                    setBookingEndDate(null);
                    return;
                }

                setBookingEndDate(start);
                const tool = tools?.find(t => t.id.toString() === selectedTool);
                if (tool) {
                    setToolToBook(tool);
                    setIsBookingModalOpen(true);
                }
            }
        }
    };

    const handleBookingModalClose = () => {
        setIsBookingModalOpen(false);
        setBookingStartDate(null);
        setBookingEndDate(null);
        setToolToBook(null);
    };

    const dayPropGetter = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const classes = ['rbc-day-bg'];
        const style: React.CSSProperties = {};

        const isBooked = (bookings || [])
            .filter(b => ['pending', 'approved', 'active'].includes(b.status))
            .some(booking =>
            moment(date).isBetween(moment(booking.startDate), moment(booking.endDate), 'day', '[]')
        );

        if (isBooked) {
            classes.push('booked-day');
            style.cursor = 'not-allowed';
        } else if (date < today) {
            classes.push('past-day');
            style.cursor = 'not-allowed';
        } else {
            classes.push('available-day');
        }

        if (bookingStartDate && !bookingEndDate && moment(date).isSame(bookingStartDate, 'day')) {
            classes.push('selected-start-date');
        }

        if (bookingStartDate && bookingEndDate && moment(date).isBetween(bookingStartDate, bookingEndDate, 'day', '[]')) {
            classes.push('selected-range');
        }
        
        return {
            className: classes.join(' '),
            style: style,
        };
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

    const formats = {
        weekdayFormat: (date: Date, culture: any, localizer: any) => localizer.format(date, 'dd', culture),
    };

    const filteredTools = tools?.filter(tool =>
        `${tool.toolType.name} (RFID: ${tool.rfid})`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6">{t('nav.calendarView')}</h1>
            <div className="mb-4">
                 <label htmlFor="tool-select" className="block text-sm font-medium text-gray-700 mb-1">{t('calendar.selectTool')}</label>
                 <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-1/3" ref={dropdownRef}>
                        <input
                            id="tool-select"
                            type="text"
                            placeholder={t('calendar.searchTool') || 'Search for a tool...'}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (e.target.value === '') {
                                    setSelectedTool('');
                                }
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            autoComplete="off"
                        />
                        {isDropdownOpen && filteredTools && (
                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                                {filteredTools.length > 0 ? (
                                    filteredTools.map(tool => (
                                        <li
                                            key={tool.id}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setSelectedTool(tool.id.toString());
                                                setSearchTerm(`${tool.toolType.name} (RFID: ${tool.rfid})`);
                                                setIsDropdownOpen(false);
                                            }}
                                        >
                                            {`${tool.toolType.name} (RFID: ${tool.rfid})`}
                                        </li>
                                    ))
                                ) : (
                                    <li className="p-2 text-gray-500">{t('calendar.noToolsFound')}</li>
                                )}
                            </ul>
                        )}
                    </div>
                    <button onClick={() => setIsScannerOpen(true)} className="p-2 border border-gray-300 rounded-md hover:bg-gray-100">
                        <ScanLine className="h-6 w-6 text-gray-600" />
                    </button>
                 </div>
            </div>
            
            {(isLoadingTools || (selectedTool && isLoadingBookings)) && <Spinner />}

            <p className="text-center mb-4">
                {selectedTool ? t('calendar.selectDay') : t('calendar.pleaseSelectTool')}
            </p>
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
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    formats={formats}
                />
            </div>
            {isBookingModalOpen && toolToBook && bookingStartDate && bookingEndDate && (
                <BookingForm
                    tool={toolToBook}
                    onClose={handleBookingModalClose}
                    isAdminOrManager={hasRole(['admin', 'manager'])}
                    startDate={bookingStartDate}
                    endDate={bookingEndDate}
                />
            )}
            <ScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScanSuccess}
            />
             <style jsx global>{`
                .rbc-event {
                    display: none;
                }
                .past-day {
                    background-color: #f3f4f6 !important;
                    position: relative;
                }
                .past-day:after {
                    content: '${t('calendar.pastDay')}';
                    position: absolute;
                    bottom: 4px;
                    right: 5px;
                    color: #9ca3af;
                    font-size: 0.7rem;
                }
                .available-day {
                    position: relative;
                }
                .available-day:after {
                    content: '${t('calendar.availableDay')}';
                    position: absolute;
                    bottom: 4px;
                    right: 5px;
                    color: #22c55e;
                    font-size: 0.7rem;
                    font-weight: bold;
                }
                .booked-day {
                    background-color: #fee2e2 !important;
                    position: relative;
                }
                .booked-day:after {
                    content: '${t('calendar.booked')}';
                    position: absolute;
                    bottom: 4px;
                    right: 5px;
                    color: #ef4444;
                    font-size: 0.7rem;
                    font-weight: bold;
                }
                .selected-start-date {
                    box-shadow: inset 0 0 0 2px #8b5cf6 !important;
                }
                .selected-range {
                    background-color: rgba(139, 92, 246, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default CalendarPage; 