import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useEventStore from '@/store/eventStore';
import useAttendeeStore from '@/store/attendeeStore';
import useAuthStore from '@/store/authStore';
import { dateDifference } from '@/lib/utils';
import { AttendeeType } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import GoBack from '@/components/GoBack';
import Wave from '@/components/Wave';

interface DataReportProps {
    type: "whatsapp" | "mail";
}

const DataReport: React.FC<DataReportProps> = ({ type }) => {
    const { slug } = useParams<{ slug: string }>();
    const { getEventBySlug, events } = useEventStore();
    const { token } = useAuthStore();
    const { singleEventAttendees, loading, getSingleEventAttendees } = useAttendeeStore();

    const event = getEventBySlug(slug);

    const [selectedStatus, setSelectedStatus] = useState<"sent" | "delivered" | "read" | "failed">("sent");
    const [,setDateDiff] = useState<number>(0);
    const [filters, setFilters] = useState({
        name: '',
        mail: ''
    });

    const [selectedAttendees] = useState<Set<number>>(new Set());
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const whatsappLabels = useMemo(() => [
        { title: 'Sent Messages', value: events.length, status: "sent" },
        { title: 'Delivered Messages', value: 0, status: "delivered" },
        { title: 'Read Messages', value: 0, status: "read" },
        { title: 'Failed Messages', value: 0, status: "failed" }
    ], [events.length]);

    const mailLabels = useMemo(() => [
        { title: 'Sent Mails', value: events.length, status: "sent" },
        { title: 'Delivered Mails', value: 0, status: "delivered" },
        { title: 'Failed Mails', value: 0, status: "failed" }
    ], [events.length]);

    useEffect(() => {
        if (event?.event_start_date && event?.event_end_date) {
            setDateDiff(dateDifference(event.event_start_date, event.event_end_date));
        }
    }, [event]);

    useEffect(() => {
        if (event?.uuid && token) {
            getSingleEventAttendees(token, event.uuid);
        }
    }, [event?.uuid, token, getSingleEventAttendees]);

    const filteredAttendees = useMemo(() => {
        return singleEventAttendees.filter(attendee =>
            `${attendee.first_name || ''} ${attendee.last_name || ''}`.toLowerCase().includes(filters.name.toLowerCase()) &&
            (attendee.email_id || '').toLowerCase().includes(filters.mail.toLowerCase())
        );
    }, [singleEventAttendees, filters.name, filters.mail]);

    const totalPages = useMemo(() => Math.ceil(filteredAttendees.length / itemsPerPage), [filteredAttendees.length, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    }, []);

    if (loading) return <Wave />;

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className='flex w-full gap-4 mt-11'>
                {type === "whatsapp" && whatsappLabels.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedStatus(card.status as "sent" | "delivered" | "read" | "failed")}
                        className={`min-w-40 w-full cursor-pointer duration-300 hover:bg-brand-background bg-brand-background rounded-lg h-9 px-4 shadow-blur flex justify-between items-center ${selectedStatus === card.status ? '!font-semibold' : ''}`}
                    >
                        <span>{card.title}</span>
                        <span>{card.value}</span>
                    </div>
                ))}
                {type === "mail" && mailLabels.map((card, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedStatus(card.status as "sent" | "delivered" | "read" | "failed")}
                        className={`min-w-40 w-full cursor-pointer duration-300 hover:bg-brand-background bg-brand-background rounded-lg h-9 px-4 shadow-blur flex justify-between items-center ${selectedStatus === card.status ? '!font-semibold' : ''}`}
                    >
                        <span>{card.title}</span>
                        <span>{card.value}</span>
                    </div>
                ))}
            </div>

            <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur'>
                <div className='flex w-full justify-between items-baseline'>
                    <div className='flex w-full gap-2.5'>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="rounded-sm !w-fit !max-h-[30px] border-1 border-brand-light-gray flex items-center justify-center text-sm">
                                <SelectValue placeholder={`${itemsPerPage}/Page`} />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 25, 50, 100].map(value => (
                                    <SelectItem key={value} value={value.toString()}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            className='input !min-w-fit !max-w-fit !max-h-[30px] !p-2.5 !text-xs'
                            placeholder='Search by name'
                            value={filters.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                        />

                        {type === "mail" && <Input
                            className='input !min-w-fit !max-w-fit !max-h-[30px] !p-2.5 !text-xs'
                            placeholder='Search by email'
                            value={filters.mail}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, mail: e.target.value }))}
                        />}

                        <Button
                            className='btn !rounded-[10px] !p-2.5 !bg-brand-secondary text-white'
                            disabled={selectedAttendees.size === 0}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <Table className='mt-7'>
                    <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                        <TableRow className='!rounded-[10px]'>
                            <TableHead className="text-left min-w-10 !px-2 !font-semibold">S.No</TableHead>
                            <TableHead className="text-left min-w-10 !px-2 !font-semibold">Name</TableHead>
                            <TableHead className="text-left min-w-10 !px-2 !font-semibold">Phone No.</TableHead>
                            <TableHead className="text-left min-w-10 !px-2 !font-semibold">Message Status</TableHead>
                            <TableHead className="text-left min-w-10 !px-2 !font-semibold">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAttendees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((attendee: AttendeeType, index: number) => (
                            <TableRow key={attendee.id}>
                                <TableCell className="text-left min-w-10">{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">{attendee.phone_number || "-"}</TableCell>
                                <TableCell className="text-left min-w-10">{attendee.status || "-"}</TableCell>
                                <TableCell className="text-left min-w-10">{attendee.created_at || "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Pagination className='mt-[26px] flex justify-end'>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    isActive={currentPage === i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className="cursor-pointer"
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
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

export default DataReport;