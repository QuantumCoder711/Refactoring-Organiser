import useAttendeeStore from '@/store/attendeeStore';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, SquarePen, Trash, CircleX, CircleCheck, ArrowDownToLine } from 'lucide-react';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';
import * as XLSX from 'xlsx';
import axios from 'axios';

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
import { domain } from '@/constants';

const PendingUserRequest: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore(state => state.getEventBySlug(slug));
    const { token, user } = useAuthStore(state => state);
    const { deleteAttendee: deleteAttendeeFromStore } = useAttendeeStore(state => state);
    const [pendingRequests, setPendingRequests] = useState<AttendeeType[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch pending requests when component mounts or event changes
    useEffect(() => {
        if (event && token && user?.id) {
            setLoading(true);
            try {
                axios.post(`${domain}/api/pending_event_requests/${event.uuid}`, { user_id: user.id }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }).then(res => {
                    console.log(res.data);
                    setPendingRequests(res.data.data);
                    setLoading(false);
                }).catch(error => {
                    console.error('Error fetching pending requests:', error);
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error in pending requests fetch:', error);
                setLoading(false);
            }
        }
    }, [user, event, token]);

    // Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [designationFilter, ] = useState('');
    const [roleFilter, ] = useState<string>('all');

    // Add selected attendees state
    const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());

    // Add pagination state
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredAttendees = useMemo(() => {
        setCurrentPage(1);
        return pendingRequests.filter(attendee => {
            const nameMatch = `${attendee.first_name || ''} ${attendee.last_name || ''}`.toLowerCase().includes(nameFilter.toLowerCase());
            const companyMatch = attendee.company_name?.toLowerCase().includes(companyFilter.toLowerCase()) ?? false;

            // Handle null designation (job_title)
            const designationMatch = designationFilter === '' ||
                (attendee.job_title ?
                    attendee.job_title.toLowerCase().includes(designationFilter.toLowerCase()) :
                    designationFilter === '');

            const roleMatch = roleFilter === '' || roleFilter === 'all' || attendee.status?.toLowerCase() === roleFilter.toLowerCase();

            return nameMatch && companyMatch && designationMatch && roleMatch;
        });
    }, [pendingRequests, nameFilter, companyFilter, designationFilter, roleFilter]);

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
            const response = await deleteAttendeeFromStore(id, token);
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

    // Export to Excel
    const exportToExcel = () => {
        // Prepare data for export
        const dataToExport = paginatedAttendees.map(attendee => ({
            'First Name': attendee.first_name || '',
            'Last Name': attendee.last_name || '',
            'Email': attendee.email_id || '',
            'Alternate Email': attendee.alternate_email || '',
            'Phone': attendee.phone_number || '',
            'Alternate Phone': attendee.alternate_mobile_number || '',
            'Designation': attendee.job_title || '',
            'Company': attendee.company_name || '',
            'Status': attendee.status || '',
            'Award Winner': attendee.award_winner === 1 ? 'Yes' : 'No',
            'Registration Date': attendee.created_at || ''
        }));

        // Create a new workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Auto-size columns
        const columnWidths = [
            { wch: 15 }, // First Name
            { wch: 15 }, // Last Name
            { wch: 25 }, // Email
            { wch: 25 }, // Alternate Email
            { wch: 15 }, // Phone
            { wch: 15 }, // Alternate Phone
            { wch: 20 }, // Designation
            { wch: 25 }, // Company
            { wch: 15 }, // Status
            { wch: 15 }, // Award Winner
            { wch: 20 }  // Registration Date
        ];
        ws['!cols'] = columnWidths;

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Pending Requests');

        // Generate a filename with timestamp
        const fileName = `pending_requests_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Write the workbook and trigger download
        XLSX.writeFile(wb, fileName);

        toast.success('Excel file downloaded successfully!', {
            className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
            icon: <CircleCheck className='size-5' />
        });
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
                            className='btn !rounded-[10px] min-w-fit w-36 text-white bg-brand-primary hover:bg-brand-primary/90'
                            onClick={exportToExcel}
                            disabled={paginatedAttendees.length === 0}
                        >
                            <ArrowDownToLine className='mr-2 h-4 w-4' /> Download Excel
                        </Button>
                    </div>
                    <p className='font-semibold text-xl'>Pending Requests: {paginatedAttendees.length}</p>
                </div>

                <Table className='mt-4'>
                    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
                    <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                        <TableRow className='!text-base'>
                            <TableHead className="text-left min-w-10 !px-2">Select</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">#</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Name</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Alternate Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Phone</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Alternate Phone</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Status</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Award Winner</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Actions</TableHead>
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
                                <TableCell className="text-left min-w-10 flex items-center gap-1.5">

                                    {/* For Viewing the Event */}
                                    <Dialog>
                                        <DialogTrigger className='cursor-pointer'><Eye width={13} height={9} className='size-4' /></DialogTrigger>
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
                                    <Link to="#" className=''><SquarePen width={9.78} height={9.5} className='size-4'/></Link>

                                    {/* Delete Attendee */}
                                    <AlertDialog>
                                        <AlertDialogTrigger className='cursor-pointer'>
                                            <Trash width={9} height={11} className='fill-brand-secondary stroke-brand-secondary size-4' />
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