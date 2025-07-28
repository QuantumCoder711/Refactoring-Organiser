import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';
import { domain, token } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import axios from 'axios';
import { CircleX } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface EventSponsor {
    id: number;
    event_id: number;
    company_name: string;
    company_logo: string;
}

const Card: React.FC<{ image: string | null, title: string, id: string }> = ({ image, title, id }) => {
    const { slug } = useParams<{ slug: string }>();
    return (
        <div className='w-52 h-52 bg-brand-background flex justify-between flex-col rounded-lg p-4 shadow'>
            <div className='h-24 w-full grid place-content-center overflow-clip bg-white rounded-2xl'>
                <img className='w-full h-full object-contain' src={getImageUrl(image)} alt={title} />
            </div>
            <h3 className='font-bold text-center capitalize'>{title}</h3>
            <Link to={`/event-sponsors/${slug}/${id}`}>
                <Button className='btn !rounded-full !w-full font-bold'>View Sponsor</Button>
            </Link>
        </div>
    )
}

const ViewEventSponsors: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const event = useEventStore((state) => state).getEventBySlug(slug);
    const [eventSponsors, setEventSponsors] = React.useState<EventSponsor[]>([]);

    useEffect(() => {
        if (!event) return;
        setLoading(true);
        axios.get(`${domain}/api/get-sponsors/${event.id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => {
            if (res.data.success) {
                setEventSponsors(res.data.data);
            } else {
                toast('Failed to fetch sponsors', {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [event]);

    if (loading) {
        return <Wave />
    }

    return (
        <div>
            <GoBack />

            <div className='flex gap-5 mt-5 flex-wrap'>
                {
                    eventSponsors.map((sponsor) => (
                        <Card
                            key={sponsor.id}
                            image={sponsor.company_logo}
                            title={sponsor.company_name}
                            id={sponsor.id.toString()}
                        />
                    ))
                }
                {/* <Card image={""} title="Insighter Media" id="1" /> */}
            </div>
        </div>
    )
}

export default ViewEventSponsors;
