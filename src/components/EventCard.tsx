import { MapPin, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

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
import Wave from '@/components/Wave';
import useEventStore from '@/store/eventStore';

interface EventCardProps {
    title: string;
    location: string;
    date: string;
    image: string;
    imageAlt: string;
    isLive?: boolean;
    slug: string;
    id: number;
    uuid: string;
    total_attendees: number;
}

const EventCard: React.FC<EventCardProps> = ({
    title,
    location,
    date,
    image,
    imageAlt,
    slug,
    id,
    uuid,
    isLive = false,
    total_attendees,
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { deleteEvent } = useEventStore(state => state);
    const checkInCounts = useEventStore((s) => s.checkInCounts);
    const checkInCount = checkInCounts[uuid] || 0;

    const renderProgressBar = (value: number, total: number) => (
        <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
            <div
                className='h-full bg-brand-secondary rounded-full'
                style={{ width: `${(value / total) * 100}%` }}
            />
        </div>
    );


    const renderStatItem = (label: string, value: string | number, total?: number) => (
        <div className='text-xs border-b border-brand-light py-1 pb-2'>
            <div className='flex justify-between items-center'>
                <span>{label}</span>
                <span>{total ? `${value}/${total}` : value}</span>
            </div>
            {total && renderProgressBar(Number(value), total)}
        </div>
    );

    // Format date from YYYY-MM-DD to DD-MMM-YYYY
    const formatDate = (dateString: string) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();

            return `${day}-${month}-${year}`;
        } catch (error) {
            return dateString; // Return original if parsing fails
        }
    };

    const handleDeleteEvent = async () => {
        if (id) {
            setLoading(true);
            try {
                const response = await deleteEvent(id);
                if (response.status === 200) {
                    toast(response.message || "Event deleted successfully", {
                        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider"
                    });
                }
            } catch (error: any) {
                toast(error.message || "Failed to delete event", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider"
                });
            } finally {
                setLoading(false);
            }
        }
    }

    if (loading) return <Wave />

    return (
        <div className={`${isLive ? 'w-full max-w-lg' : 'w-64'} flex rounded-xl shadow-blur-lg relative`}>
            <div className="h-64 flex flex-col">
                <div className='flex-1 overflow-hidden relative w-64'>


                    <AlertDialog>
                        <AlertDialogTrigger
                            className='absolute grid place-content-center text-white w-8 h-8 bg-brand-secondary hover:bg-brand-secondary cursor-pointer rounded-full z-50 top-2 right-2'
                        >
                            <Trash size={16} />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Do you really want to delete {title} ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete {title}
                                    and remove it's data from the event.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                                <AlertDialogAction className='cursor-pointer bg-brand-secondary hover:bg-brand-secondary text-white' onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <img
                        src={image}
                        alt={imageAlt}
                        className='w-full h-full object-cover rounded-t-xl'
                    />
                    <div className='h-1/2 bottom-0 w-full absolute bg-gradient-to-b from-black/0 via-black/40 to-black'>
                        <div className='w-full h-full flex justify-between items-end p-2'>
                            <span className='rounded-full px-2 w-fit border text-white text-xs h-[15px] grid place-content-center'>
                                {formatDate(date)}
                            </span>
                            {isLive && (
                                <span className='text-xs text-green-500 font-date-stamp uppercase'>
                                    Currently Running
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className='h-[98px] w-64 bg-brand-background rounded-b-xl p-1 px-2'>
                    <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>
                        {title}
                    </h3>
                    {isLive && (
                        <p className='text-brand-secondary text-xs'>
                            Checkin Count - <span className='font-medium text-base'>{checkInCount}</span>
                        </p>
                    )}
                    <div className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                        <MapPin width={8} height={12} className='!size-5 fill-black stroke-white' />
                        <span className='overflow-hidden text-ellipsis'>
                            {location}
                        </span>
                    </div>

                    {!isLive && (
                        <div className='border-t border-white grid grid-cols-3 gap-1 pt-2'>
                            <Link to={`/all-events/view/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Event</Link>
                            <Link to={`/all-events/update-event/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Edit Event</Link>
                            <Link to={`/all-events/attendees/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>All Attendees</Link>
                            <div className='col-span-3 flex w-full gap-1 justify-center'>
                                <Link to={`/all-events/send-invitations/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Send Invitations</Link>
                                <Link to={`/all-agendas/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Agendas</Link>
                            </div>
                        </div>
                    )}

                    {isLive && (
                        <div className='border-t border-white flex justify-between gap-2 pt-1'>
                            <Link to={`/all-events/view/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>View</Link>
                            <Link to={`/all-events/update-event/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Edit</Link>
                            <Link to={`/all-events/attendees/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Attendees</Link>
                            <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Agenda</Link>
                        </div>
                    )}
                </div>
            </div>

            {isLive && (
                <div className='min-h-full w-full p-2 bg-white rounded-xl rounded-l-none'>
                    {renderStatItem('Registrations', total_attendees)}
                    {renderStatItem('Attendees', checkInCount, total_attendees)}
                    {renderStatItem('Speakers', 100, 900)}
                    {renderStatItem('Sponsors', 450, 900)}
                    {renderStatItem('Pending Delegates', 10)}

                    <div className='mt-2 flex flex-col gap-2 justify-between'>
                        <div className='flex gap-2 justify-between'>
                            <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-1/3 min-w-fit text-center'>Report</Link>
                            <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-2/3 min-w-fit text-center'>Transcriber</Link>
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Photos</Link>
                            <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Chart</Link>
                        </div>
                        <Button className='bg-brand-primary/20 hover:bg-brand-primary/30 cursor-pointer py-0 h-fit text-brand-primary text-xs rounded-full px-2 w-full text-center'>
                            Generate PDF
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventCard;