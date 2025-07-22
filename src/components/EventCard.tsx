import { MapPin, PrinterCheck, Trash } from 'lucide-react';
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
    total_checkedin_speaker: number;
    total_checkedin_sponsor: number;
    total_pending_delegate: number;
    total_checked_in: number;
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
    total_checkedin_speaker,
    total_checkedin_sponsor,
    total_pending_delegate,
    total_checked_in
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

                    <Link to={`/create-badge/${slug}`}>
                        <PrinterCheck className='h-8 w-8 p-2 text-white bg-brand-primary hover:bg-brand-primary-dark cursor-pointer rounded-full absolute top-2 right-12' />
                    </Link>

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
                            Checkin Count - <span className='font-medium text-base'>{checkInCount || total_checked_in}</span>
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
                            <Link to={`/all-agendas/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Agenda</Link>
                        </div>
                    )}
                </div>
            </div>

            {isLive && (
                <div className='min-h-full w-full p-2 bg-white rounded-xl rounded-l-none'>
                    {renderStatItem('Registrations', total_attendees)}
                    {renderStatItem('Attendees', (checkInCount || total_checked_in), total_attendees)}
                    {renderStatItem('Speakers', total_checkedin_speaker)}
                    {renderStatItem('Sponsors', total_checkedin_sponsor)}
                    {renderStatItem('Pending Delegates', total_pending_delegate)}

                    <div className='mt-2 flex flex-col gap-2 justify-between'>
                        <div className='flex gap-2 justify-between'>
                            <Link to={`/all-reports/mail-report/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-1/3 min-w-fit text-center'>Report</Link>
                            <Link to={`/all-reports/ai-transcriber/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-2/3 min-w-fit text-center'>Transcriber</Link>
                        </div>
                        <div className='flex gap-2 justify-between'>
                            <Link to={`/all-reports/ai-photos/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Photos</Link>
                            <Link to={`/all-reports/charts/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Chart</Link>
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







































































// import { MapPin, PrinterCheck, Trash } from 'lucide-react';
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Button } from "@/components/ui/button";
// import { toast } from 'sonner';

// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
//     AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import Wave from '@/components/Wave';
// import useEventStore from '@/store/eventStore';
// import { Separator } from '@/components/ui/separator';

// interface EventCardProps {
//     title: string;
//     location: string;
//     date: string;
//     image: string;
//     imageAlt: string;
//     isLive?: boolean;
//     slug: string;
//     id: number;
//     uuid: string;
//     total_attendees: number;
//     total_checkedin_speaker: number;
//     total_checkedin_sponsor: number;
//     total_pending_delegate: number;
//     total_checked_in: number;
// }

// const buttonLinks = [
//     { label: 'View Event', path: `/all-events/view/` },
//     { label: 'Edit Event', path: `/all-events/update-event/` },
//     { label: 'Attendees', path: `/all-events/attendees/` },
//     { label: 'Send Invitations', path: `/all-events/send-invitations/` },
//     { label: 'View Agendas', path: `/all-agendas/` }
// ]

// const EventCard: React.FC<EventCardProps> = ({
//     title,
//     location,
//     date,
//     image,
//     imageAlt,
//     slug,
//     id,
//     uuid,
//     isLive = false,
//     total_attendees,
//     total_checkedin_speaker,
//     total_checkedin_sponsor,
//     total_pending_delegate,
//     total_checked_in
// }) => {
//     const [loading, setLoading] = useState<boolean>(false);
//     const { deleteEvent } = useEventStore(state => state);
//     const checkInCounts = useEventStore((s) => s.checkInCounts);
//     const checkInCount = checkInCounts[uuid] || 0;

//     const renderProgressBar = (value: number, total: number) => (
//         <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
//             <div
//                 className='h-full bg-brand-secondary rounded-full'
//                 style={{ width: `${(value / total) * 100}%` }}
//             />
//         </div>
//     );


//     const renderStatItem = (label: string, value: string | number, total?: number) => (
//         <div className='text-xs border-b border-brand-light py-1 pb-2'>
//             <div className='flex justify-between items-center'>
//                 <span>{label}</span>
//                 <span>{total ? `${value}/${total}` : value}</span>
//             </div>
//             {total && renderProgressBar(Number(value), total)}
//         </div>
//     );

//     // Format date from YYYY-MM-DD to DD-MMM-YYYY
//     const formatDate = (dateString: string) => {
//         if (!dateString) return '';

//         try {
//             const date = new Date(dateString);
//             const day = date.getDate();
//             const month = date.toLocaleString('default', { month: 'short' });
//             const year = date.getFullYear();

//             return `${day}-${month}-${year}`;
//         } catch (error) {
//             return dateString; // Return original if parsing fails
//         }
//     };

//     const handleDeleteEvent = async () => {
//         if (id) {
//             setLoading(true);
//             try {
//                 const response = await deleteEvent(id);
//                 if (response.status === 200) {
//                     toast(response.message || "Event deleted successfully", {
//                         className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider"
//                     });
//                 }
//             } catch (error: any) {
//                 toast(error.message || "Failed to delete event", {
//                     className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider"
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         }
//     }

//     if (loading) return <Wave />

//     return (
//         <div className='w-xl bg-brand-background rounded-xl h-80'>
//             {/* Normal Card */}
//             <div className='h-full flex flex-col justify-between w-80 overflow-hidden rounded-xl p-1.5 border-2 border-teal-500'>
//                 {/* Image Div */}
//                 <div className='max-h-44 relative h-full border-2 border-yellow-400'>
//                     <img src={image} alt={imageAlt} className='object-center object-cover w-full rounded-xl h-full' />
//                     <div className="absolute bottom-2 px-2 left-0 w-full flex justify-between items-center">
//                         <span className='w-fit rounded-full px-3 py-1 text-xs border border-white text-white'>15 Feb, 2025</span>
//                         <span className='rounded-full bg-red-500 p-1.5 grid place-content-center'>
//                             <Trash className='text-white size-4 rounded-full' />
//                         </span>
//                     </div>
//                 </div>
//                 <h4 className='text-sm font-semibold text-nowrap text-ellipsis overflow-hidden uppercase mt-1'>{title}</h4>
//                 <div className='overflow-hidden text-ellipsis text-nowrap flex gap-1 mt-1 items-center'>
//                     <MapPin className='min-w-4 min-h-4 size-4' /> <span className='text-sm overflow-hidden text-ellipsis text-nowrap'>{location}</span>
//                 </div>
//                 <Separator className='bg-white !h-0.5 mt-1' />
//                 {/* Buttons */}
//                 <div className='grid grid-row-2 gap-2 mt-1'>
//                     <div className='grid grid-cols-3 gap-2'>
//                         {buttonLinks.slice(0, 3).map((button, index) => (
//                             <Link key={index} to={`${button.path}${slug}`} className='w-full tracking-normal rounded-full bg-white text-brand-primary text-center px-2 py-1 grid place-content-center text-sm'>
//                                 {button.label}
//                             </Link>
//                         ))}
//                     </div>
//                     <div className='grid grid-cols-2 gap-2'>
//                         {buttonLinks.slice(3).map((button, index) => (
//                             <Link key={index} to={`${button.path}${slug}`} className='w-full tracking-normal rounded-full bg-white text-brand-primary text-center px-2 py-1 grid place-content-center text-sm'>
//                                 {button.label}
//                             </Link>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default EventCard;