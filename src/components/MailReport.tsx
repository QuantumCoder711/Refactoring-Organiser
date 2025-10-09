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

interface MailMessage {
    _id: string;
    eventUUID: string;
    userID: string;
    firstName: string;
    templateName: string;
    messageID: {
        _id: string;
        messageID: string;
        __v: number;
        customerEmail: string;
        messageStatus: string;
        timestamp: string;
    };
    __v: number;
}

const templates = [
    { label: "Reminder", value: "event_downloadapp" },
    { label: "Requested Attendees", value: "event_invitation" }
]

const MailReport: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { getEventBySlug } = useEventStore();
    const { token, user } = useAuthStore(state => state);
    const [tableData, setTableData] = useState<MailMessage[]>([]);

    const event = getEventBySlug(slug);

    const [selectedStatus, setSelectedStatus] = useState<"Sent" | "Delivery" | "Read" | "Bounce">("Sent");

    const [filters, setFilters] = useState({
        name: '',
        mail: ''
    });

    const [selectedTemplate, setSelectedTemplate] = useState<string>('event_downloadapp');
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

    const mailLabels = useMemo(() => {
        // Initialize counters
        let deliveryCount = 0;
        let readCount = 0;
        let bounceCount = 0;

        // Log unique statuses for debugging
        const uniqueStatuses = new Set<string>();

        // Count emails by status
        tableData.forEach(message => {
            // Get status or default to empty string
            const rawStatus = message?.messageID?.messageStatus || '';

            // Add to unique statuses set for debugging
            if (rawStatus) {
                uniqueStatuses.add(rawStatus);
            }

            // Count based on status - case sensitive match for exact statuses
            if (!message.messageID || !message.messageID.messageStatus) {
                deliveryCount++; // Default to Delivery if no status
            } else if (rawStatus === 'Bounce') {
                bounceCount++;
            } else if (rawStatus === 'Read') {
                readCount++;
            } else if (rawStatus === 'Delivery') {
                deliveryCount++;
            } else {
                // Default case - count as Delivery
                deliveryCount++;
            }
        });

        // Log unique statuses for debugging
        if (uniqueStatuses.size > 0) {
            console.log('Unique email statuses:', Array.from(uniqueStatuses));
        }

        // If no emails are categorized but we have data, count all as Delivery
        if (tableData.length > 0 && deliveryCount + readCount + bounceCount === 0) {
            deliveryCount = tableData.length;
        }

        return [
            { title: 'Sent Mails', value: deliveryCount + bounceCount, status: "Sent" },
            { title: 'Delivered Mails', value: deliveryCount, status: "Delivery" },
            { title: 'Bounce Mails', value: bounceCount, status: "Bounce" }
        ];
    }, [tableData]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            if (!event || !user) return;
            try {
                // Log the request for debugging
                console.log('Fetching mail data with params:', {
                    eventUUID: event.uuid,
                    templateName: selectedTemplate,
                    userID: user.id
                });

                const response = await axios.post(`${appDomain}/api/organiser/v1/email/all-email-recipt`,
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
                console.error('Error fetching Mail data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug, token, event, user, selectedTemplate]);

    const filteredAttendees = useMemo(() => {
        // Log the selected status for debugging
        console.log('Filtering by status:', selectedStatus);

        return tableData.filter(message => {
            // Name and email filtering
            const nameMatch = (message.firstName || '').toLowerCase().includes(filters.name.toLowerCase());
            const emailMatch = (message.messageID?.customerEmail || '').toLowerCase().includes(filters.mail.toLowerCase());

            // Get status or default to empty string
            const rawStatus = message?.messageID?.messageStatus || '';

            // Determine if this message matches the selected status
            let matchesStatus = false;

            if (selectedStatus === 'Sent') {
                // For 'Sent' tab, show items with 'Delivery' status, 'Bounce' status, or no status
                matchesStatus = !message.messageID || !message.messageID.messageStatus ||
                    rawStatus === 'Delivery' || rawStatus === 'Bounce' ||
                    (rawStatus !== 'Read');
            }
            else if (selectedStatus === 'Delivery') {
                // For 'Delivery' tab, show items with 'Delivery' status or no status
                matchesStatus = !message.messageID || !message.messageID.messageStatus ||
                    rawStatus === 'Delivery' ||
                    (rawStatus !== 'Read' && rawStatus !== 'Bounce');
            }
            else if (selectedStatus === 'Read') {
                // For 'Read' tab, only show items with 'Read' status
                matchesStatus = rawStatus === 'Read';
            }
            else if (selectedStatus === 'Bounce') {
                // For 'Bounce' tab, show items with 'Bounce' status
                matchesStatus = rawStatus === 'Bounce';
            }

            return nameMatch && emailMatch && matchesStatus;
        });
    }, [tableData, filters.name, filters.mail, selectedStatus]);

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
                {mailLabels.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => { setSelectedStatus(card.status as "Sent" | "Delivery" | "Read" | "Bounce"); setCurrentPage(1); }}
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
                                placeholder='Search by email'
                                value={filters.mail}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, mail: e.target.value }))}
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
                                <TableHead className="text-left px-2 sm:px-4 py-3 font-semibold text-xs sm:text-sm">Email</TableHead>
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
                                filteredAttendees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((message: MailMessage, index: number) => (
                                    <TableRow key={message._id} className="hover:bg-muted/50">
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {index + 1 + (currentPage - 1) * itemsPerPage}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm capitalize">
                                            {message.firstName || "-"}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                            {message.messageID?.customerEmail || "-"}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {message.messageID?.messageStatus || "-"}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                                            {message.messageID?.timestamp ? formatDateTimeReport(message.messageID.timestamp) : "-"}
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

export default MailReport;