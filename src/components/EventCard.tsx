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
//         <div className={`${isLive ? 'w-full max-w-lg' : 'w-64'} flex rounded-xl shadow-blur-lg relative`}>
//             <div className="h-64 flex flex-col">
//                 <div className='flex-1 overflow-hidden relative w-64'>

//                     <Link to={`/create-badge/${slug}`}>
//                         <PrinterCheck className='h-8 w-8 p-2 text-white bg-brand-primary hover:bg-brand-primary-dark cursor-pointer rounded-full absolute top-2 right-12' />
//                     </Link>

//                     <AlertDialog>
//                         <AlertDialogTrigger
//                             className='absolute grid place-content-center text-white w-8 h-8 bg-brand-secondary hover:bg-brand-secondary cursor-pointer rounded-full z-50 top-2 right-2'
//                         >
//                             <Trash size={16} />
//                         </AlertDialogTrigger>
//                         <AlertDialogContent>
//                             <AlertDialogHeader>
//                                 <AlertDialogTitle>Do you really want to delete {title} ?</AlertDialogTitle>
//                                 <AlertDialogDescription>
//                                     This action cannot be undone. This will permanently delete {title}
//                                 </AlertDialogDescription>
//                             </AlertDialogHeader>
//                             <AlertDialogFooter>
//                                 <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
//                                 <AlertDialogAction className='cursor-pointer bg-brand-secondary hover:bg-brand-secondary text-white' onClick={handleDeleteEvent}>Delete</AlertDialogAction>
//                             </AlertDialogFooter>
//                         </AlertDialogContent>
//                     </AlertDialog>

//                     <img
//                         src={image}
//                         alt={imageAlt}
//                         className='w-full h-full object-cover rounded-t-xl'
//                     />
//                     <div className='h-1/2 bottom-0 w-full absolute bg-gradient-to-b from-black/0 via-black/40 to-black'>
//                         <div className='w-full h-full flex justify-between items-end p-2'>
//                             <span className='rounded-full px-2 w-fit border text-white text-xs h-[15px] grid place-content-center'>
//                                 {formatDate(date)}
//                             </span>
//                             {isLive && (
//                                 <span className='text-xs text-green-500 font-date-stamp uppercase'>
//                                     Currently Running
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//                 <div className='h-[98px] w-64 bg-brand-background rounded-b-xl p-1 px-2'>
//                     <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>
//                         {title}
//                     </h3>
//                     {isLive && (
//                         <p className='text-brand-secondary text-xs'>
//                             Checkin Count - <span className='font-medium text-base'>{checkInCount || total_checked_in}</span>
//                         </p>
//                     )}
//                     <div className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
//                         <MapPin width={8} height={12} className='!size-5 fill-black stroke-white' />
//                         <span className='overflow-hidden text-ellipsis'>
//                             {location}
//                         </span>
//                     </div>

//                     {!isLive && (
//                         <div className='border-t border-white grid grid-cols-3 gap-1 pt-2'>
//                             <Link to={`/all-events/view/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Event</Link>
//                             <Link to={`/all-events/update-event/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Edit Event</Link>
//                             <Link to={`/all-events/attendees/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>All Attendees</Link>
//                             <div className='col-span-3 flex w-full gap-1 justify-center'>
//                                 <Link to={`/all-events/send-invitations/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Send Invitations</Link>
//                                 <Link to={`/all-agendas/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Agendas</Link>
//                             </div>
//                         </div>
//                     )}

//                     {isLive && (
//                         <div className='border-t border-white flex justify-between gap-2 pt-1'>
//                             <Link to={`/all-events/view/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>View</Link>
//                             <Link to={`/all-events/update-event/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Edit</Link>
//                             <Link to={`/all-events/attendees/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Attendees</Link>
//                             <Link to={`/all-agendas/${slug}`} className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Agenda</Link>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {isLive && (
//                 <div className='min-h-full w-full p-2 bg-white rounded-xl rounded-l-none'>
//                     {renderStatItem('Registrations', total_attendees)}
//                     {renderStatItem('Attendees', (checkInCount || total_checked_in), total_attendees)}
//                     {renderStatItem('Speakers', total_checkedin_speaker)}
//                     {renderStatItem('Sponsors', total_checkedin_sponsor)}
//                     {renderStatItem('Pending Delegates', total_pending_delegate)}

//                     <div className='mt-2 flex flex-col gap-2 justify-between'>
//                         <div className='flex gap-2 justify-between'>
//                             <Link to={`/all-reports/mail-report/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-1/3 min-w-fit text-center'>Report</Link>
//                             <Link to={`/all-reports/ai-transcriber/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-2/3 min-w-fit text-center'>Transcriber</Link>
//                         </div>
//                         <div className='flex gap-2 justify-between'>
//                             <Link to={`/all-reports/ai-photos/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Photos</Link>
//                             <Link to={`/all-reports/charts/${slug}`} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Chart</Link>
//                         </div>
//                         <Button className='bg-brand-primary/20 hover:bg-brand-primary/30 cursor-pointer py-0 h-fit text-brand-primary text-xs rounded-full px-2 w-full text-center'>
//                             Generate PDF
//                         </Button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default EventCard;







































































import { MapPin, Printer, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Separator } from '@/components/ui/separator';

interface EventCardProps {
    title: string;
    location: string;
    date: string;
    image: string;
    imageAlt: string;
    isLive?: boolean;
    isUpcoming: boolean;
    isPast: boolean;
    slug: string;
    id: number;
    uuid: string;
    total_attendees: number;
    total_speaker: number;
    total_sponsor: number;
    total_checkedin_speaker: number;
    total_checkedin_sponsor: number;
    total_pending_delegate: number;
    total_checked_in: number;
}

const buttonLinks = [
    { label: 'View Event', path: `/all-events/view/` },
    { label: 'Edit Event', path: `/all-events/update-event/` },
    { label: 'Attendees', path: `/all-events/attendees/` },
    { label: 'Send Invitations', path: `/all-events/send-invitations/` },
    { label: 'View Agendas', path: `/all-agendas/` }
];

const reportLinks = [
    { label: 'Reports', path: `/all-reports/mail-report/` },
    { label: 'Transcriber', path: `/all-reports/ai-transcriber/` },
    { label: 'Photos', path: `/all-reports/ai-photos/` },
    { label: 'Charts', path: `/all-reports/charts/` },
    { label: 'Generate PDF', path: `#` }
]

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
    isUpcoming,
    isPast,
    total_attendees,
    total_speaker,
    total_sponsor,
    total_checkedin_speaker,
    total_checkedin_sponsor,
    total_pending_delegate,
    total_checked_in
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { deleteEvent } = useEventStore(state => state);
    const checkInCounts = useEventStore((s) => s.checkInCounts);
    const checkInCount = checkInCounts[uuid] || 0;

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
        <div className={`flex bg-brand-background rounded-xl h-80 ${isLive ? 'w-xl' : 'max-w-80'}`}>
            {/* Image Div */}
            <div className='h-full flex flex-col relative justify-between min-w-80 overflow-hidden bg-brand-light-gray rounded-xl p-1.5'>
                <div className='max-h-44 relative overflow-hidden'>

                    <div className='p-2 flex justify-between min-h-24 absolute bg-gradient-to-b rounded-xl from-black/0 via-black/40 to-black w-full bottom-0' />
                    <div className='absolute flex items-center justify-between w-full bottom-2 px-2'>
                        <span className='rounded-full px-2.5 py-1.5  w-fit border text-white text-xs grid place-content-center'>
                            {formatDate(date)}
                        </span>
                        <div className='flex gap-2 items-center'>
                            <Link to={`/create-badge/${slug}`} className='p-2 bg-brand-primary rounded-full text-white'>
                                <Printer size={16} />
                            </Link>

                            <AlertDialog>
                                <AlertDialogTrigger
                                    className='grid place-content-center text-white w-8 h-8 bg-brand-secondary hover:bg-brand-secondary cursor-pointer rounded-full z-50 top-2 right-2'
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
                        </div>
                    </div>

                    {/* Live Tag */}
                    <div hidden={!isLive} className='max-w-fit h-14 absolute overflow-hidden'>
                        <svg width="100%" height="100%" viewBox="0 0 94 46" fill="none" className='-mt-[1px] fill-brand-light-gray' xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 14V46C0 37 7.5 32 14 32C28.8333 32.1667 59.5 32 65 32C71 32 81 28 81 14C81 3.2 90.3106 0.166667 94.9658 0L0 0L0 14Z" />
                        </svg>

                        <span className='absolute top-0 left-0 px-5 z-20 py-1 font-semibold rounded-full bg-white text-red-600 flex items-center gap-2'>
                            <span className='inline-block size-3 rounded-full bg-red-600' />
                            Live
                        </span>
                    </div>

                    {/* Upcoming Tag */}
                    <div hidden={!isUpcoming || isLive} className='max-w-fit absolute overflow-hidden'>
                        <svg width="127" height="56" viewBox="0 0 127 56" className='-ml-[1px] -mt-[1px]' fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.00192035 14.0015C-0.0051926 21.5009 0.00974393 54.0001 0.00974393 54.0001L0.00974945 55.9744C0.0170754 47.4855 7.32604 42.0023 14.613 42.0023C20.1505 41.9987 81.8316 41.9987 94.7029 41.9987H95.8025C103.92 41.9987 112.443 36.3214 112.465 24.0029C112.467 22.9993 112.468 17.5067 112.465 14.0033C112.458 3.26056 122.308 -0.00311438 127 0.00048524C119.185 -0.000766513 20.8516 0.000431773 14.613 0.00375349C6.79837 0.000431773 -0.0053073 5.99843 0.00192035 14.0015Z" fill="#D9D9D9" />
                        </svg>

                        <span className='absolute mt-0.5 top-0 left-0 px-3 z-20 py-1 font-semibold rounded-full bg-white flex items-center gap-2'>
                            Upcoming
                        </span>
                    </div>


                    {/* Completed Tag */}
                    <div hidden={!isPast} className='max-w-fit absolute overflow-hidden'>
                        <svg width="135" height="56" viewBox="0 0 135 56" className='-ml-[1px] -mt-[1px]' fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.00194563 14.0028C-0.00526096 21.5019 0.00987221 54.0001 0.00987221 54.0001L0.00987779 55.9744C0.0173002 47.4858 7.42248 42.0027 14.8053 42.0027C20.5986 41.999 93.3722 41.9972 103.392 41.9972C111.617 41.9972 120.212 36.3165 120.234 23.9984C120.236 22.9949 120.237 17.5024 120.234 13.9991C120.227 3.2567 130.247 -0.00331736 135 0.000282142C127.083 -0.000969572 21.1261 0.0021558 14.8053 0.00547741C6.88786 0.0021558 -0.00537717 5.99997 0.00194563 14.0028Z" fill="#D9D9D9" />
                        </svg>

                        <span className='absolute mt-0.5 top-0 left-0 px-3 z-20 py-1 font-semibold rounded-full bg-white flex items-center gap-2'>
                            Completed
                        </span>
                    </div>

                    {/* Event Image */}
                    <img src={image} alt={imageAlt} className='object-center object-cover w-full rounded-xl max-h-44' />

                </div>
                <h4 className='text-sm font-semibold text-nowrap text-ellipsis overflow-hidden uppercase mt-1'>{title}</h4>
                <div className='overflow-hidden text-ellipsis text-nowrap flex gap-1 mt-1 items-center'>
                    {!isLive ? <><MapPin className='min-w-4 min-h-4 size-4' /> <span className='text-sm overflow-hidden text-ellipsis text-nowrap'>{location}</span></> : <div className='text-brand-primary font-medium text-sm'>
                        Live CheckIn Count - {checkInCount || total_checked_in}
                    </div>}
                </div>
                <Separator className='bg-white !h-0.5 mt-1' />
                {/* Buttons */}
                <div className='grid grid-row-2 gap-2 mt-1'>
                    <div className='grid grid-cols-3 gap-2'>
                        {buttonLinks.slice(0, 3).map((button, index) => (
                            <Link key={index} to={`${button.path}${slug}`} className='w-full tracking-normal rounded-full bg-white text-brand-primary text-center px-2 py-1 grid place-content-center text-sm'>
                                {button.label}
                            </Link>
                        ))}
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        {buttonLinks.slice(3).map((button, index) => (
                            <Link key={index} to={`${button.path}${slug}`} className='w-full tracking-normal rounded-full bg-white text-brand-primary text-center px-2 py-1 grid place-content-center text-sm'>
                                {button.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Stats Section */}
            <div hidden={!isLive} className='w-full flex flex-col gap-2 p-1.5'>
                {/* Live Counts */}
                <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>

                        <div className='w-full border-2 border-brand-primary/80 h-14 rounded-2xl p-2 px-2.5 bg-brand-light-gray'>
                            <h6 className='font-semibold text-sm'>Registrations</h6>
                            <p className='text-xs mt-1'>{total_attendees}/{total_checked_in}</p>
                        </div>

                        <div className='w-full border-2 border-brand-primary/80 h-14 rounded-2xl p-2 px-2.5 bg-brand-light-gray'>
                            <h6 className='font-semibold text-sm'>Sponsors</h6>
                            <p className='text-xs mt-1'>{total_checkedin_sponsor}/{total_sponsor}</p>
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <div className='w-full border-2 border-brand-primary/80 h-14 rounded-2xl p-2 px-2.5 bg-brand-light-gray'>
                            <h6 className='font-semibold text-sm'>Speakers</h6>
                            <p className='text-xs mt-1'>{total_checkedin_speaker}/{total_speaker}</p>
                        </div>

                        <div className='w-full border-2 border-brand-primary/80 h-14 rounded-2xl p-2 px-2.5 bg-brand-light-gray'>
                            <h6 className='font-semibold text-sm'>Attendees</h6>
                            <p className='text-xs mt-1'>{total_checked_in}/{total_attendees}</p>
                        </div>
                    </div>
                </div>

                {/* Pending Delegates */}
                <div className='w-full rounded-full text-xs bg-brand-light-gray p-3 flex justify-between items-center'>
                    <h6 className='font-semibold'>Pending Delegates</h6>
                    <span>{total_pending_delegate}</span>
                </div>

                <Separator className='h-0.5 bg-brand-light-gray' />

                <div className='grid grid-cols-2 gap-2'>
                    {reportLinks.map((link, index) => (
                        <Link key={index} to={`${link.path}${slug}`} className={`w-full tracking-normal rounded-full bg-white text-brand-primary text-center p-2 grid place-content-center text-sm ${index === reportLinks.length - 1 ? 'col-span-2' : ''}`}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default EventCard;