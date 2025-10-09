import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useEventStore from '@/store/eventStore';
import useAuthStore from '@/store/authStore';
import { formatDateTimeReport } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';
import axios from 'axios';
import { appDomain } from '@/constants';

interface WhatsAppMessage {
    _id: string;
    eventUUID: string;
    userID: string;
    firstName: string;
    templateName: string;
    messageID: {
        _id: string;
        messageID: string;
        __v: number;
        customerPhoneNumber: string;
        messageStatus: string;
        timestamp: string;
    };
    __v: number;
}

const templates = [
    { label: "Reminder", value: "event_downloadapp" },
    { label: "Same Day Invitation", value: "event_reminder_today" },
    { label: "Event Poll", value: "event_poll_feedback" },
    { label: "Send Template Message", value: "reminder_iimm_v1" },
    { label: "Session Reminder", value: "session_reminder" },
    { label: "Visit Booth", value: "reminder_to_visit_booth" },
    { label: "Day 2 Reminder", value: "day_2_reminder" },
    { label: "Day 2 Same Day Reminder", value: "day_2_same_day_reminder" },
    { label: "Thank You Message", value: "post_thank_you_messageevent" },
    { label: "Requested Attendees", value: "event_invitation" }
]

const WhatsAppReport: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { getEventBySlug } = useEventStore();
    const { token, user } = useAuthStore(state => state);
    const [tableData, setTableData] = useState<WhatsAppMessage[]>([]);

    const event = getEventBySlug(slug);

    const [selectedStatus, setSelectedStatus] = useState<"sent" | "delivered" | "read" | "failed">("sent");

    const [filters, setFilters] = useState({
        name: '',
        phone: '',
        mail: ''
    });

    const [selectedTemplate, setSelectedTemplate] = useState<string>('event_downloadapp');

    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const whatsappLabels = useMemo(() => {
        const statusCounts = tableData.reduce((acc, message) => {
            const status = message?.messageID?.messageStatus?.toLowerCase();
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return [
            { title: 'Sent Messages', value: (statusCounts?.delivered || 0) + (statusCounts?.read || 0) + (statusCounts?.failed || 0) + (statusCounts?.sent || 0), status: "sent" },
            { title: 'Delivered Messages', value: (statusCounts.delivered || 0) + (statusCounts.read || 0), status: "delivered" },
            { title: 'Read Messages', value: statusCounts.read || 0, status: "read" },
            { title: 'Failed Messages', value: statusCounts.failed || 0, status: "failed" }
        ];
    }, [tableData]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (!event || !user) return;
            try {
                const response = await axios.post(`${appDomain}/api/organiser/v1/whatsapp/all-recipt`,
                    {
                        eventUUID: event.uuid,
                        templateName: selectedTemplate,
                        userID: user.id,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                if (response.data) {
                    setTableData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching WhatsApp data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug, token, event, user, selectedTemplate]);

    const filteredAttendees = useMemo(() => {
        return tableData.filter(message =>
            (message.firstName || '').toLowerCase().includes(filters?.name?.toLowerCase()) &&
            (message.messageID?.customerPhoneNumber || '').toLowerCase().includes(filters?.phone?.toLowerCase()) &&
            (selectedStatus === "sent" || message?.messageID?.messageStatus?.toLowerCase() === selectedStatus)
        );
    }, [tableData, filters.name, filters.phone, selectedStatus]);

    const totalPages = useMemo(() => Math.ceil(filteredAttendees.length / itemsPerPage), [filteredAttendees.length, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    }, []);

    if (loading) return <div className='min-h-full w-full'><Wave /></div>;

    return (
        <div className='h-full w-full'>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
                <div className='flex items-center gap-4'>
                    <GoBack />
                    <h1 className='text-lg sm:text-xl font-semibold truncate'>{event?.title}</h1>
                </div>
                
                <div className='hidden sm:block'>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger className="w-full sm:w-56 cursor-pointer">
                            <SelectValue placeholder="Select Template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template, key) => (
                                <SelectItem key={key} value={template.value} className='cursor-pointer'>{template.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Status Cards */}
            <div className='flex flex-wrap gap-3 mb-6'>
                {whatsappLabels.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => {setSelectedStatus(card.status as "sent" | "delivered" | "read" | "failed"); setCurrentPage(1);}}
                        className={`flex-1 min-w-[120px] cursor-pointer duration-300 hover:bg-accent bg-muted rounded-lg h-10 px-3 sm:px-4 flex justify-between items-center text-foreground ${selectedStatus === card.status ? 'bg-primary hover:bg-primary text-white' : ''}`}
                    >
                        <span className='text-xs sm:text-sm truncate'>{card.title}</span>
                        <span className='text-sm font-medium ml-2'>{card.value}</span>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className='bg-muted rounded-lg p-4 sm:p-5 mt-6 shadow-blur'>
                {/* Filters Section */}
                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
                    <div className='flex flex-col sm:flex-row gap-3 w-full'>
                        <div className='flex gap-2 sm:flex-row flex-col flex-1'>
                            
                            <div className='flex gap-2'>
                                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                    <SelectTrigger className="w-fit cursor-pointer !min-h-10 border border-accent flex items-center justify-center text-sm">
                                        <SelectValue placeholder={`${itemsPerPage}/Page`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50, 100].map(value => (
                                            <SelectItem key={value} value={value.toString()} className='cursor-pointer'>{value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className='sm:hidden w-full'>
                                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                        <SelectTrigger className="w-full sm:w-56 min-h-full cursor-pointer">
                                            <SelectValue placeholder="Select Template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates.map((template, key) => (
                                                <SelectItem key={key} value={template.value} className='cursor-pointer'>{template.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Input
                                className='flex-1 sm:max-w-60 !min-h-10 text-xs'
                                placeholder='Search by name'
                                value={filters.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <Input
                                className='flex-1 sm:max-w-60 !min-h-10 text-xs'
                                placeholder='Search by phone'
                                value={filters.phone}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Container with Horizontal Scroll */}
                <div className="overflow-x-auto">
                    <Table className='w-full'>
                        <TableHeader className='bg-accent'>
                            <TableRow>
                                <TableHead className="text-left px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm">S.No</TableHead>
                                <TableHead className="text-left px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm">Name</TableHead>
                                <TableHead className="text-left px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm">Phone No.</TableHead>
                                <TableHead className="text-left px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm">Message Status</TableHead>
                                <TableHead className="text-left px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttendees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No data available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttendees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((message: WhatsAppMessage, index: number) => (
                                    <TableRow key={message._id} className='capitalize hover:bg-background/50'>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {index + 1 + (currentPage - 1) * itemsPerPage}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {message.firstName || "-"}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {message?.messageID?.customerPhoneNumber || "-"}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {message?.messageID?.messageStatus || "-"}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {formatDateTimeReport(message?.messageID?.timestamp) || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <Pagination className='mt-6 flex justify-center sm:justify-end'>
                    <PaginationContent className='flex-wrap justify-center'>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>

                        {/* Show first page */}
                        {totalPages > 0 && (
                            <PaginationItem>
                                <PaginationLink
                                    isActive={currentPage === 1}
                                    onClick={() => handlePageChange(1)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                >
                                    1
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {/* Show ellipsis if needed */}
                        {currentPage > 3 && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        {/* Show current page and adjacent pages */}
                        {totalPages > 1 && currentPage > 2 && (
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                >
                                    {currentPage - 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {totalPages > 1 && currentPage > 1 && currentPage < totalPages && (
                            <PaginationItem>
                                <PaginationLink
                                    isActive={true}
                                    className="cursor-pointer text-xs sm:text-sm"
                                >
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {totalPages > 2 && currentPage < totalPages - 1 && (
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                >
                                    {currentPage + 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {/* Show ellipsis if needed */}
                        {currentPage < totalPages - 2 && (
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )}

                        {/* Show last page */}
                        {totalPages > 1 && (
                            <PaginationItem>
                                <PaginationLink
                                    isActive={currentPage === totalPages}
                                    onClick={() => handlePageChange(totalPages)}
                                    className="cursor-pointer text-xs sm:text-sm"
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

export default WhatsAppReport;