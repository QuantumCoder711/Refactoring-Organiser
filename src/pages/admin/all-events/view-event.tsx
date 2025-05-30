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

const ViewEvent: React.FC = () => {

    const { isLoaded } = useLoadScript({
        googleMapsApiKey,
        libraries: ['places'],
    })

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

    const handleDownload = () => {
        if (!event?.qr_code) {
            console.error('No QR code available for this event');
            toast('No QR code available for this event', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setIsDownloading(true);
        try {
            console.log('Original QR code:', event.qr_code);
            
            // Check if qr_code is already a full URL or a relative path
            const isFullUrl = event.qr_code.startsWith('http://') || event.qr_code.startsWith('https://');
            const imageUrl = isFullUrl ? event.qr_code : getImageUrl(event.qr_code);
            
            console.log('Generated image URL:', imageUrl);
            
            // Create a temporary link with the direct image URL
            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = '_blank'; // Open in new tab as a fallback
            link.rel = 'noopener noreferrer';
            
            // Set download attribute with a filename
            const fileName = `qrcode-${event.slug || 'event'}.png`;
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

    if (loading) {
        return <Wave />
    }

    return (
        <div className='w-full min-h-screen bg-brand-foreground text-black'>
            <div className='sticky top-0 z-50 bg-brand-foreground'>
                <GoBack />
            </div>
            <div className='max-w-2xl mx-auto bg-brand-background rounded-lg px-4 py-8'>
                <h1 className='text-2xl font-bold text-center p-5'>{event?.title}</h1>
                <img src={getImageUrl(event?.image)} alt="Event Image" className='w-[300px] h-[300px] mx-auto rounded-lg' />
                
                {/* Time */}
                <div className='text-xs flex gap-2.5 mt-5 justify-center'>
                    <span className='border border-brand-light-gray px-3 rounded-md'>Fri, 14 Jan-20 Feb, 2025</span>
                    <span className='border border-brand-light-gray px-3 rounded-md'>09:00 AM - 05:00 PM</span>
                </div>

                <div className='grid grid-cols-2 gap-[18px] w-[300px] mx-auto mt-3'>
                    {isLive && (
                        <>
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
                                                onClick={handleDownload} 
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
                        </>
                    )}
                    {isUpcoming && (
                        <div className='col-span-2 flex justify-center'>
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
                                                onClick={handleDownload} 
                                                className='btn mx-auto mt-6'
                                                disabled={isDownloading}
                                            >
                                                {isDownloading ? 'Downloading...' : 'Download'}
                                            </Button>
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
                <div className='p-5 border-t border-white flex justify-between'>
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
                <div className='p-5 border-t border-white'>
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
                        {agendaData.length > 0 ? agendaData.map((agenda) => (
                            <div key={agenda.id} className='!my-4'>
                                <h5 className='font-semibold'>{agenda?.start_time}:{agenda?.start_minute_time} {agenda?.start_time_type} - {agenda?.end_time}:{agenda?.end_minute_time} {agenda?.end_time_type}</h5>
                                <p className='font-light'>{agenda.description}</p>
                                <div className='flex gap-5 my-3'>
                                    <div className='grid grid-cols-2 gap-5'>
                                        {agenda.speakers.map((speaker: any) => (
                                            <div key={speaker.id} className='flex gap-3 max-w-80 text-ellipsis overflow-hidden text-nowrap'>
                                                <img src={`${domain}/${speaker.image}`} alt="user" className='size-14 rounded-full' />
                                                <div className='space-y-1'>
                                                    <p className='font-semibold text-lg leading-none'>{speaker.first_name} {speaker.last_name}</p>
                                                    <p className='text-sm leading-none'>{speaker.company_name}</p>
                                                    <p className='text-xs leading-none'>{speaker.job_title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )) : <p className='text-brand-gray mb-10'>No agenda available</p>}
                    </div>

                    {/* Event Speakers */}
                    <div className='p-5 border-t border-white'>
                        <h3 className='font-semibold'>Speakers</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-8'>
                            {allSpeakers.length > 0 ? allSpeakers.map((speaker, index) => (
                                <div key={index} className='text-sm text-center space-y-2 max-w-56'>
                                    <img src={speaker.image ? domain + "/" + speaker.image : UserAvatar} alt="Speaker Avatar" width={48} height={48} className='rounded-full mx-auto size-20' />
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
                                    <div key={index} className='text-sm space-y-2 text-center max-w-28 border-2'>
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
    );
};

export default ViewEvent;
