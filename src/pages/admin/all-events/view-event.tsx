import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GoogleMap from "@/components/GoogleMap";
import { googleMapsApiKey, UserAvatar } from '@/constants';
import { Button } from '@/components/ui/button';
import { isEventLive, isEventUpcoming, getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { Badge } from '@/components/ui/badge';

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


const ViewEvent: React.FC = () => {

    const { isLoaded } = useLoadScript({
        googleMapsApiKey,
        libraries: ['places'],
    })

    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore((state) => state.getEventBySlug(slug));

    const { loading, getEventAgendas } = useAgendaStore(state => state);

    useEffect(() => {
        if (event?.id) {
            getEventAgendas(event.id);
        }
    }, [event, getEventAgendas]);

    const isLive = isEventLive(event);
    const isUpcoming = isEventUpcoming(event);

    if (loading) {
        return <Wave />
    }

    return (
        <div className='max-w-2xl mx-auto bg-brand-background rounded-lg'>
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
                        <Button className='btn-rounded h-6'>View QR Code</Button>
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
                                        <Button className='btn mx-auto mt-6'>Download</Button>
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
                    <p className='text-sm text-brand-dark-gray'>{event?.view_agenda_by}</p>
                </div>
            </div>

            {/* Event Location */}
            <div className='p-5 border-t border-white'>
                <h3 className='font-semibold'>Location</h3>
                <p className='text-sm font-semibold -mt-1 text-brand-dark-gray'>Hotel holiday Inn, Aerocity</p>
                <p className='text-sm text-brand-dark-gray'>3rd - 5th floor, Huda City Centre Metro Station, Sector 29, Gurugram, Haryana 122002, India</p>

                {/* Map Component */}
                <div className='h-40 mt-3 rounded-lg shadow-blur'>
                    <GoogleMap isLoaded={isLoaded} latitude={28.4595} longitude={77.0265} />
                </div>
            </div>

            {/* Agenda Details */}
            <div className='p-5 border-t border-white'>
                <h3 className='font-semibold'>Agenda</h3>

                {/* Day 1 Agenda Details */}
                <div>
                    <span className="text-sm p-1 px-2 block font-semibold mt-5 rounded-md bg-white">Day 1 (Friday, 17th Jan 2025)</span>

                    {/* Hourly Agenda Details */}
                    <div className='mt-2 px-2'>
                        {/* 1st hour agenda details */}
                        <div>
                            <span className='font-medium text-sm'>12:00AM-07:00AM</span>
                            <p className='text-sm font-light'>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>

                            {/* Speaker Details (If there are any speakers) */}
                            <div className='grid grid-cols-4 gap-4'>
                                {/* Speaker 1 */}
                                <div className='flex gap-2 items-center mt-2'>
                                    <img src={UserAvatar} width={36} height={36} alt="Speaker Avatar" className='rounded-full' />
                                    <div className='flex flex-col'>
                                        <h4 className='leading-none font-semibold text-sm overflow-hidden text-ellipsis text-nowrap'>John Doe</h4>
                                        <span className='leading-none text-xs overflow-hidden text-ellipsis text-nowrap'>Klout Club</span>
                                        <span className='leading-none text-xs font-light overflow-hidden text-ellipsis text-nowrap'>CEO</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Event Speakers */}
            <div className='p-5 border-t border-white'>
                <h3 className='font-semibold'>Speakers</h3>

                {/* Speaker List */}
                <div className='grid grid-cols-4 gap-4'>
                    <div className='text-sm text-center max-w-28 border-2'>
                        <img src={UserAvatar} alt="Speaker Avatar" width={48} height={48} className='rounded-full mx-auto' />
                        <h4 className='font-semibold leading-none'>Udit Tiwari</h4>
                        <p className='leading-none'>Klout Club</p>
                        <p className='leading-none font-light'>CEO</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ViewEvent;
