import { Brain, BrainCircuit, ChartPie, Mail, MapPin, MessageCircleMore } from 'lucide-react';
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

    return (
        <div className="w-full max-w-lg flex rounded-xl shadow-blur-lg relative">
            <div className="h-64 flex flex-col">
                <div className='flex-1 overflow-hidden relative w-64'>

                    <img
                        src={image}
                        alt={imageAlt}
                        className='w-full h-full object-cover rounded-t-xl'
                    />
                    <div className='h-1/2 bottom-0 w-full absolute bg-gradient-to-b from-black/0 via-black/40 to-black'>
                        <div className='w-full h-full flex justify-between items-end p-2'>
                            <span className='rounded-full border text-white text-xs h-[15px] w-20 grid place-content-center'>
                                {formatDate(date)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className='h-[60px] w-64 bg-brand-background rounded-b-xl p-1 px-2'>
                    <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>
                        {title}
                    </h3>
                    <div className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                        <MapPin width={8} height={12} className='min-w-2 min-h-3 fill-black stroke-white' />
                        <span className='overflow-hidden text-ellipsis'>
                            {location}
                        </span>
                    </div>

                </div>
            </div>

            <div className='min-h-full w-full bg-white rounded-xl rounded-l-none'>

                <div className='flex flex-col gap-2 h-full px-4 py-6 justify-between'>
                    <Link to={`mail-report/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-32 w-full'>
                            <Mail /> Mail
                        </div>
                    </Link>
                    <Link to={`whatsapp-report/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-32 w-full'>
                            <MessageCircleMore /> WhatsApp
                        </div>
                    </Link>
                    <Link to={`charts/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-32 w-full'>
                            <ChartPie /> Charts
                        </div>
                    </Link>
                    <Link to={`ai-photos/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-32 w-full'>
                            <Brain /> AI Photos
                        </div>
                    </Link>
                    <Link to={`ai-transcriber/${slug}`} className='text-white flex bg-brand-primary gap-2 px-3 h-[30px] py-2 items-center justify-center rounded-full w-full'>
                        <div className='flex gap-2 items-center max-w-32 w-full'>
                            <BrainCircuit /> AI Transcriber
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
