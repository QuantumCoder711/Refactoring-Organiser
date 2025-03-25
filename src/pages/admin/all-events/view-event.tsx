import React from 'react';
import { useParams } from 'react-router-dom';
import DummyCardImage from "@/assets/dummyCardImg.png";

const ViewEvent: React.FC = () => {

    const { id } = useParams<{ id: string }>();

    return (
        <div className='max-w-2xl mx-auto bg-brand-background p-5 rounded-lg h-full'>
            <h1 className='text-2xl font-bold text-center'>Telecom Powerhouse Summit 2025</h1>
            <img src={DummyCardImage} alt="Event Image" className='w-[300px] h-[300px] mt-5 mx-auto rounded-lg' />
        </div>
    )
}

export default ViewEvent;
