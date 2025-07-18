import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useEventStore from '@/store/eventStore';
import PrintBadge from '@/components/PrintBadge';
import { BadgeData } from '@/types';

const CreateBadge: React.FC = () => {
    const { slug } = useParams();
    const event = useEventStore((state) => state.getEventBySlug(slug));

    const [badgeData, setBadgeData] = useState<BadgeData>({
        firstName: "John",
        lastName: "Doe",
        companyName: "Google",
        jobTitle: "Software Engineer",
        image: event?.badge_banner || null,
        status: "Speaker",
        speakerTagColor: "#0071E3",
        delegateTagColor: "#fff",
        sponsorTagColor: "#0071E3",
        speakerTextColor: "#fff",
        delegateTextColor: "#0071E3",
        sponsorTextColor: "#fff",
    });

    return (
        <div className='w-full h-full'>
            <div className='max-w-2xl w-full mx-auto p-5'>
                <PrintBadge data={badgeData} print={false} />
            </div>
        </div>
    )
}

export default CreateBadge;
