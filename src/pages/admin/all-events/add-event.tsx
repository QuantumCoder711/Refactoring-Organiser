import EventForm from '@/components/EventForm';
import GoBack from '@/components/GoBack';
import React from 'react'

const AddEvent: React.FC = () => {

    return (
        <div className='relative w-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <EventForm />
        </div>
    )
}

export default AddEvent;
