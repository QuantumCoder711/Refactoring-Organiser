import React, { useState, useMemo } from 'react';
import GoBack from '@/components/GoBack';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Checkbox } from '@/components/ui/checkbox';
import useEventStore from '@/store/eventStore';
import axios from 'axios';
import { appDomain, domain } from '@/constants';
import { toast } from 'sonner';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import { EventType } from '@/types';
import { filterEvents, formatDateTime, getImageUrl } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';

interface SearchPeopleType {
    _id: string;
    firstName: string;
    lastName: string;
    linkedinUrl: string;
    designation: string;
    email?: string;
    mobileNumber?: string;
    company: string;
    industry: string;
    city: string;
    employeeSize: string;
}


const cities: string[] = [
    "Mumbai", "Delhi", "Bengaluru", "Gurgaon", "Chennai", "Pune",
    "Hyderabad", "Noida", "New Delhi", "Ahmedabad", "Jaipur", "Kolkata",
    "Patna", "Visakhapatnam", "Lucknow", "Bhopal", "Chandigarh", "Mohali"
];

const SearchPeople: React.FC = () => {
    const { events } = useEventStore(state => state);
    const { upcomingEvents } = filterEvents(events);
    const [designation, setDesignation] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const { user, token } = useAuthStore(state => state);
    const [people, setPeople] = useState<SearchPeopleType[]>([]);

    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

    // Filter states
    const [filters, setFilters] = useState({
        designation: "",
        company: "",
        city: "",
        companySize: "",
        industry: ""
    });

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Checkbox selection states
    const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

    // Filtered people based on filters
    const filteredPeople = useMemo(() => {
        setCurrentPage(1);
        return people.filter(person => {
            const designationMatch = filters.designation === '' ||
                person.designation.toLowerCase().includes(filters.designation.toLowerCase());
            const companyMatch = filters.company === '' ||
                person.company.toLowerCase().includes(filters.company.toLowerCase());
            const cityMatch = filters.city === '' ||
                person.city.toLowerCase().includes(filters.city.toLowerCase());
            const companySizeMatch = filters.companySize === '' ||
                person.employeeSize.toLowerCase().includes(filters.companySize.toLowerCase());
            const industryMatch = filters.industry === '' ||
                person.industry.toLowerCase().includes(filters.industry.toLowerCase());

            return designationMatch && companyMatch && cityMatch && companySizeMatch && industryMatch;
        });
    }, [people, filters]);

    // Calculate paginated data
    const paginatedPeople = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPeople.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPeople, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = useMemo(() => {
        return Math.ceil(filteredPeople.length / itemsPerPage);
    }, [filteredPeople.length, itemsPerPage]);

    // Handle checkbox selection
    const handleSelectPerson = (id: string, isSelected: boolean) => {
        setSelectedPeople(prev => {
            const newSet = new Set(prev); // Convert to Set to handle unique IDs
            if (isSelected) {
                newSet.add(id); // Add the ID to the Set
            } else {
                newSet.delete(id); // Remove the ID from the Set
            }
            return [...newSet]; // Convert back to array
        });
    };

    // Handle select all
    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedPeople(filteredPeople.map(person => person._id));
        } else {
            setSelectedPeople([]);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleSearch = async () => {
        setLoading(true);
        const response = await axios.post(`${appDomain}/api/mapping/v1/people/search-people`, {
            designation,
            city: selectedCity
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.data.status) {
            toast("People searched successfully", {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider"
            });
            setPeople(response.data.data.peoplesWithCompanySize);
            setDataLoaded(true);
        } else {
            toast(response.data.message || "Failed to search people", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider"
            });
        }
        setLoading(false);
    };

    const handleAddSelectedPeople = async () => {
        setLoading(true);
        const attendees = selectedPeople.map((personId) => {
            const person = people.find(p => p._id === personId);
            return {
                first_name: person?.firstName || "",
                last_name: person?.lastName || "",
                email_id: person?.email || "",
                phone_number: String(person?.mobileNumber) || "",
                status: "delegate",
                alternate_mobile_number: "",
                alternate_email: "",
                company_name: person?.company || "",
                job_title: person?.designation || "",
                linkedin_url: person?.linkedinUrl || "",
            };
        });

        const response = await axios.post(`${domain}/api/bulk-upload-requested-attendees-without-excel`, {
            event_id: selectedEvent?.id,
            user_id: user?.id,
            attendees
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.status) {
            toast("People added successfully", {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider"
            });
        } else {
            toast(response.data.message || "Failed to add people", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider"
            });
        }
        setSelectedPeople([]);
        setSelectedEvent(null);
        setLoading(false);
    }

    // Check if any filter is active
    const isFilterActive = filters.designation !== '' || filters.company !== '' ||
        filters.city !== '' || filters.companySize !== '' || filters.industry !== '';

    if (loading) {
        return <Wave />
    }

    return (
        <div className="space-y-6">
            <div className='flex gap-5 items-center'>
                <GoBack />
                <h1 className='text-xl font-semibold'>Add People</h1>
            </div>

            {/* Initial Search UI - Show when no data is loaded */}
            {!dataLoaded && (
                <div className="flex flex-row max-w-2xl mx-auto items-end gap-4">
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor="designation">
                            Designation
                        </Label>
                        <Input
                            id="designation"
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="input max-w-[200px] text-base"
                            placeholder="Enter designation"
                        />
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor="city">
                            City
                        </Label>
                        <Select
                            value={selectedCity}
                            onValueChange={setSelectedCity}
                        >
                            <SelectTrigger className="input max-w-[200px] text-base">
                                <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem
                                        key={city}
                                        value={city}
                                        className="cursor-pointer"
                                    >
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={designation === '' || selectedCity === ''}
                        className="w-fit btn"
                    >
                        Search
                    </Button>
                </div>
            )}

            {/* Table UI - Show when data is loaded */}
            {dataLoaded && (
                <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur'>
                    {/* Details Row */}
                    <div className='flex gap-3.5'>
                        {/* Select Box for pagination */}
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="rounded-sm cursor-pointer !w-fit !h-[21px] border-1 border-brand-light-gray flex items-center justify-center text-sm">
                                <SelectValue placeholder={`${itemsPerPage}/Page`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className='cursor-pointer' value="10">10</SelectItem>
                                <SelectItem className='cursor-pointer' value="25">25</SelectItem>
                                <SelectItem className='cursor-pointer' value="50">50</SelectItem>
                                <SelectItem className='cursor-pointer' value="100">100</SelectItem>
                            </SelectContent>
                        </Select>

                        <span className='font-semibold text-sm'>Total People: {people.length}</span>
                        {isFilterActive && (
                            <span className='font-semibold text-sm'>Search Result: {filteredPeople.length}</span>
                        )}
                        {selectedPeople && selectedPeople.length > 0 && <span>Selected People: {selectedPeople.length}</span>}
                    </div>

                    {/* Filters Bar */}
                    <div className='flex w-full gap-2.5 mt-4'>
                        {/* Search By Designation */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by designation'
                            value={filters.designation}
                            onChange={(e) => setFilters(prev => ({ ...prev, designation: e.target.value }))}
                        />

                        {/* Search By Company */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by company'
                            value={filters.company}
                            onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                        />

                        {/* Search By City */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by city'
                            value={filters.city}
                            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        />

                        {/* Search By Company Size */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by company size'
                            value={filters.companySize}
                            onChange={(e) => setFilters(prev => ({ ...prev, companySize: e.target.value }))}
                        />

                        {/* Search By Industry */}
                        <Input
                            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
                            placeholder='Search by industry'
                            value={filters.industry}
                            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                        />

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='btn' disabled={selectedPeople.length === 0}>
                                    Add Selected People
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Select the event</DialogTitle>
                                </DialogHeader>

                                <div className='max-h-80 h-full space-y-3 overflow-y-scroll overflow-x-hidden'>
                                    {upcomingEvents.map((event) => (
                                        <div onClick={() => setSelectedEvent(event)} key={event.uuid} className={`p-2 border-2 border-white cursor-pointer hover:bg-brand-primary/20 rounded-md ${selectedEvent?.uuid === event.uuid ? '!border-brand-primary !bg-brand-primary/20' : 'border-white'}`}>
                                            <div className='flex gap-2 w-full'>
                                                <img src={getImageUrl(event.image)} alt="" width={80} height={80} className='w-20 h-20 object-cover rounded' />
                                                <div className='flex flex-col gap-1 overflow-hidden overflow-ellipsis'>
                                                    <p className='font-semibold text-lg text-nowrap overflow-hidden overflow-ellipsis'>{event.title}</p>
                                                    <div className='flex items-center gap-1'>
                                                        <MapPin className='w-4 h-4' />
                                                        <p className='text-sm text-nowrap overflow-hidden overflow-ellipsis'>{event.event_venue_address_2}</p>
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <Calendar className='w-4 h-4' />
                                                        <p className='text-sm text-nowrap overflow-hidden overflow-ellipsis'>{formatDateTime(event.event_date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <Button className='btn' onClick={handleAddSelectedPeople} disabled={!selectedEvent}>Add Selected People</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Table className='mt-4'>
                        <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                            <TableRow className='!text-base'>
                                <TableHead className="text-left min-w-10 !px-2">
                                    <Checkbox
                                        className='bg-white border-brand-dark-gray cursor-pointer'
                                        checked={filteredPeople.length > 0 && selectedPeople.length === filteredPeople.length}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-left min-w-10 !px-2">Sr.No</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">Name</TableHead>
                                {/* <TableHead className="text-left min-w-10 !px-2">Email</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">Mobile Number</TableHead> */}
                                <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">Industry</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">City</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">Company Size</TableHead>
                                <TableHead className="text-left min-w-10 !px-2">LinkedIn</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPeople.map((person: SearchPeopleType, index: number) => (
                                <TableRow key={person._id}>
                                    <TableCell className="text-left min-w-10">
                                        <Checkbox
                                            className='bg-white border-brand-dark-gray cursor-pointer'
                                            checked={selectedPeople.includes(person._id)}
                                            onCheckedChange={(checked) => handleSelectPerson(person._id, checked as boolean)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-left min-w-10 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : "-"}
                                    </TableCell>
                                    {/* <TableCell className="text-left min-w-10 capitalize">
                                        {person.email ? person.email : "-"}
                                    </TableCell>
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.mobileNumber ? person.mobileNumber : "-"}
                                    </TableCell> */}
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.designation || "-"}
                                    </TableCell>
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.company || "-"}
                                    </TableCell>
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.industry || "-"}
                                    </TableCell>
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.city || "-"}
                                    </TableCell>
                                    <TableCell className="text-left min-w-10 capitalize">
                                        {person.employeeSize || "-"}
                                    </TableCell>
                                    <TableCell className="text-left min-w-10">
                                        {person.linkedinUrl ? (
                                            <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                View Profile
                                            </a>
                                        ) : "-"}
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
            )}
        </div>
    );
};

export default SearchPeople;