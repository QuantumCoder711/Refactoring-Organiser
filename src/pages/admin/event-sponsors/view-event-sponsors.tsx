import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';
import { domain, token } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import axios from 'axios';
import { CircleCheck, CircleX, Edit, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventSponsor {
    id: number;
    event_id: number;
    company_name: string;
    company_logo: string;
}

const Card: React.FC<{ image: string | null, title: string, id: number }> = ({ image, title, id }) => {
    const { slug } = useParams<{ slug: string }>();

    const handleDeleteSponsor = async (id: number) => {
        const response = await axios.delete(`${domain}/api/delete-sponsor/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.data.success) {
            toast(response.data.message || 'Sponsor Deleted Successfully', {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className='size-5' />
            });
            window.location.reload();
        } else {
            toast(response.data.message || 'Failed To Delete Sponsor', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }

    }

    return (
        <div className='w-52 h-52 bg-muted flex justify-between flex-col rounded-lg p-4 shadow'>
            <div className='h-24 w-full grid place-content-center overflow-clip bg-background/50 rounded-2xl'>
                <img className='w-full h-full object-contain' src={getImageUrl(image)} alt={title} />
            </div>
            <h3 className='font-bold text-center capitalize'>{title}</h3>
            <div className='flex justify-between gap-2'>
                <Link to={`/event-sponsors/${slug}/sponsor-details/${id}`} className='w-full'>
                    <Button className='rounded-full w-full'>View</Button>
                </Link>

                <Link to={`/event-sponsors/${slug}/update-sponsor/${id}`} className='p-2 w-9 h-9 min-w-9 min-h-9 bg-primary hover:bg-primary/80 duration-300 grid place-content-center rounded-full text-white'>
                    <Edit size={16} />
                </Link>

                <AlertDialog>
                    <AlertDialogTrigger
                        className='grid place-content-center text-white w-9 h-9 min-w-9 min-h-9 bg-secondary duration-300 cursor-pointer rounded-full z-50 top-2 right-2'
                    >
                        <Trash size={16} />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Do you really want to delete {title} ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {title}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                            <AlertDialogAction className='cursor-pointer bg-destructive hover:bg-destructive/80 duration-300 transition-all text-white' onClick={() => handleDeleteSponsor(id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
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
        axios.post(`${domain}/api/get-sponsors/${event.id}`, {}, {
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
            <div className="flex items-center gap-5">
                <GoBack />
                <h2 className="text-xl font-semibold capitalize">{event?.title}</h2>
            </div>

            <div className='flex gap-5 mt-5 flex-wrap'>
                {
                    eventSponsors.map((sponsor) => (
                        <Card
                            key={sponsor.id}
                            image={sponsor.company_logo}
                            title={sponsor.company_name}
                            id={sponsor.id}
                        />
                    ))
                }
                {/* <Card image={""} title="Insighter Media" id="1" /> */}
            </div>
        </div>
    )
}

export default ViewEventSponsors;
