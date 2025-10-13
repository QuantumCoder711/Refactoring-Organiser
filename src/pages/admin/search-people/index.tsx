import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    "Patna", "Visakhapatnam", "Lucknow", "Bhopal", "Chandigarh", "Mohali",
    "cairo",
    "riyadh",
    "jeddah",
    "south africa",
    "kuwait",
    "oman",
    "egypt",
    "bahrain",
    "sharjah",
    "ajman",
    "ras al khaimah",
    "jordan",
    "qatar",
    "uae",
    "israel",
    "singapore",
    "united kingdom",
    "Australia",
    "France",
    "Canada",
    "Germany",
    "United States",
    "malaysia",
    "phillippines",
    "thailand",
    "indonesia",
    "Vietnam",
    "South Korea",
    "Japan",
    "China",
    "Hong Kong",
    "Taiwan",
    "New Zealand",
    "Nigeria",
    "Kenya",
    "Brazil",
    "Mexico",
    "Argentina",
    "Chile",
    "Colombia",
    "Peru",
    "Netherlands",
    "Belgium",
    "Switzerland",
    "Austria",
    "Sweden",
    "Norway",
    "Denmark",
    "Finland",
    "Poland",
    "Czech Republic",
    "Ireland",
    "Portugal",
    "Spain",
    "Italy",
    "Turkey",
    "Russia",
    "Ukraine",
    "Pakistan",
    "Lebanon",
    "Tanzania"
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

    // Secret button visibility state
    const [showButton, setShowButton] = useState<boolean>(false);
    const sequenceRef = useRef<string>("");

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

    // Secret sequence detection for admin button
    useEffect(() => {
        const handleButtonDisplay = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            // Only track a–z letters to avoid keys like Shift, Enter, arrows, etc.
            if (/^[a-z]$/.test(key)) {
                sequenceRef.current += key;
            }

            // Keep a slightly longer rolling buffer
            const MAX_LEN = 10;
            if (sequenceRef.current.length > MAX_LEN) {
                sequenceRef.current = sequenceRef.current.slice(-MAX_LEN);
            }

            // Check for reveal/hide sequences at the end of the buffer
            if (sequenceRef.current.endsWith("reveal")) {
                setShowButton(true);
                sequenceRef.current = "";
            } else if (sequenceRef.current.endsWith("hide")) {
                setShowButton(false);
                sequenceRef.current = "";
            }
        };

        window.addEventListener("keydown", handleButtonDisplay);
        return () => window.removeEventListener("keydown", handleButtonDisplay);
    }, []);

    // Exporting Data Function
    const handleExport = () => {
        if (selectedPeople.length === 0) {
            toast("No people selected to export", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider"
            });
            return;
        }

        // Keep the order consistent with the current filtered list
        const selectedRows = filteredPeople.filter(p => selectedPeople.includes(p._id));

        // Prepare CSV headers (ignore commented-out columns like Email, Mobile Number)
        const headers = [
            "Name",
            "Designation",
            "Company",
            "Industry",
            "City",
            "Company Size",
            "LinkedIn"
        ];

        // CSV escape helper
        const esc = (val: string) => {
            const s = (val ?? "").toString();
            if (s.includes('"')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            if (s.includes(',') || s.includes('\n') || s.includes('\r')) {
                return '"' + s + '"';
            }
            return s;
        };

        const rows = selectedRows.map((person) => {
            const name = [person.firstName || "", person.lastName || ""].filter(Boolean).join(" ") || "-";
            return [
                name,
                person.designation || "-",
                person.company || "-",
                person.industry || "-",
                person.city || "-",
                person.employeeSize || "-",
                person.linkedinUrl || "-",
            ].map(esc).join(",");
        });

        const csv = [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel compatibility
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `people_selected_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast(`${selectedRows.length} row(s) exported`, {
            className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider"
        });
    }

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
            city: selectedCity.toLowerCase()
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
        <div>
            {/* Header Section */}
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
                <div className='flex gap-3 sm:gap-5 items-center'>
                    <GoBack />
                    <h1 className='text-lg sm:text-xl font-semibold'>Add People</h1>
                </div>
                <div className='flex gap-2 sm:gap-3'>
                    <Button 
                        onClick={() => {
                            setDataLoaded(false);
                            setPeople([]);
                            setFilters({
                                designation: "",
                                company: "",
                                city: "",
                                companySize: "",
                                industry: ""
                            });
                        }} 
                        hidden={!dataLoaded} 
                        className='btn text-xs sm:text-sm'
                    >
                        Reset
                    </Button>

                    {showButton && (
                        <Button 
                            onClick={handleExport} 
                            hidden={!dataLoaded} 
                            className='btn text-xs sm:text-sm'
                        >
                            Download
                        </Button>
                    )}
                </div>
            </div>

            {/* Initial Search UI - Show when no data is loaded */}
            {!dataLoaded && (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-4xl mx-auto">
                    <div className="flex flex-col gap-2 flex-1">
                        <Label className="font-semibold text-sm sm:text-base" htmlFor="designation">
                            Designation
                        </Label>
                        <Input
                            id="designation"
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="input text-sm sm:text-base w-full"
                            placeholder="Enter designation"
                        />
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                        <Label className="font-semibold text-sm sm:text-base" htmlFor="city">
                            City
                        </Label>
                        <Select
                            value={selectedCity}
                            onValueChange={setSelectedCity}
                        >
                            <SelectTrigger className="input text-sm sm:text-base w-full">
                                <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem
                                        key={city}
                                        value={city}
                                        className="cursor-pointer capitalize"
                                    >
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handleSearch}
                            disabled={designation === '' || selectedCity === ''}
                            className="w-full sm:w-fit btn text-sm sm:text-base"
                        >
                            Search
                        </Button>
                    </div>
                </div>
            )}

            {/* Table UI - Show when data is loaded */}
            {dataLoaded && (
                <div className='bg-muted rounded-lg p-4 sm:p-5 lg:p-6 mt-4 sm:mt-6 shadow-blur'>
                    {/* Details Row */}
                    <div className='flex flex-wrap gap-2 sm:gap-3.5 items-center'>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="rounded-sm cursor-pointer !w-fit !h-8 sm:!h-[21px] border flex items-center justify-center text-xs sm:text-sm">
                                <SelectValue placeholder={`${itemsPerPage}/Page`} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className='cursor-pointer' value="10">10</SelectItem>
                                <SelectItem className='cursor-pointer' value="25">25</SelectItem>
                                <SelectItem className='cursor-pointer' value="50">50</SelectItem>
                                <SelectItem className='cursor-pointer' value="100">100</SelectItem>
                            </SelectContent>
                        </Select>

                        <span className='font-semibold text-xs sm:text-sm'>Total People: {people.length}</span>
                        {isFilterActive && (
                            <span className='font-semibold text-xs sm:text-sm'>Search Result: {filteredPeople.length}</span>
                        )}
                        {selectedPeople && selectedPeople.length > 0 && (
                            <span className='text-xs sm:text-sm'>Selected People: {selectedPeople.length}</span>
                        )}
                    </div>

                    {/* Filters Bar */}
                    <div className='flex flex-col w-full gap-2 sm:gap-2.5 mt-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 flex-1'>
                            {/* Search By Designation */}
                            <Input
                                className='input !p-2 !text-xs w-full'
                                placeholder='Search by designation'
                                value={filters.designation}
                                onChange={(e) => setFilters(prev => ({ ...prev, designation: e.target.value }))}
                            />

                            {/* Search By Company */}
                            <Input
                                className='input !p-2 !text-xs w-full'
                                placeholder='Search by company'
                                value={filters.company}
                                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                            />

                            {/* Search By City */}
                            <Input
                                className='input !p-2 !text-xs w-full'
                                placeholder='Search by city'
                                value={filters.city}
                                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                            />

                            {/* Search By Company Size */}
                            <Input
                                className='input !p-2 !text-xs w-full'
                                placeholder='Search by company size'
                                value={filters.companySize}
                                onChange={(e) => setFilters(prev => ({ ...prev, companySize: e.target.value }))}
                            />

                            {/* Search By Industry */}
                            <Input
                                className='input !p-2 !text-xs w-full'
                                placeholder='Search by industry'
                                value={filters.industry}
                                onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                            />
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className='btn text-xs sm:text-sm w-full sm:w-fit mt-2 sm:mt-0' disabled={selectedPeople.length === 0}>
                                    Add Selected People
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle className="text-lg sm:text-xl">Select the event</DialogTitle>
                                </DialogHeader>

                                <div className='max-h-60 sm:max-h-80 h-full space-y-3 overflow-y-auto overflow-x-hidden'>
                                    {upcomingEvents.map((event) => (
                                        <div 
                                            onClick={() => setSelectedEvent(event)} 
                                            key={event.uuid} 
                                            className={`p-2 border-2 cursor-pointer hover:bg-brand-primary/20 rounded-md ${
                                                selectedEvent?.uuid === event.uuid ? '!border-brand-primary !bg-brand-primary/20' : 'border-gray-200'
                                            }`}
                                        >
                                            <div className='flex gap-2 sm:gap-3 w-full'>
                                                <img 
                                                    src={getImageUrl(event.image)} 
                                                    alt="" 
                                                    className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded' 
                                                />
                                                <div className='flex flex-col gap-1 flex-1 min-w-0'>
                                                    <p className='font-semibold text-sm sm:text-lg truncate'>{event.title}</p>
                                                    <div className='flex items-center gap-1'>
                                                        <MapPin className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                                                        <p className='text-xs sm:text-sm truncate'>{event.event_venue_address_2}</p>
                                                    </div>
                                                    <div className='flex items-center gap-1'>
                                                        <Calendar className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0' />
                                                        <p className='text-xs sm:text-sm truncate'>{formatDateTime(event.event_date)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <Button 
                                        className='btn text-sm sm:text-base w-full sm:w-fit' 
                                        onClick={handleAddSelectedPeople} 
                                        disabled={!selectedEvent}
                                    >
                                        Add Selected People
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Table Container with Horizontal Scroll */}
                    <div className="overflow-x-auto mt-4">
                        <Table className='w-full min-w-[800px]'>
                            <TableHeader className='bg-accent'>
                                <TableRow className='text-sm sm:text-base'>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3">
                                        <Checkbox
                                            className='size-5'
                                            checked={filteredPeople.length > 0 && selectedPeople.length === filteredPeople.length}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Sr.No</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Name</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Designation</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Company</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Industry</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">City</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">Company Size</TableHead>
                                    <TableHead className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">LinkedIn</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPeople.map((person: SearchPeopleType, index: number) => (
                                    <TableRow key={person._id} className="hover:bg-background/50">
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3">
                                            <Checkbox
                                                className='size-5'
                                                checked={selectedPeople.includes(person._id)}
                                                onCheckedChange={(checked) => handleSelectPerson(person._id, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm capitalize">
                                            {person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : "-"}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm capitalize">
                                            {person.designation || "-"}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm capitalize">
                                            {person.company || "-"}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm capitalize">
                                            {person.industry || "-"}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm capitalize">
                                            {person.city || "-"}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm capitalize">
                                            {person.employeeSize || "-"}
                                        </TableCell>
                                        <TableCell className="text-left px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                            {person.linkedinUrl ? (
                                                <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs sm:text-sm">
                                                    View Profile
                                                </a>
                                            ) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <Pagination className='mt-4 sm:mt-6 flex justify-center sm:justify-end'>
                        <PaginationContent className='flex-wrap justify-center'>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer text-xs sm:text-sm'}
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
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer text-xs sm:text-sm'}
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