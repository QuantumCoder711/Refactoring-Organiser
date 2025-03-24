import { MapPin } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

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
        <div className='h-64 w-64 shadow-blur-lg rounded-xl flex flex-col'>
            <div className='flex-1 overflow-hidden relative'>
                <img src={props.image} alt={props.imageAlt} className='w-full h-full object-cover rounded-t-xl' />
                <div className='h-1/2 bottom-0 w-full absolute bg-gradient-to-b from-black/0 via-black/40 to-black'>
                    <div className='w-full h-full flex justify-between items-end p-2'>
                        <span className='rounded-full border text-white text-xs h-[15px] w-20 grid place-content-center'>{props.date}</span>
                        {props.isLive && <span className='text-xs text-green-500 font-date-stamp uppercase'>Currently Running</span>}
                    </div>
                </div>
            </div>
            <div className='h-[98px] w-full bg-brand-background rounded-b-xl p-1 px-2'>
                <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>{props.title}</h3>
                {props.isLive && <p className='text-brand-secondary text-xs'>Checkin Count - <span className='font-medium text-base'>999</span></p>}
                <p className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'><MapPin width={12} />
                    <p className='overflow-hidden text-ellipsis'>
                        {props.location}
                    </p>
                </p>

                <div className='border-t border-white grid grid-cols-3 gap-1 pt-2'>
                    <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Event</Link>
                    <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Edit Event</Link>
                    <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>All Attendees</Link>
                    <div className='col-span-3 flex w-full gap-1 justify-center'>
                        <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Send Invitations</Link>
                        <Link to={"#"} className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>View Agendas</Link>
                    </div>
                    {/* <span className='text-xs rounded-full bg-white text-brand-primary text-center px-1'>Delete</span> */}
                </div>
            </div>
        </div>
    )
}

export default EventCard;