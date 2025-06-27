import { Briefcase } from 'lucide-react';
import React from 'react';
import { AttendeeType } from '@/types';
import { Button } from './ui/button';
import { getImageUrl } from '@/lib/utils';

interface PrintBadgeProps {
    attendee: AttendeeType;
    print?: boolean;
}

const PrintBadge: React.FC<PrintBadgeProps> = ({ attendee, print = true }) => {
    return (
        <div className='max-w-fit'>
            {/* Card */}
            <div className="w-72 h-96 overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl relative flex flex-col">
                {/* Ribbon */}
                <div className="absolute -right-8 top-6 w-40 bg-cyan-500 shadow-lg text-white text-center text-sm font-bold py-1 transform rotate-45 z-10">
                    <span className="block uppercase">{attendee.status}</span>
                </div>

                {/* Header with gradient */}
                <div className='w-full h-32 min-h-32 bg-gradient-to-r from-cyan-500 to-blue-500 relative'>
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-28 h-28 rounded-full bg-white p-1 border-4 border-white shadow-xl">
                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                            {attendee.image?.trim() !== '' ? <img src={getImageUrl(attendee.image)} alt={attendee.first_name.charAt(0) + attendee.last_name.charAt(0)} className="w-full h-full rounded-full object-cover" /> : <span className="text-4xl font-bold text-cyan-600 uppercase">{attendee.first_name.charAt(0) + attendee.last_name.charAt(0)}</span>}
                        </div>
                    </div>
                </div>

                {/* Card Body */}
                <div className="pt-16 pb-6 px-3 text-center flex-1 flex flex-col justify-center">
                    {/* Name */}
                    <h3 className="text-4xl capitalize font-extrabold text-gray-800 mb-2">
                        {attendee.first_name.toLowerCase()} {attendee.last_name.toLowerCase()}
                    </h3>

                    {/* Designation */}
                    <p className="text-lg capitalize font-medium text-cyan-600 mb-2">
                        {attendee.job_title}
                    </p>

                    {/* Company */}
                    <div className="flex justify-center text-gray-600 text-base mb-6">
                        <p className='capitalize flex max-w-72'>
                            <Briefcase className="w-5 h-5 text-cyan-500 mr-2" />
                            {attendee.company_name.toLowerCase()}
                        </p>
                    </div>
                </div>
            </div>
            {print && (
                <Button className='btn btn-primary mt-4 w-full'>Print Badge</Button>
            )}
        </div>
    )
}

export default PrintBadge;
