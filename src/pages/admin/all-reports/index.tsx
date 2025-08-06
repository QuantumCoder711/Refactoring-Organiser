import ReportCard from '@/components/ReportCard';
import { getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { EventType } from '@/types';
import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const AllReports: React.FC = () => {
    const { events } = useEventStore(state => state);
    const [searchTerm, setSearchTerm] = useState<string>("");

    return (
        <div>
            {/* Searchbar */}
            <div className="relative max-w-fit mb-10 mx-auto">
                <Input
                    type="text"
                    placeholder="Search for reports..."
                    className="input !min-w-80 !text-base !bg-brand-background/80"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                />
                {searchTerm && (
                    <X
                        onClick={() => setSearchTerm('')}
                        className="w-4 h-4 absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" />
                )}
            </div>
            
            <div className='flex gap-5 flex-wrap mt-7'>
                {
                    events.filter((event: EventType) => event.title.toLowerCase().includes(searchTerm.toLowerCase())).sort((a: any, b: any) => {
                        return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
                    }).map((event: EventType) => (
                        <ReportCard
                            id={event.id}
                            key={event.id}
                            date={event.event_date}
                            image={getImageUrl(event.image)}
                            imageAlt={event.title}
                            location={event.event_venue_address_1}
                            slug={event.slug}
                            title={event.title}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default AllReports;
