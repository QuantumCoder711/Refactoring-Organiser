import GoBack from '@/components/GoBack';
import ReportCard from '@/components/ReportCard';
import { getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { EventType } from '@/types';
import React from 'react'

const AllReports: React.FC = () => {

    const { events } = useEventStore(state => state);

    return (
        <div>
            <GoBack />
            <div className='flex gap-5 flex-wrap mt-7'>
                {
                    events.map((event: EventType) => (
                        <ReportCard
                            id={event.id}
                            key={event.slug}
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
