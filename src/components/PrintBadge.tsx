import { Printer } from 'lucide-react';
import React, { useRef } from 'react';
import { AttendeeType } from '@/types';
import { Button } from '@/components/ui/button';
import { printBadge } from '@/lib/utils';
import BadgeBanner from "@/assets/badge-banner.jpg";

interface PrintBadgeProps {
    attendee: AttendeeType;
    print?: boolean;
}

const PrintBadge: React.FC<PrintBadgeProps> = ({ attendee, print = true }) => {
    const fullName = `${attendee?.first_name} ${attendee?.last_name}`.trim();
    // Rough heuristic: if the name is very long (> 20 characters) it likely wraps to three lines on badge width
    const isLongName = fullName.length > 15;
    const badgeRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        // Trigger print ensuring the badge scales to the currently selected page size
        printBadge(badgeRef.current, '100%', '100%', 'auto');
    }

    return (
        <div className='max-w-80 my-10'>
            {/* Card For Printing... */}
            <div ref={badgeRef} className='w-full mx-auto h-full flex flex-1 pb-4'>
                <div className="w-full mx-auto overflow-hidden rounded bg-white flex flex-col justify-between flex-1">
                    <img
                        // src={`${baseUrl}/${badgeData?.imageUrl}`}
                        src={BadgeBanner}
                        className="!h-[160px] w-full rounded-t mx-auto object-cover"
                        alt="Badge"
                    />
                    
                    <div className='mx-4 pb-5 !capitalize'>
                        <h3 className={`font-bold ${isLongName ? 'text-4xl' : 'text-6xl'} pt-5 mb-2`}>
                            {fullName || 'Attendee Name'}
                        </h3>
                        <h3 className={`font-medium ${isLongName ? 'text-2xl' : 'text-3xl'} pt-3 mb-2`}>
                            {attendee?.job_title || "Designation"}
                        </h3>
                        <span className={`${isLongName ? 'text-xl' : 'text-2xl'} capitalize pt-3 pb-5`}>
                            {attendee?.company_name || "Company"}
                        </span>
                    </div>
                    <div className="py-4 text-2xl text-center capitalize font-semibold bg-gradient-to-r from-green-500 to-brand-primary text-white">
                        {attendee?.status || "Delegate"}
                    </div>
                </div>
            </div>


            {print && (
                <Button onClick={handlePrint} className='btn my-4 btn-primary w-full flex items-center justify-center gap-2'>
                    <Printer className="w-4 h-4" /> Print Badge
                </Button>
            )}
        </div>
    )
}

export default PrintBadge;
