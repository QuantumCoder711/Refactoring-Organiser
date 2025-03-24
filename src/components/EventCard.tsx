import { MapPin } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface EventCardProps {
    title: string;
    location: string;
    date: string;
    image: string;
    imageAlt: string;
    isLive?: boolean | false;
}

const EventCard: React.FC<EventCardProps> = (props) => {

    return (
        <div className={`${props.isLive ? 'w-[404px]' : 'w-64'} flex rounded-xl shadow-blur-lg`}>
            <div className={`h-64 flex flex-col`} >
                <div className='flex-1 overflow-hidden relative w-64'>
                    <img src={props.image} alt={props.imageAlt} className='w-full h-full object-cover rounded-t-xl' />
                    <div className='h-1/2 bottom-0 w-full absolute bg-gradient-to-b from-black/0 via-black/40 to-black'>
                        <div className='w-full h-full flex justify-between items-end p-2'>
                            <span className='rounded-full border text-white text-xs h-[15px] w-20 grid place-content-center'>{props.date}</span>
                            {props.isLive && <span className='text-xs text-green-500 font-date-stamp uppercase'>Currently Running</span>}
                        </div>
                    </div>
                </div>
                <div className='h-[98px] w-64 bg-brand-background rounded-b-xl p-1 px-2'>
                    <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>{props.title}</h3>
                    {props.isLive && <p className='text-brand-secondary text-xs'>Checkin Count - <span className='font-medium text-base'>999</span></p>}
                    <p className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'><MapPin width={12} />
                        <p className='overflow-hidden text-ellipsis'>
                            {props.location}
                        </p>
                    </p>

                    {!props.isLive && <div className='border-t border-white grid grid-cols-3 gap-1 pt-2'>
                        <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Event</Link>
                        <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Edit Event</Link>
                        <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>All Attendees</Link>
                        <div className='col-span-3 flex w-full gap-1 justify-center'>
                            <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Send Invitations</Link>
                            <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Agendas</Link>
                        </div>
                        {/* <span className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Delete</span> */}
                    </div>}

                    {props.isLive && <div className='border-t border-white flex justify-between gap-2 pt-1'>
                        <span className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>View</span>
                        <span className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Edit</span>
                        <span className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Attendees</span>
                        <span className='text-xs rounded-full bg-white text-brand-primary text-center px-2'>Agenda</span>
                    </div>}
                </div>
            </div>

            {props.isLive && <div className='min-h-full w-full p-2 bg-white rounded-xl rounded-l-none'>
                {/* Registrations */}
                <div className='text-xs border-b border-brand-light py-1 pb-2'>
                    <div className='flex justify-between items-center'>
                        <span>Registrations</span>
                        <span>800/900</span>
                    </div>

                    <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
                        <div className='h-full bg-brand-secondary w-3/4 rounded-full' />
                    </div>
                </div>

                {/* Attendees */}
                <div className='text-xs border-b border-brand-light py-1 pb-2'>
                    <div className='flex justify-between items-center'>
                        <span>Attendees</span>
                        <span>500/900</span>
                    </div>

                    <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
                        <div className='h-full bg-brand-secondary w-7/12 rounded-full' />
                    </div>
                </div>

                {/* Speakers */}
                <div className='text-xs border-b border-brand-light py-1 pb-2'>
                    <div className='flex justify-between items-center'>
                        <span>Speakers</span>
                        <span>100/900</span>
                    </div>

                    <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
                        <div className='h-full bg-brand-secondary w-1/6 rounded-full' />
                    </div>
                </div>

                {/* Sponsors */}
                <div className='text-xs border-b border-brand-light py-1 pb-2'>
                    <div className='flex justify-between items-center'>
                        <span>Sponsors</span>
                        <span>450/900</span>
                    </div>

                    <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
                        <div className='h-full bg-brand-secondary w-1/2 rounded-full' />
                    </div>
                </div>

                {/* Pending Delegates */}
                <div className='text-xs border-b border-brand-light py-1 pb-2'>
                    <div className='flex justify-between items-center'>
                        <span>Pending Delegates</span>
                        <span>10</span>
                    </div>

                    {/* <div className='h-1 w-full mt-0.5 bg-brand-light rounded-full'>
                        <div className='h-full bg-brand-secondary w-3/4 rounded-full' />
                    </div> */}
                </div>

                <div className='mt-2 flex flex-col gap-2 justify-between'>
                    <div className='flex gap-2 justify-between'>
                        <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Report</Link>
                        <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Transcriber</Link>
                    </div>
                    <div className='flex gap-2 justify-between'>
                        <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Photos</Link>
                        <Link to={"#"} className='bg-brand-primary/20 text-brand-primary text-xs rounded-full px-2 w-full text-center'>Chart</Link>
                    </div>
                    <Button className='bg-brand-primary/20 hover:bg-brand-primary/30 cursor-pointer py-0 h-fit text-brand-primary text-xs rounded-full px-2 w-full text-center'>Generate PDF</Button>
                </div>
            </div>}
        </div>
    )
}

export default EventCard;