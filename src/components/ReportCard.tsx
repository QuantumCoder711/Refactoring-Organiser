import { formatDateTime } from '@/lib/utils';
import { Brain, BrainCircuit, ChartPie, Globe, Mail, MapPin, MessageCircleMore, Printer } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface ReportCardProps {
    title: string;
    location: string;
    date: string;
    image: string;
    imageAlt: string;
    slug: string;
    id: number;
}

const ReportCard: React.FC<ReportCardProps> = ({
    title,
    location,
    date,
    image,
    imageAlt,
    slug,
}) => {

    return (
        <div className="w-full max-w-lg flex rounded-xl shadow-blur-lg relative">
            <div className="min-h-64 h-fit flex flex-col">
                <div className='flex-1 overflow-hidden relative w-64'>

                    <img
                        src={image}
                        alt={imageAlt}
                        className='w-full h-60 object-cover rounded-t-xl'
                    />
                    <div className='h-1/2 bottom-0 w-full absolute bg-gradient-to-b from-black/0 via-black/40 to-black'>
                        <div className='border border-white rounded-full px-4 absolute bottom-2 left-2 text-white py-1 max-w-fit text-xs'>
                            {formatDateTime(date)}
                        </div>
                    </div>
                </div>
                <div className='h-[60px] w-64 bg-brand-background rounded-b-xl p-1 px-2'>
                    <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>
                        {title}
                    </h3>
                    <div hidden={location ? false : true} className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                        <MapPin size={24} className='min-w-6 min-h-6 fill-black stroke-white' />
                        <span className='overflow-hidden text-ellipsis'>
                            {location}
                        </span>
                    </div>

                    <div hidden={location ? true : false} className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                        <Globe size={24} className='min-w-6 min-h-6 fill-black stroke-white' />
                        <span className='overflow-hidden text-ellipsis'>
                            Online
                        </span>
                    </div>

                </div>
            </div>

            <div className='min-h-full w-full bg-white rounded-xl rounded-l-none'>

                <div className='flex flex-col gap-3 items-center justify-center h-full px-4 py-6'>
                    <Link to={`mail-report/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-36 w-full'>
                            <Mail /> Mail
                        </div>
                    </Link>
                    <Link to={`whatsapp-report/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-36 w-full'>
                            <MessageCircleMore /> WhatsApp
                        </div>
                    </Link>
                    {location && <Link to={`charts/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-36 w-full'>
                            <ChartPie /> Charts
                        </div>
                    </Link>}
                    <Link to={`ai-photos/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-36 w-full'>
                            <Brain /> AI Photos
                        </div>
                    </Link>
                    <Link to={`ai-transcriber/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-36 w-full'>
                            <BrainCircuit /> AI Transcriber
                        </div>
                    </Link>
                    {location && <Link to={`print-badges/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-36 w-full'>
                            <Printer /> Print Badges
                        </div>
                    </Link>}
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
