import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'
import DummyCardImage from '@/assets/dummyCardImg.png';

const AllEvents: React.FC = () => {

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');


    return (
        <div>
            {/* Tab and Pagination */}
            <div className='flex justify-between items-center'>
                <div className='flex gap-5'>
                    <Button
                        className={`btn !text-black !bg-brand-background hover:bg-brand-dark-gray rounded-[10px] ${activeTab === 'upcoming' ? '!bg-brand-dark-gray !text-white' : ''}`}
                        onClick={() => setActiveTab('upcoming')}>Upcoming Events</Button>
                    <Button
                        className={`btn !text-black !bg-brand-background hover:bg-brand-dark-gray rounded-[10px] ${activeTab === 'past' ? '!bg-brand-dark-gray !text-white' : ''}`}
                        onClick={() => setActiveTab('past')}>Past Events</Button>
                </div>

                <div>
                    Pagination
                </div>
            </div>

            {/* Upcoming Events */}
            {activeTab === 'upcoming' && <div className='mt-5'>
                <EventCard
                    title='Telecom Summit & Awards 2025! (Webinar)'
                    location='Hotel Le-Meridien Hotel(Sovereign - 1), New-Delhi'
                    date='15-Feb-2025'
                    image={DummyCardImage}
                    imageAlt='Event Image'
                    isLive={true}
                />
            </div>}

            {/* Past Events */}
            {activeTab === 'past' && <div className='mt-5'>
                <EventCard
                    title='Telecom Summit & Awards 2025! (Webinar)'
                    location='Hotel Le-Meridien Hotel(Sovereign - 1), New-Delhi'
                    date='15-Feb-2025'
                    image={DummyCardImage}
                    imageAlt='Event Image'
                // isLive={true}
                />
            </div>}
        </div>
    )
}

export default AllEvents;
