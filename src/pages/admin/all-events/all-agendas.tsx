import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileInput, Eye, SquarePen, Trash, CircleCheck, CircleX, Badge } from 'lucide-react';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Label } from '@/components/ui/label';
import useAgendaStore from '@/store/agendaStore';
import { AgendaType } from '@/types';
import { getStartEndTime } from '@/lib/utils';
import { toast } from 'sonner';


const AllAgendas: React.FC = () => {
    const { events } = useEventStore(state => state);
    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore(state => state.getEventBySlug(slug));
    const { loading, getEventAgendas, deleteAgenda, importAgenda } = useAgendaStore(state => state);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [agendas, setAgendas] = useState<AgendaType[]>([]);

    const [filters, setFilters] = useState({
        title: ""
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [agendasPerPage, setAgendasPerPage] = useState(10);

    // Fetch agendas when component mounts or event/slug changes
    useEffect(() => {
        const fetchAgendas = async () => {
            if (event?.id) {
                try {
                    const data = await getEventAgendas(event.id);
                    if (data) {
                        // Update local state with the fetched data
                        setAgendas(data);

                        // Also update the store's state to keep it in sync
                        useAgendaStore.setState(state => {
                            const existingIndex = state.allEventAgendas.findIndex(ea => ea.event_id === event.id);
                            const updatedAgendas = [...state.allEventAgendas];

                            if (existingIndex >= 0) {
                                updatedAgendas[existingIndex] = {
                                    event_id: event.id,
                                    agendas: data
                                };
                            } else {
                                updatedAgendas.push({
                                    event_id: event.id,
                                    agendas: data
                                });
                            }

                            return { allEventAgendas: updatedAgendas };
                        });
                    }
                } catch (error) {
                    console.error('Error fetching agendas:', error);
                    // Reset agendas if there's an error to prevent showing stale data
                    setAgendas([]);
                }
            }
        };

        fetchAgendas();

        // Cleanup function to reset loading state if component unmounts
        return () => {
            useAgendaStore.setState({ loading: false });
        };
    }, [event?.id, slug, getEventAgendas]);

    const filteredAgendas = agendas.filter(agenda =>
        agenda.title.toLowerCase().includes(filters.title.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAgendas.length / agendasPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const paginatedAgendas = filteredAgendas.slice(
        (currentPage - 1) * agendasPerPage,
        currentPage * agendasPerPage
    );

    const handleAgendasPerPageChange = (value: string) => {
        setAgendasPerPage(Number(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const handleDeleteAgenda = async (uuid: string) => {
        try {
            const response = await deleteAgenda(uuid);
            if (response.status === 200) {
                setAgendas(agendas.filter(agenda => agenda.uuid !== uuid));
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.message || "Failed to delete agenda", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            console.error(error);
            toast("Failed to delete agenda", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    const handleImportAgenda = async () => {
        if (!selectedEventId || !event) return;

        try {
            const response = await importAgenda(selectedEventId, event.id, event.event_date);
            if (response.status === 200) {
                setAgendas([...response.data]);
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.message || "Failed to import agenda", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            toast("Failed to import agenda", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    if (loading) {
        return <Wave />
    }

    return (
        <div>

            <div className='flex sm:items-center gap-3 sm:gap-5 flex-col sm:flex-row justify-between'>
                <div className='flex items-center gap-5'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>

                <div className='flex flex-row items-center justify-end gap-3 sm:gap-5'>
                    <Link to={`/add-agenda/${slug}`}>
                        <Button size="sm"><Plus size={20} />Add Agenda</Button>
                    </Link>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm"><FileInput size={20} />Import Agenda</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Import Agendas</DialogTitle>
                                <DialogDescription>
                                    Select an event to import agendas from.
                                </DialogDescription>
                            </DialogHeader>
                            <ul className='flex flex-col max-h-80 overflow-y-scroll'>
                                {events.filter(e => e.id !== event?.id).map(event => (
                                    <li key={event.id} onClick={() => setSelectedEventId(event.id)} className='rounded-md hover:bg-muted relative'>
                                        <Label className='cursor-pointer leading-relaxed !p-4 !min-w-full flex gap-3 items-center'>
                                            <input
                                                type="radio"
                                                name="event"
                                                value={event.id.toString()}
                                            />
                                            {event.title}
                                        </Label>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                onClick={() => handleImportAgenda()}
                            >
                                Import Agendas
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Table */}
            <div className='bg-muted rounded-lg p-5 mt-6 shadow-blur'>

                {/* Filters Bar */}
                <div className='flex sm:flex-row flex-col w-full justify-between gap-2.5 items-baseline'>
                    <div className='flex sm:flex-row flex-col w-full gap-2.5'>
                        <div className='flex justify-between items-center'>
                            {/* Select Box for pagination */}
                            <Select onValueChange={handleAgendasPerPageChange}>
                                <SelectTrigger className='!h-10'>
                                    <SelectValue placeholder={`${agendasPerPage}/Page`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>

                            <p className='text-nowrap sm:hidden text-sm'>Total Agendas: {filteredAgendas.length}</p>
                        </div>

                        {/* Search By Name */}
                        <Input
                            className='input sm:max-w-80 h-10 w-full !p-2.5 !text-xs'
                            value={filters.title}
                            onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
                            placeholder='Search by title'
                        />

                    </div>
                    <p className='text-nowrap hidden sm:block text-sm'>Total Agendas: {filteredAgendas.length}</p>
                </div>

                <Table className='mt-4'>
                    <TableHeader className='!bg-accent !rounded-[10px]'>
                        <TableRow className='!text-base'>
                            <TableHead className="text-left min-w-10 !px-2">Sr.No</TableHead>
                            <TableHead className="text-left min-w-10 !max-w-96 !px-2">Title</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Speakers</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Event Date</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Time</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Priority</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedAgendas.map((agenda, index) => (
                            <TableRow key={agenda.id} className='!capitalize hover:bg-background/50'>
                                <TableCell>{(currentPage - 1) * agendasPerPage + index + 1}</TableCell>
                                <TableCell>{agenda.title}</TableCell>
                                <TableCell>
                                    {Array.isArray(agenda.speakers) && agenda.speakers.length > 0
                                        ? agenda.speakers.map(speaker => speaker.first_name || speaker.last_name
                                            ? `${speaker.first_name || ''} ${speaker.last_name || ''}`.trim()
                                            : 'Unknown Speaker'
                                        ).filter(Boolean).join(', ')
                                        : 'No speakers assigned'}
                                </TableCell>
                                <TableCell>{agenda.event_date}</TableCell>
                                <TableCell>{getStartEndTime(agenda)}</TableCell>
                                <TableCell>{agenda.position || 'Not set'}</TableCell>
                                <TableCell className='flex items-center gap-1.5'>
                                    {/* View Agenda */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Eye width={20} height={20} className="cursor-pointer text-green-400 hover:text-green-500 transition-colors" />
                                        </DialogTrigger>
                                        <DialogContent className="bg-muted p-0 rounded-lg shadow-blur max-w-2xl border-0 overflow-hidden">
                                            {/* Header */}
                                            <div className="bg-accent p-6 border-b">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <DialogTitle className="text-xl font-bold mb-2 text-foreground">
                                                            {agenda.title}
                                                        </DialogTitle>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 px-3 py-1">
                                                                <CircleCheck className="w-3 h-3 mr-1" />
                                                                Priority: {agenda.position}
                                                            </Badge>
                                                            <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                                                                <Badge className="w-3 h-3 mr-1" />
                                                                {agenda.speakers?.length || 0} Speakers
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 space-y-6 max-h-96 overflow-y-scroll">
                                                {/* Information Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Speakers Card */}
                                                    <div className="bg-background rounded-lg p-4 border border-border">
                                                        <div className="flex items-center mb-3">
                                                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                                                <Badge className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-foreground">Speakers</h3>
                                                        </div>
                                                        <p className="text-muted-foreground">
                                                            {agenda.speakers && agenda.speakers.length > 0
                                                                ? agenda.speakers.map(speaker =>
                                                                    `${speaker.first_name || ''} ${speaker.last_name || ''}`.trim()
                                                                ).filter(name => name).join(', ')
                                                                : 'No speakers assigned'
                                                            }
                                                        </p>
                                                    </div>

                                                    {/* Event Date Card */}
                                                    <div className="bg-background rounded-lg p-4 border border-border">
                                                        <div className="flex items-center mb-3">
                                                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                                                <CircleCheck className="w-5 h-5 text-green-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-foreground">Event Date</h3>
                                                        </div>
                                                        <p className="text-muted-foreground">{agenda.event_date}</p>
                                                    </div>

                                                    {/* Time Card */}
                                                    <div className="bg-background rounded-lg p-4 border border-border">
                                                        <div className="flex items-center mb-3">
                                                            <div className="bg-purple-100 p-2 rounded-full mr-3">
                                                                <Badge className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-foreground">Time</h3>
                                                        </div>
                                                        <p className="text-muted-foreground">{getStartEndTime(agenda)}</p>
                                                    </div>

                                                    {/* Priority Card */}
                                                    <div className="bg-background rounded-lg p-4 border border-border">
                                                        <div className="flex items-center mb-3">
                                                            <div className="bg-orange-100 p-2 rounded-full mr-3">
                                                                <CircleCheck className="w-5 h-5 text-orange-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-foreground">Priority Level</h3>
                                                        </div>
                                                        <p className="text-muted-foreground">Position {agenda.position || 'Not set'}</p>
                                                    </div>
                                                </div>

                                                {/* Description Section */}
                                                {agenda.description && (
                                                    <div className="bg-background rounded-lg p-4 border border-border">
                                                        <div className="flex items-center mb-3">
                                                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                                                <FileInput className="w-5 h-5 text-indigo-600" />
                                                            </div>
                                                            <h3 className="font-semibold text-foreground">Description</h3>
                                                        </div>
                                                        <div className="prose prose-slate max-w-none">
                                                            <p className="text-muted-foreground leading-relaxed">
                                                                {agenda.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Edit Agenda */}
                                    <Link to={`/all-agendas/${slug}/edit-agenda/${agenda.uuid}`} className=''><SquarePen width={20} height={20} className='text-yellow-500' /></Link>

                                    {/* Delete Agenda */}
                                    <AlertDialog>
                                        <AlertDialogTrigger className='cursor-pointer'>
                                            <Trash width={20} height={20} className='text-destructive' />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure want to delete {agenda.title} ?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className='cursor-pointer bg-destructive hover:bg-destructive/80 duration-300 transition-all text-white' onClick={() => handleDeleteAgenda(agenda.uuid)}>Continue</AlertDialogAction>
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

export default AllAgendas;