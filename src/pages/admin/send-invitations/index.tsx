import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useEventStore from '@/store/eventStore';
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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

import { Checkbox } from '@/components/ui/checkbox';
import { CircleCheck, CircleX, Eye, SquarePen, Trash, UserCheck } from 'lucide-react';
import { RequestedAttendeeType } from '@/types';
import axios from 'axios';
import { domain } from '@/constants';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import Wave from '@/components/Wave';

const SendInvitations: React.FC = () => {

    const { slug } = useParams<{ slug: string }>();
    const { user, token } = useAuthStore(state => state);
    const event = useEventStore(state => state.getEventBySlug(slug));
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [requestedAttendees, setRequestedAttendees] = useState<RequestedAttendeeType[]>([]);
    const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());

    // Search filters
    const [nameFilter, setNameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        setLoading(true);
        if (!event || !user || !token) return;
        axios.post(`${domain}/api/show-all-requested-attendees`, {
            event_id: event?.id,
            user_id: user?.id,
        }, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        }).then(res => {
            if (res.data.status) {
                setRequestedAttendees(res.data.data);
            }
        }).catch(error => {
            toast(error.message || "Failed to fetch requested attendees", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className="size-5" />
            });
        }).finally(() => {
            setLoading(false);
        })
    }, [event, user, token]);

    // Filter attendees based on search criteria
    const filteredAttendees = useMemo(() => {
        return requestedAttendees.filter(attendee => {
            const nameMatch = `${attendee.first_name || ''} ${attendee.last_name || ''}`.toLowerCase().includes(nameFilter.toLowerCase());
            const emailMatch = (attendee.email_id || '').toLowerCase().includes(emailFilter.toLowerCase());
            const companyMatch = (attendee.company_name || '').toLowerCase().includes(companyFilter.toLowerCase());
            const statusMatch = statusFilter === 'all' ||
                (statusFilter === 'delegate' && attendee.status === 'delegate') ||
                (statusFilter === 'speaker' && attendee.status === 'speaker') ||
                (statusFilter === 'sponsor' && attendee.status === 'sponsor') ||
                (statusFilter === 'panelist' && attendee.status === 'panelist') ||
                (statusFilter === 'moderator' && attendee.status === 'moderator');

            return nameMatch && emailMatch && companyMatch && statusMatch;
        });
    }, [requestedAttendees, nameFilter, emailFilter, companyFilter, statusFilter]);

    // Calculate pagination
    const totalItems = filteredAttendees.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginatedAttendees = filteredAttendees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    // Handle select all
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            // Only select the currently filtered attendees
            setSelectedAttendees(new Set(filteredAttendees.map(attendee => attendee.id)));
        } else {
            setSelectedAttendees(new Set());
        }
    };

    // Handle delete selected
    const handleDeleteSelected = async () => {
        const selectedIds = Array.from(selectedAttendees);
        if (selectedIds.length > 0) {
            if (!event || !user) return;
            setLoading(true);
            const response = await axios.post(`${domain}/api/bulk-delete-requested-attendee`, {
                event_id: event?.id,
                user_id: user?.id,
                ids: selectedIds
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status) {
                // Remove the deleted attendees from the list
                setRequestedAttendees(requestedAttendees.filter(attendee => !selectedIds.includes(attendee.id)));
                toast(response.data.message || "Attendees deleted successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.data.message || "Failed to delete attendees", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
            setLoading(false);
            // Clear selected attendees after logging
            setSelectedAttendees(new Set());
        }
    };

    const handleSingleDelete = (uuid: string) => {
        return async () => {
            if (!event || !user) return;
            setLoading(true);
            const response = await axios.delete(`${domain}/api/requested-attendee/${uuid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.status) {
                // Remove the deleted attendee from the list
                setRequestedAttendees(requestedAttendees.filter(attendee => attendee.uuid !== uuid));
                toast(response.data.message || "Attendee deleted successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.data.message || "Failed to delete attendee", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
            setLoading(false);
        };
    }

    if (loading) return <Wave />

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>

                <div className='flex items-center gap-5'>
                    <Button className='btn !rounded-[10px] !px-3'>Export Data</Button>
                </div>
            </div>

            <div className='flex items-center gap-5 mt-5 font-semibold'>
                <Link
                    to={`/send-invitations/add-requested-attendee/${slug}`}
                    className="btn !rounded-[10px] !px-3 !h-[30px] !bg-brand-background !text-black w-fit text-nowrap text-sm grid place-content-center"
                >
                    Add Requested Attendee
                </Link>

                <Link
                    to="#"
                    className="btn !rounded-[10px] !px-3 !h-[30px] !bg-brand-background !text-black w-fit text-nowrap text-sm grid place-content-center"
                >
                    Invite Registrations
                </Link>
            </div>

            {/* Search and Filter Section */}
            <div className='flex w-full gap-2.5 mt-4'>
                {/* Search By Name */}
                <Input
                    className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                    placeholder='Search by name'
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                />

                {/* Search By Company */}
                <Input
                    className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                    placeholder='Search by company'
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                />

                {/* Search By Email */}
                <Input
                    className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                    placeholder='Search by email'
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                />

                {/* Filter By Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="input !w-fit !h-[30px] !text-sm !font-semibold cursor-pointer !text-black">
                        <SelectValue placeholder="Status">
                            {statusFilter === 'all' ? 'All Statuses' :
                                statusFilter === 'delegate' ? 'Delegate' :
                                    statusFilter === 'speaker' ? 'Speaker' :
                                        statusFilter === 'sponsor' ? 'Sponsor' :
                                            statusFilter === 'panelist' ? 'Panelist' :
                                                statusFilter === 'moderator' ? 'Moderator' : 'Status'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className='!text-sm !font-semibold'>
                        <SelectItem value="all" className='cursor-pointer'>All Statuses</SelectItem>
                        <SelectItem value="delegate" className='cursor-pointer'>Delegate</SelectItem>
                        <SelectItem value="speaker" className='cursor-pointer'>Speaker</SelectItem>
                        <SelectItem value="sponsor" className='cursor-pointer'>Sponsor</SelectItem>
                        <SelectItem value="panelist" className='cursor-pointer'>Panelist</SelectItem>
                        <SelectItem value="moderator" className='cursor-pointer'>Moderator</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    className='btn !rounded-[10px] !p-2.5 !bg-brand-secondary text-white'
                    onClick={handleDeleteSelected}
                    disabled={selectedAttendees.size === 0}
                >
                    Delete
                </Button>
            </div>

            {/* Table */}
            <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur'>

                {/* Details Row */}
                <div className='flex gap-3.5'>
                    {/* Select Box for pagination */}
                    <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="rounded-sm !w-fit !h-[21px] border-1 border-brand-light-gray flex items-center justify-center text-sm">
                            <SelectValue placeholder={`${itemsPerPage}/Page`} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>

                    <span className='font-semibold text-sm'>Total Attendees: {filteredAttendees.length}</span>
                </div>

                <Table className='mt-4'>
                    <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                        <TableRow className='!text-base'>
                            <TableHead className="text-left min-w-10 !px-2">
                                <Checkbox
                                    className='bg-white border-brand-dark-gray cursor-pointer'
                                    checked={filteredAttendees.length > 0 && selectedAttendees.size === filteredAttendees.length}
                                    onCheckedChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="text-left min-w-10 !px-2">LinkedIn</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Name</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Alternate Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Mobile</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Alternate Mobile</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Role</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Confirmed Status</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Reaching Out Status</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Follow Up</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Managed By</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Remark</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedAttendees.map((attendee, index) => (
                            <TableRow key={attendee.id}>
                                <TableCell>
                                    <Checkbox
                                        className='bg-white border-brand-dark-gray cursor-pointer'
                                        checked={selectedAttendees.has(attendee.id)}
                                        onCheckedChange={(checked) => handleSelectAttendee(attendee.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell>{attendee.linkedin_url || "-"}</TableCell>
                                <TableCell>{attendee.first_name + " " + attendee.last_name}</TableCell>
                                <TableCell>{attendee.job_title || "-"}</TableCell>
                                <TableCell>{attendee.company_name || "-"}</TableCell>
                                <TableCell>{attendee.email_id || "-"}</TableCell>
                                <TableCell>{attendee.alternate_email || "-"}</TableCell>
                                <TableCell>{attendee.phone_number || "-"}</TableCell>
                                <TableCell>{attendee.alternate_mobile_number || "-"}</TableCell>
                                <TableCell>{attendee.status || "Delegate"}</TableCell>
                                <TableCell>{attendee.confirmed_status || "-"}</TableCell>
                                <TableCell>{attendee.reaching_out_status || "-"}</TableCell>
                                <TableCell>{attendee.follow_up || "-"}</TableCell>
                                <TableCell>{attendee.managed_by || "-"}</TableCell>
                                <TableCell>{attendee.remark || "-"}</TableCell>
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
                                                        <p className="text-base font-medium text-gray-800">John Doe</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</h3>
                                                        <p className="text-base font-medium text-gray-800">Software Engineer</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</h3>
                                                        <p className="text-base font-medium text-gray-800">john.doe@example.com</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
                                                        <p className="text-base font-medium text-gray-800">ABC Corporation</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</h3>
                                                        <p className="text-base font-medium text-gray-800">+1 1234567890</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alternate Email</h3>
                                                        <p className="text-base font-medium text-gray-800">john.doe2@example.com</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                                                        <p className="text-base font-medium text-gray-800 capitalize">Confirmed</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Edit Event */}
                                    <Link to={`/send-invitations/edit-requested-attendee/${slug}/${attendee.uuid}`} className=''><SquarePen width={9.78} height={9.5} /></Link>

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
                                                <AlertDialogAction
                                                    className='cursor-pointer bg-brand-secondary hover:bg-brand-secondary text-white'
                                                    onClick={handleSingleDelete(attendee.uuid)}
                                                >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-[26px]">
                    <div className="text-sm text-gray-500">
                        Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} entries
                    </div>
                    <Pagination className='flex justify-end'>
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

            </div >
        </div >
    )
}

export default SendInvitations;