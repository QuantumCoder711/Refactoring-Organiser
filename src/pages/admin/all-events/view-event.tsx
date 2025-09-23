import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GoogleMap from "@/components/GoogleMap";
import { googleMapsApiKey, UserAvatar, domain } from '@/constants';
import { Button } from '@/components/ui/button';
import { isEventLive, isEventUpcoming, getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import QRCode from 'qrcode';
import CreateQRCode from "react-qr-code";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import useAgendaStore from '@/store/agendaStore';
import Wave from '@/components/Wave';
import { useLoadScript } from '@react-google-maps/api';
import GoBack from '@/components/GoBack';
import { Helmet } from 'react-helmet';
import { AttendeeType } from '@/types';

const createQRCode = (uuid: string | undefined, break_out: number | undefined): string => {
    return `https://kloutclub.page.link/?link=${encodeURIComponent(
        `https://www.klout.club/event/check-in?eventuuid=${uuid}&breakoutRoom=${break_out}`
    )}&apn=com.klout.app&afl=${encodeURIComponent(
        `https://www.klout.club/event/check-in?eventuuid=${uuid}&breakoutRoom=${break_out}`
    )}&ibi=com.klout.app&ifl=${encodeURIComponent(
        `https://www.klout.club/event/check-in?eventuuid=${uuid}&breakoutRoom=${break_out}`
    )}&_icp=1`;
}

const ViewEvent: React.FC = () => {

    const { isLoaded } = useLoadScript({
        googleMapsApiKey,
        libraries: ['places'],
    });

    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore((state) => state.getEventBySlug(slug));


    const { loading, getEventAgendas } = useAgendaStore(state => state);
    const [mapCoordinates, setMapCoordinates] = useState({ lat: 28.4595, lng: 77.0265 });
    const [agendaData, setAgendaData] = useState<any[]>([]);
    const [allSpeakers, setAllSpeakers] = useState<any[]>([]);
    const [allJury, setAllJury] = useState<any[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);

    // Add extractCoordinates function
    const extractCoordinates = async (address: string | undefined) => {
        if (!address) return { lat: 28.4595, lng: 77.0265 }; // Default coordinates

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                return { lat, lng };
            }

            return { lat: 28.4595, lng: 77.0265 }; // Default coordinates if geocoding fails
        } catch (error) {
            console.error('Error getting coordinates:', error);
            return { lat: 28.4595, lng: 77.0265 }; // Default coordinates if request fails
        }
    };

    useEffect(() => {
        if (event?.id) {
            getEventAgendas(event.id);
            // Fetch agenda data
            axios.get(`${domain}/api/all-agendas/${event.id}`)
                .then((res) => {
                    if (res.data) {
                        const sortedData = res.data.data.sort((a: any, b: any) => a.position - b.position);
                        setAgendaData(sortedData);
                    }
                });

            // Fetch speakers and jury data
            axios.post(`${domain}/api/event_details_attendee_list/`, {
                event_uuid: event.uuid,
                phone_number: 9643314331
            })
                .then((res) => {
                    setAllSpeakers(res.data.data.speakers);
                    setAllJury(res.data.data.jury);
                })
                .catch((err) => {
                    console.log("The error is", err);
                });
        }
    }, [event, getEventAgendas]);

    // Add useEffect for updating map coordinates
    useEffect(() => {
        if (event?.event_venue_address_1) {
            extractCoordinates(event.event_venue_address_1).then(coords => {
                setMapCoordinates(coords);
            });
        }
    }, [event?.event_venue_address_1]);

    const isLive = isEventLive(event);
    const isUpcoming = isEventUpcoming(event);

    // Function to generate QR code data URL
    const generateQRCodeDataUrl = async (text: string): Promise<string> => {
        try {
            return await QRCode.toDataURL(text, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            return '';
        }
    };

    // Generate QR code when component mounts or event changes
    useEffect(() => {
        const generateQR = async () => {
            if (event?.uuid) {
                const qrText = `${domain}/event/${event.slug}/check-in`;
                await generateQRCodeDataUrl(qrText);
            }
        };
        generateQR();
    }, [event]);

    const handleDownload = (qrCode: string | undefined) => {
        if (!qrCode) {
            console.error('No QR code available for this event');
            toast('No QR code available for this event', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setIsDownloading(true);
        try {

            // Check if qr_code is already a full URL or a relative path
            const isFullUrl = qrCode.startsWith('http://') || qrCode.startsWith('https://');
            const imageUrl = isFullUrl ? qrCode : getImageUrl(qrCode);

            // Create a temporary link with the direct image URL
            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = '_blank'; // Open in new tab as a fallback
            link.rel = 'noopener noreferrer';

            // Set download attribute with a filename
            const fileName = `qrcode-${event?.slug || 'event'}.png`;
            link.download = fileName;

            // Append to body, click and remove
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);

            console.log('QR code download initiated');
            toast('QR Code download started!', {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className='size-5' />
            });
        } catch (error) {
            console.error('Error initiating QR code download:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error details:', { error });
            toast(`Failed to download QR Code: ${errorMessage}`, {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // Add a function to format the date and time
    const formatEventDateTime = (event: any) => {
        if (!event) return { dateRange: '', timeRange: '' };

        const startDate = new Date(event.event_start_date);
        const endDate = new Date(event.event_date);

        // Format the date range
        const dateRange = `${startDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        // Format the time range
        const timeRange = `${event.start_time}:${event.start_minute_time} ${event.start_time_type} - ${event.end_time}:${event.end_minute_time} ${event.end_time_type}`;

        return { dateRange, timeRange };
    };

    if (loading) {
        return <Wave />
    }

    return (
        <React.Fragment>
            <Helmet>
                <title>{event?.title}</title>
            </Helmet>
            <div className='w-full min-h-screen text-black'>
                <div className='top-0 z-50 bg-brand-foreground'>
                    <GoBack />
                </div>
                <div className='max-w-2xl mt-5 mx-auto bg-muted rounded-lg md:px-4 md:py-8'>
                    <h1 className='text-2xl font-bold text-center p-5'>{event?.title}</h1>
                    <img src={getImageUrl(event?.image)} alt="Event Image" className='w-[300px] h-[300px] mx-auto rounded-lg' />

                    {/* Time */}
                    <div className='text-xs flex gap-2.5 mt-5 justify-center'>
                        {event && (
                            <>
                                <span className='border border-brand-light-gray px-3 rounded-md'>{formatEventDateTime(event).dateRange}</span>
                                <span className='border border-brand-light-gray px-3 rounded-md'>{formatEventDateTime(event).timeRange}</span>
                            </>
                        )}
                    </div>

                    <div className='flex flex-col gap-3 justify-center items-center'>
                        {isLive && (
                            <React.Fragment>
                                <div className='grid grid-cols-2 gap-[18px] w-[300px] mx-auto mt-3'>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm">View QR Code</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className='text-center'>{event?.title}</DialogTitle>
                                                <DialogDescription className="text-center">
                                                    <img src={getImageUrl(event?.qr_code)} alt="Event Image" className='w-[300px] h-[300px] mx-auto rounded-lg' />
                                                    <Button
                                                        onClick={() => handleDownload(event?.qr_code)}
                                                        className='btn mx-auto mt-6'
                                                        disabled={isDownloading}
                                                    >
                                                        {isDownloading ? 'Downloading...' : 'Download'}
                                                    </Button>
                                                </DialogDescription>
                                            </DialogHeader>
                                        </DialogContent>
                                    </Dialog>
                                    <Badge className='rounded-full h-6 bg-brand-dark-gray text-white w-full text-sm'>Currently Running</Badge>
                                </div>
                                {/* For breakout rooms */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm">Breakout QR Code</Button>
                                    </DialogTrigger>
                                    <DialogContent className='!max-w-3xl !min-w-fit !w-full'>
                                        <DialogHeader>
                                            <DialogTitle className='text-center'>{event?.title}</DialogTitle>
                                            <DialogDescription className="text-center grid grid-cols-5 gap-7">
                                                {
                                                    Array.from({ length: Number(event?.break_out) }, (_, index) => (
                                                        // <img
                                                        //     key={index}
                                                        //     className='w-[100px] h-[100px] rounded-lg'
                                                        //     alt="QR Code"
                                                        //     src={createQRCode(event?.uuid, index + 1)}
                                                        // />
                                                        <div className='flex flex-col gap-3'>
                                                            <CreateQRCode key={index + Math.random()} value={createQRCode(event?.uuid, index + 1)} fgColor='#000' className='w-full h-full mx-auto' />
                                                            <p>Breakout : {index + 1}</p>
                                                        </div>
                                                    ))
                                                }
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </React.Fragment>
                        )}
                        {(isUpcoming && !isLive) && (
                            <div hidden={event?.event_mode == 1} className='col-span-2 gap-3 flex justify-center'>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className='btn-rounded h-6'>View QR Code</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className='text-center'>{event?.title}</DialogTitle>
                                            <DialogDescription className="text-center">
                                                <img src={getImageUrl(event?.qr_code)} alt="Event Image" className='w-[300px] h-[300px] mx-auto rounded-lg' />
                                                <Button
                                                    onClick={() => handleDownload(event?.qr_code)}
                                                    className='btn mx-auto mt-6'
                                                    disabled={isDownloading}
                                                >
                                                    {isDownloading ? 'Downloading...' : 'Download'}
                                                </Button>
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>

                                {/* For breakout rooms */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className='btn-rounded h-6'>Breakout QR Code</Button>
                                    </DialogTrigger>
                                    <DialogContent className='!max-w-3xl !min-w-fit !w-full'>
                                        <DialogHeader>
                                            <DialogTitle className='text-center'>{event?.title}</DialogTitle>
                                            <DialogDescription className="text-center grid grid-cols-5 gap-7">
                                                {
                                                    Array.from({ length: Number(event?.break_out) }, (_, index) => (
                                                        // <img
                                                        //     key={index}
                                                        //     className='w-[100px] h-[100px] rounded-lg'
                                                        //     alt="QR Code"
                                                        //     src={createQRCode(event?.uuid, index + 1)}
                                                        // />

                                                        <div className='flex flex-col gap-3'>
                                                            <CreateQRCode key={index + Math.random()} value={createQRCode(event?.uuid, index + 1)} fgColor='#000' className='w-full h-full mx-auto' />
                                                            <p>Breakout : {index + 1}</p>
                                                            <Button
                                                                onClick={() => handleDownload(createQRCode(event?.uuid, index + 1))}
                                                                className='btn mx-auto mt-2'
                                                                disabled={isDownloading}
                                                            >
                                                                {isDownloading ? 'Downloading...' : 'Download'}
                                                            </Button>
                                                        </div>
                                                    ))
                                                }
                                            </DialogDescription>
                                        </DialogHeader>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className='border-t mt-3 p-5 border-white'>
                        <h3 className='font-semibold'>Description</h3>
                        <p className='text-sm mt-2 text-brand-dark-gray'>{event?.description}</p>
                    </div>

                    {/* Event OTP & Agenda By */}
                    <div hidden={event?.event_mode == 1} className='p-5 border-t border-white flex justify-between'>
                        <div className='w-1/2'>
                            <h3 className='font-semibold'>Event OTP</h3>
                            <p className='text-sm text-brand-dark-gray'>{event?.event_otp}</p>
                        </div>
                        <div className='w-1/2 border-l border-white pl-5'>
                            <h3 className='font-semibold'>View Agenda By</h3>
                            <p className='text-sm text-brand-dark-gray'>{event?.view_agenda_by == 0 ? "All" : "Checked In"}</p>
                        </div>
                    </div>

                    {/* Event Location */}
                    <div hidden={event?.event_mode == 1} className='p-5 border-t border-white'>
                        <h3 className='font-semibold'>Location</h3>
                        <p className='text-sm font-semibold -mt-1 text-brand-dark-gray'>{event?.event_venue_name}</p>
                        <p className='text-sm text-brand-dark-gray'>{event?.event_venue_address_1}</p>

                        {/* Map Component */}
                        <div className='h-60 mt-3 rounded-lg shadow-blur overflow-hidden'>
                            <div className='relative w-full h-full'>
                                <GoogleMap
                                    isLoaded={isLoaded}
                                    latitude={mapCoordinates.lat}
                                    longitude={mapCoordinates.lng}
                                    zoom={15}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className='mt-4'>
                        {/* Agenda Details */}
                        <div className='p-5 border-t border-white'>
                            <h3 className='font-semibold'>Agenda</h3>
                            <div>
                                {agendaData.length > 0 ? agendaData.map((agenda) => (
                                    <div key={agenda.id} className='!my-4'>
                                        <h3 className='font-semibold'>{agenda.title}</h3>
                                        <h5 className='text-sm text-brand-dark-gray font-medium mb-2'>{agenda?.start_time}:{agenda?.start_minute_time}  {agenda?.start_time_type} - {agenda?.end_time}:{agenda?.end_minute_time} {agenda?.end_time_type}</h5>
                                        <p className='font-light'>{agenda.description}</p>
                                        <div className='flex gap-5 my-3'>
                                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                                                {agenda.speakers.map((speaker: AttendeeType) => (
                                                    <div key={speaker.id} className='flex gap-3 max-w-80 text-ellipsis overflow-hidden text-nowrap'>
                                                        <img src={speaker.image ? `${domain}/${speaker.image}` : UserAvatar} alt="user" className='size-14 rounded-full object-cover object-top' />
                                                        <div className='space-y-1'>
                                                            <p className='font-semibold text-lg leading-none capitalize'>{speaker.first_name} {speaker.last_name}</p>
                                                            <p className='text-sm leading-none text-wrap capitalize'>{speaker.company_name}</p>
                                                            <p className='text-xs leading-none text-wrap capitalize'>{speaker.job_title}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className='text-brand-gray mb-10'>No agenda available</p>}
                            </div>
                        </div>

                        {/* Event Speakers */}
                        <div className='p-5 border-t border-white'>
                            <h3 className='font-semibold'>Speakers</h3>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-items-center gap-4 space-y-8'>
                                {allSpeakers.length > 0 ? allSpeakers.map((speaker, index) => (
                                    <div key={index} className='text-sm text-center capitalize space-y-2 max-w-56'>
                                        <img src={speaker.image ? getImageUrl(speaker.image) : UserAvatar} alt="Speaker Avatar" width={48} height={48} className='rounded-full mx-auto size-20' />
                                        <h4 className='font-semibold leading-none'>{speaker.first_name} {speaker.last_name}</h4>
                                        <p className='leading-none'>{speaker.company_name}</p>
                                        <p className='leading-none font-light'>{speaker.job_title}</p>
                                    </div>
                                )) : <p className='text-brand-gray mb-10'>No speakers available</p>}
                            </div>
                        </div>

                        {/* Jury */}
                        {allJury.length > 0 && (
                            <div className='p-5 border-t border-white'>
                                <h3 className='font-semibold'>Jury</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-8'>
                                    {allJury.map((jury, index) => (
                                        <div key={index} className='text-sm capitalize space-y-2 text-center max-w-28 border-2'>
                                            <img src={jury.image ? domain + "/" + jury.image : UserAvatar} alt="Jury Avatar" width={48} height={48} className='rounded-full mx-auto size-20' />
                                            <h4 className='font-semibold leading-none'>{jury.first_name} {jury.last_name}</h4>
                                            <p className='leading-none'>{jury.company_name}</p>
                                            <p className='leading-none font-light'>{jury.job_title}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ViewEvent;
