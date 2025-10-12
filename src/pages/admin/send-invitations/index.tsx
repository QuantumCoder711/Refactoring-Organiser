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
import { CircleCheck, CircleX, Eye, SquarePen, Trash } from 'lucide-react';
import { RequestedAttendeeType } from '@/types';
import axios from 'axios';
import { domain, appDomain } from '@/constants';
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';
import Wave from '@/components/Wave';
import * as XLSX from 'xlsx';

const SendInvitations: React.FC = () => {

    const { slug } = useParams<{ slug: string }>();
    const { user, token, setUser } = useAuthStore(state => state);
    const event = useEventStore(state => state.getEventBySlug(slug));
    const [itemsPerPage, setItemsPerPage] = React.useState(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [requestedAttendees, setRequestedAttendees] = useState<RequestedAttendeeType[]>([]);
    const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());
    const [isLoadingContacts, setIsLoadingContacts] = useState(false);

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

    // Export to Excel function
    const handleExportToExcel = (dataToExport?: RequestedAttendeeType[]) => {
        // If no data provided, use filtered attendees
        const data = dataToExport || filteredAttendees;

        if (data.length === 0) {
            toast('No data to export', {
                className: "!bg-yellow-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            // Prepare data for export
            const exportData = data.map(attendee => ({
                'First Name': attendee.first_name || '',
                'Last Name': attendee.last_name || '',
                'Email': attendee.email_id || '',
                'Alternate Email': attendee.alternate_email || '',
                'Company': attendee.company_name || '',
                'Job Title': attendee.job_title || '',
                'Country Code': attendee.country_code || '',
                'Phone': attendee.phone_number || '',
                'Alternate Phone Number': attendee.alternate_mobile_number || '',
                'LinkedIn URL': attendee.linkedin_url || '',
                'Status': attendee.status || '',
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Set column widths for better readability
            const wscols = [
                { wch: 20 }, // First Name
                { wch: 20 }, // Last Name
                { wch: 30 }, // Email
                { wch: 25 }, // Company
                { wch: 25 }, // Job Title
                { wch: 15 }, // Country Code
                { wch: 20 }, // Phone
                { wch: 40 }, // LinkedIn URL
                { wch: 15 }, // Status
            ];
            ws['!cols'] = wscols;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Requested Attendees');

            // Generate Excel file
            const fileName = `requested_attendees_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            // Show success message
            toast('Export successful!', {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className='size-5' />
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            toast('Failed to export data', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    // Add function to handle getting contacts
    const handleGetContacts = async () => {
        if (user && user?.wallet_balance < selectedAttendees.size) {
            toast(`You need at least ${selectedAttendees.size} credits to get contacts. Please upgrade your plan.`, {
                className: "!bg-yellow-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }
        if (selectedAttendees.size === 0) {
            toast('Please select at least one attendee', {
                className: "!bg-yellow-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Get selected attendees with LinkedIn URLs
        const selectedAttendeesData = filteredAttendees.filter(attendee =>
            selectedAttendees.has(attendee.id) && attendee.linkedin_url
        );

        if (selectedAttendeesData.length === 0) {
            toast('None of the selected attendees have LinkedIn URLs', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setIsLoadingContacts(true);
            const linkedin = selectedAttendeesData.map(attendee => attendee.linkedin_url);

            const response = await axios.post(
                `${appDomain}/api/mapping/v1/people/get-contact-signal`,
                { linkedin, userId: user?.id },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                toast(`Successfully retrieved contact information for ${selectedAttendeesData.length} attendees, Please checkout after some time.`, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                setUser({ ...user!, wallet_balance: user?.wallet_balance! - selectedAttendeesData.length });
            }
        } catch (error) {
            console.error('Error getting contacts:', error);
            toast('Failed to get contact information', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoadingContacts(false);
        }
    };

    if (loading) return <Wave />

    return (
        <div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0'>
                <div className='flex flex-wrap items-center gap-3 sm:gap-5 w-full sm:w-auto justify-start sm:justify-end'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>

                <div className='flex flex-wrap items-center gap-3 sm:gap-5'>
                    {selectedAttendees.size > 0 ? (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleExportToExcel(filteredAttendees.filter(attendee => selectedAttendees.has(attendee.id)))}
                                className='btn !rounded-[10px] !px-3 !bg-green-600 hover:!bg-green-700 w-full sm:w-auto'
                            >
                                Export Selected ({selectedAttendees.size})
                            </Button>
                            <Button
                                onClick={() => handleExportToExcel()}
                                className='btn !rounded-[10px] !px-3 w-full sm:w-auto'
                            >
                                Export All
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => handleExportToExcel()}
                            className='btn !rounded-[10px] !px-3 w-full sm:w-auto'
                        >
                            Export Data
                        </Button>
                    )}
                </div>
            </div>

            <div className='flex flex-wrap items-center gap-3 sm:gap-5 mt-5 font-semibold'>
                <Link
                    to={`/send-invitations/add-requested-attendee/${slug}`}
                    className="btn !rounded-[10px] !px-3 !h-[30px] !bg-brand-background !text-black w-full sm:w-fit text-nowrap text-sm grid place-content-center"
                >
                    Add Requested Attendee
                </Link>

                <Link
                    to={`/send-invitations/invite-registrations/${slug}`}
                    className="btn !rounded-[10px] !px-3 !h-[30px] !bg-brand-background !text-black w-full sm:w-fit text-nowrap text-sm grid place-content-center"
                >
                    Invite Registrations
                </Link>
            </div>

            {/* Search and Filter Section */}
            <div className='grid grid-cols-1 min-[480px]:grid-cols-2 sm:flex flex-wrap w-full gap-2.5 mt-4'>
                {/* Search By Name */}
                <Input
                    className='input !min-w-fit !max-w-full !p-2.5 !text-xs'
                    placeholder='Search by name'
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                />

                {/* Search By Company */}
                <Input
                    className='input !min-w-fit !max-w-full !p-2.5 !text-xs'
                    placeholder='Search by company'
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                />

                {/* Search By Email */}
                <Input
                    className='input !min-w-fit !max-w-full !p-2.5 !text-xs'
                    placeholder='Search by email'
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                />

                {/* Filter By Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="input !w-full sm:!w-fit !h-[30px] !text-sm !font-semibold cursor-pointer !text-black">
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

                {/* Get Contact Button */}
                <Button
                    className='btn !rounded-[10px] !p-2.5 !bg-blue-600 text-white hover:!bg-blue-700 w-full sm:w-auto'
                    onClick={handleGetContacts}
                    disabled={isLoadingContacts || selectedAttendees.size === 0}
                >
                    {isLoadingContacts ? 'Getting Contacts...' : 'Get Contact'}
                </Button>

                <Button
                    className='btn !rounded-[10px] !p-2.5 !bg-brand-secondary text-white w-full sm:w-auto'
                    onClick={handleDeleteSelected}
                    disabled={selectedAttendees.size === 0}
                >
                    Delete Selected
                </Button>
            </div>

            {/* Table */}
            <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur overflow-x-auto'>

                {/* Details Row */}
                <div className='flex flex-wrap gap-3.5 mb-2'>
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
                            {/* <TableHead className="text-left min-w-10 !px-2">Country Code</TableHead> */}
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
                        {paginatedAttendees.map((attendee) => (
                            <TableRow key={attendee.id}>
                                <TableCell>
                                    <Checkbox
                                        className='bg-white border-brand-dark-gray cursor-pointer'
                                        checked={selectedAttendees.has(attendee.id)}
                                        onCheckedChange={(checked) => handleSelectAttendee(attendee.id, checked as boolean)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {attendee.linkedin_url ? (
                                        <a
                                            href={attendee.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            View Profile
                                        </a>
                                    ) : "-"}
                                </TableCell>
                                <TableCell className='capitalize'>{attendee.first_name + " " + attendee.last_name}</TableCell>
                                <TableCell className='capitalize'>{attendee.job_title || "-"}</TableCell>
                                <TableCell className='capitalize'>{attendee.company_name || "-"}</TableCell>
                                <TableCell>{attendee.email_id || "-"}</TableCell>
                                <TableCell>{attendee.alternate_email || "-"}</TableCell>
                                {/* <TableCell>{attendee.country_code || "-"}</TableCell> */}
                                <TableCell>{(attendee.country_code || " ") + " " + (attendee.phone_number || " ") || "-"}</TableCell>
                                <TableCell>{attendee.alternate_mobile_number || "-"}</TableCell>
                                <TableCell className='capitalize'>{attendee.status || "Delegate"}</TableCell>
                                <TableCell className='capitalize'>{attendee.confirmed_status || "-"}</TableCell>
                                <TableCell className='capitalize'>{attendee.reaching_out_status || "-"}</TableCell>
                                <TableCell className='capitalize'>{attendee.follow_up || "-"}</TableCell>
                                <TableCell className='capitalize'>{attendee.managed_by || "-"}</TableCell>
                                <TableCell className='capitalize'>{attendee.remark || "-"}</TableCell>
                                <TableCell className="text-left min-w-10 flex items-center gap-1.5">

                                    {/* For Viewing the Event */}
                                    <Dialog>
                                        <DialogTrigger className='cursor-pointer'><Eye size={20} /></DialogTrigger>
                                        <DialogContent className="w-[90vw] max-w-md max-h-[80vh] overflow-y-auto p-4 sm:p-6">
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
                                                        <p className="text-base font-medium text-gray-800">{attendee.first_name + " " + attendee.last_name}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.job_title}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.email_id}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.company_name}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.country_code + " " + attendee.phone_number}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alternate Email</h3>
                                                        <p className="text-base font-medium text-gray-800">{attendee.alternate_email}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                                                        <p className="text-base font-medium text-gray-800 capitalize">{attendee.status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Edit Event */}
                                    <Link to={`/send-invitations/edit-requested-attendee/${slug}/${attendee.uuid}`} className=''><SquarePen size={20} /></Link>

                                    {/* Delete Attendee */}
                                    <AlertDialog>
                                        <AlertDialogTrigger className='cursor-pointer'>
                                            <Trash size={20} className='fill-brand-secondary stroke-brand-secondary' />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="w-[90vw] max-w-[425px] p-4 sm:p-6">
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-[26px]">
                    <div className="text-sm text-gray-500">
                        Showing {Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems} entries
                    </div>
                    <Pagination className='flex justify-center sm:justify-end'>
                        <PaginationContent className="flex flex-wrap">
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