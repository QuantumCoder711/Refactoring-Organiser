import useAttendeeStore from '@/store/attendeeStore';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, SquarePen, UserCheck, Trash, CircleX, CircleCheck, ArrowDownToLine } from 'lucide-react';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';
import { dateDifference, formatDateTime, isEventLive } from '@/lib/utils';

import {
    Table,
    TableBody,
    // TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AttendeeType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import GoBack from '@/components/GoBack';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";



const PendingUserRequest: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore(state => state.getEventBySlug(slug));
    const { token, user } = useAuthStore(state => state);
    const { singleEventAttendees, loading, deleteAttendee, customCheckIn, bulkDeleteAttendees, getSingleEventAttendees } = useAttendeeStore(state => state);

    // Date Difference State
    const [dateDiff, setDateDiff] = useState<number>(0);

    // Calculate date difference when event changes
    useEffect(() => {
        if (event?.event_start_date && event?.event_end_date) {
            const diff = dateDifference(event.event_start_date, event.event_end_date);
            setDateDiff(diff);
        }
    }, [event]);

    // Fetch attendees when component mounts or event changes
    useEffect(() => {
        if (event?.uuid && token) {
            getSingleEventAttendees(token, event.uuid);
        }
    }, [event?.uuid, token, getSingleEventAttendees]);

    // Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [designationFilter, ] = useState('');
    const [checkInFilter, ] = useState<string>('all');
    const [roleFilter, ] = useState<string>('all');

    // Add selected attendees state
    const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());

    // Add pagination state
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredAttendees = useMemo(() => {
        setCurrentPage(1);
        return singleEventAttendees.filter(attendee => {
            const nameMatch = `${attendee.first_name || ''} ${attendee.last_name || ''}`.toLowerCase().includes(nameFilter.toLowerCase());
            const companyMatch = attendee.company_name?.toLowerCase().includes(companyFilter.toLowerCase()) ?? false;

            // Handle null designation (job_title)
            const designationMatch = designationFilter === '' ||
                (attendee.job_title ?
                    attendee.job_title.toLowerCase().includes(designationFilter.toLowerCase()) :
                    designationFilter === '');

            const checkInMatch = checkInFilter === '' || checkInFilter === 'all' ||
                (checkInFilter === '1' && attendee.check_in === 1) ||
                (checkInFilter === '0' && attendee.check_in === 0);
            const roleMatch = roleFilter === '' || roleFilter === 'all' || attendee.status?.toLowerCase() === roleFilter.toLowerCase();

            return nameMatch && companyMatch && designationMatch && checkInMatch && roleMatch;
        });
    }, [singleEventAttendees, nameFilter, companyFilter, designationFilter, checkInFilter, roleFilter]);

    // Calculate paginated data
    const paginatedAttendees = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAttendees.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAttendees, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredAttendees.length / itemsPerPage);
    }, [filteredAttendees.length, itemsPerPage]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Handle delete attendee
    const handleDeleteAttendee = async (id: number) => {
        if (token) {
            const response = await deleteAttendee(id, token);
            if (response.status === 200) {
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.message, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        }
    }

    // Handle custom check-in
    const handleCustomCheckIn = async (uuid: string) => {
        if (token && event && user) {
            const response = await customCheckIn(uuid, event?.id, user?.id, token);
            if (response.status === 200) {
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.message, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        }
    }

    // Handle checkbox selection
    const handleSelectAttendee = (id: number, isSelected: boolean) => {
        setSelectedAttendees(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    };

    // Handle delete selected
    const handleDeleteSelected = async () => {
        const selectedIds = Array.from(selectedAttendees);
        if (token && selectedIds.length > 0) {
            const response = await bulkDeleteAttendees(token, selectedIds);
            if (response.status === 200) {
                // Clear selected attendees after successful deletion
                setSelectedAttendees(new Set());
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.message, {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        }
    };

    // Generate check-in data cells based on date difference
    const renderCheckInData = (attendee: AttendeeType) => {
        const cells = [];
        if (dateDiff >= 0) {
            cells.push(
                <TableCell key="check-in-1" className="text-left min-w-10">
                    {attendee.check_in !== null && attendee.check_in !== undefined ?
                        (attendee.check_in === 1 ?
                            (attendee.check_in_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_time)}</> : "Checked In") :
                            "-") :
                        "-"}
                </TableCell>
            );
        }
        if (dateDiff >= 1) {
            cells.push(
                <TableCell key="check-in-2" className="text-left min-w-10">
                    {attendee.check_in_second !== null && attendee.check_in_second !== undefined ?
                        (attendee.check_in_second === 1 ?
                            (attendee.check_in_second_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_second_time)}</> : "Checked In") :
                            "-") :
                        "-"}
                </TableCell>
            );
        }
        if (dateDiff >= 2) {
            cells.push(
                <TableCell key="check-in-3" className="text-left min-w-10">
                    {attendee.check_in_third !== null && attendee.check_in_third !== undefined ?
                        (attendee.check_in_third === 1 ?
                            (attendee.check_in_third_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_third_time)}</> : "Checked In") :
                            "-") :
                        "-"}
                </TableCell>
            );
        }
        if (dateDiff >= 3) {
            cells.push(
                <TableCell key="check-in-4" className="text-left min-w-10">
                    {attendee.check_in_forth !== null && attendee.check_in_forth !== undefined ?
                        (attendee.check_in_forth === 1 ?
                            (attendee.check_in_forth_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_forth_time)}</> : "Checked In") :
                            "-") :
                        "-"}
                </TableCell>
            );
        }
        if (dateDiff >= 4) {
            cells.push(
                <TableCell key="check-in-5" className="text-left min-w-10">
                    {attendee.check_in_fifth !== null && attendee.check_in_fifth !== undefined ?
                        (attendee.check_in_fifth === 1 ?
                            (attendee.check_in_fifth_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_fifth_time)}</> : "Checked In") :
                            "-") :
                        "-"}
                </TableCell>
            );
        }
        return cells;
    };

    if (loading) return <Wave />

    return (
        <div>

            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>
            </div>

            {/* Table */}
            <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur'>

                {/* Filters Bar */}
                <div className='flex justify-between mt-4'>
                    <div className='flex gap-2.5'>
                        {/* Select Box for pagination */}
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="rounded-sm !w-fit !h-[30px] border-1  border-brand-light-gray flex items-center justify-center text-sm">
                                <SelectValue placeholder={`${itemsPerPage}/Page`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Search By Name */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by name'
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                        />

                        {/* Search By Email */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by email'
                        />

                        {/* Search By Company */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by company'
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                        />

                        <Button
                            className='btn !rounded-[10px] min-w-fit w-36 text-white'
                            onClick={handleDeleteSelected}
                            // disabled={selectedAttendees.size === 0}
                        >
                            <ArrowDownToLine />  Download Excel
                        </Button>
                    </div>
                    <p className='font-semibold text-xl'>Pending Requests: 69</p>
                </div>

                <Table className='mt-4'>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                        <TableRow className='!text-base'>
                            <TableHead className="text-left min-w-10 !px-2">Actions</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Status</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">First Name</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Last Name</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Mobile</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedAttendees.map((attendee: AttendeeType, index: number) => (
                            <TableRow key={attendee.id}>
                                <TableCell className="text-left min-w-10">
                                    <Checkbox
                                        className='bg-white border-brand-dark-gray cursor-pointer'
                                        checked={selectedAttendees.has(attendee.id)}
                                        onCheckedChange={(checked) => handleSelectAttendee(attendee.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell className="text-left min-w-10 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.job_title || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.company_name || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.email_id || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.alternate_email || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.phone_number || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.alternate_mobile_number || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.status || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.award_winner !== null && attendee.award_winner !== undefined
                                        ? (attendee.award_winner === 1 ? "Yes" : "No")
                                        : "-"}
                                </TableCell>
                                {renderCheckInData(attendee)}
                                <TableCell className="text-left min-w-10 flex items-center gap-1.5">

                                    {/* For Viewing the Event */}
                                    <Dialog>
                                        <DialogTrigger className='cursor-pointer'><Eye width={13} height={9} /></DialogTrigger>
                                        <DialogContent className="max-w-md p-6">
                                            <DialogHeader className="space-y-2">
                                                <DialogTitle className="text-2xl font-bold text-brand-primary">
                                                    Attendee Details
                                                </DialogTitle>
                                                <div className="h-1 w-12 bg-brand-primary rounded-full"></div>
                                            </DialogHeader>

                                            <div className="mt-8 space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.first_name} {attendee.last_name}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.job_title || '-'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.email_id || '-'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.company_name || '-'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.phone_number || '-'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alternate Email</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.alternate_email || '-'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                                                        <p className="text-base font-medium text-gray-800 capitalize">{attendee.status || '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Edit Event */}
                                    <Link to="#" className=''><SquarePen width={9.78} height={9.5} /></Link>

                                    {/* Custom Check-In User */}
                                    {isEventLive(event) && <AlertDialog>
                                        <AlertDialogTrigger className='cursor-pointer'>
                                            <UserCheck width={10} height={11} className='fill-brand-primary stroke-brand-primary' />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure want to mark this user as checked in ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className='cursor-pointer bg-brand-primary hover:bg-brand-primary text-white' onClick={() => handleCustomCheckIn(attendee.uuid)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>}

                                    {/* Delete Attendee */}
                                    <AlertDialog>
                                        <AlertDialogTrigger className='cursor-pointer'>
                                            <Trash width={9} height={11} className='fill-brand-secondary stroke-brand-secondary' />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure want to delete {attendee.first_name} {attendee.last_name} ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className='cursor-pointer bg-brand-secondary hover:bg-brand-secondary text-white' onClick={() => handleDeleteAttendee(attendee.id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <Pagination className='mt-[26px] flex justify-end'>
                    <PaginationContent>
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
                                    className="cursor-pointer"
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
                                    className="cursor-pointer"
                                >
                                    {currentPage - 1}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {totalPages > 1 && currentPage > 1 && currentPage < totalPages && (
                            <PaginationItem>
                                <PaginationLink
                                    isActive={true}
                                    className="cursor-pointer"
                                >
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {totalPages > 2 && currentPage < totalPages - 1 && (
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="cursor-pointer"
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
                                    className="cursor-pointer"
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
    )
}

export default PendingUserRequest;