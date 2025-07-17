import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
// import Wave from '@/components/Wave';
import { getImageUrl } from '@/lib/utils';
// import useAttendeeStore from '@/store/attendeeStore';
// import useAuthStore from '@/store/authStore';
// import useEventStore from '@/store/eventStore';
import React from 'react'
import { Link, useParams } from 'react-router-dom';

const Card: React.FC<{ image: string | null, title: string, id: string }> = ({ image, title, id }) => {
    const { slug } = useParams<{ slug: string }>();
    return (
        <div className='w-52 h-52 bg-brand-background flex justify-between flex-col rounded-lg p-4 shadow'>
            <div className='h-24 w-full grid place-content-center overflow-clip bg-white rounded-2xl'>
                <img className='w-full h-full object-contain' src={getImageUrl(image)} alt={title} />
            </div>
            <h3 className='font-bold text-center'>{title}</h3>
            <Link to={`/event-sponsors/${slug}/${id}`}>
                <Button className='btn !rounded-full !w-full font-bold'>View Sponsor</Button>
            </Link>
        </div>
    )
}

const ViewEventSponsors: React.FC = () => {
    // const { slug } = useParams<{ slug: string }>();

    return (
        <div>
            <GoBack />

            <div className='flex gap-5 mt-5 flex-wrap'>
                <Card image={""} title="Insighter Media" id="1" />
            </div>
        </div>
    )
}

export default ViewEventSponsors;
