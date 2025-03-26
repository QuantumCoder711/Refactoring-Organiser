import React from 'react';
import { useParams } from 'react-router-dom';
import DummyCardImage from "@/assets/dummyCardImg.png";
import GoogleMap from "@/components/GoogleMap";
const ViewEvent: React.FC = () => {

    const { id } = useParams<{ id: string }>();

    return (
        <div className='max-w-2xl mx-auto bg-brand-background rounded-lg'>
            <h1 className='text-2xl font-bold text-center p-5'>Telecom Powerhouse Summit 2025</h1>
            <img src={DummyCardImage} alt="Event Image" className='w-[300px] h-[300px] mx-auto rounded-lg' />
            {/* Time */}
            <div className='text-xs flex gap-2.5 mt-5 justify-center'>
                <span className='border border-brand-light-gray px-3 rounded-lg'>Fri, 14 Jan-20 Feb, 2025</span>
                <span className='border border-brand-light-gray px-3 rounded-lg'>09:00 AM - 05:00 PM</span>
            </div>

            {/* Description */}
            <div className='border-t mt-3 p-5 border-white'>
                <h3 className='font-semibold'>Description</h3>
                <p className='text-sm mt-2 text-brand-dark-gray'>Lorem ipsum dolor sit amet consectetur. Orci justo parturient vitae pellentesque urna. Eu diam accumsan blandit nibh elementum venenatis. Nulla posuere donec risus et accumsan aliquam volutpat integer id. Proin massa quis commodo viverra nisi et. Elementum hac sed nisl lacus tristique faucibus dignissim. Suspendisse habitant nisi diam viverra et. Rhoncus nunc faucibus senectus feugiat iaculis integer commodo. Volutpat id tellus mi leo rhoncus. Metus diam eleifend ornare vitae. Vestibulum non risus mi cras turpis at et. Fermentum at adipiscing ut habitasse sociis consectetur. Volutpat nunc ultricies amet aliquet mauris augue nunc faucibus condimentum. Mauris nunc et turpis malesuada arcu nunc metus.</p>
            </div>


            {/* Event OTP & Agenda By */}
            <div className='p-5 border-t border-white flex justify-between'>
                <div className='w-1/2'>
                    <h3 className='font-semibold'>Event OTP</h3>
                    <p className='text-sm text-brand-dark-gray'>696969</p>
                </div>
                <div className='w-1/2 border-l border-white pl-5'>
                    <h3 className='font-semibold'>View Agenda By</h3>
                    <p className='text-sm text-brand-dark-gray'>All</p>
                </div>
            </div>

            {/* Event Location */}
            <div className='p-5 border-t border-white'>
                <h3 className='font-semibold'>Location</h3>
                <p className='text-sm font-semibold -mt-1 text-brand-dark-gray'>Hotel holiday Inn, Aerocity</p>
                <p className='text-sm text-brand-dark-gray'>3rd - 5th floor, Huda City Centre Metro Station, Sector 29, Gurugram, Haryana 122002, India</p>

                {/* Map Component */}
                <div className='h-60 mt-3 rounded-lg shadow-blur'>
                    <GoogleMap latitude={28.4595} longitude={77.0265}/>
                </div>
            </div>

            {/* Agenda Details */}
            <div className='p-5 border-t border-white'>
                <h3 className='font-semibold'>Agenda</h3>
                <p className='text-sm text-brand-dark-gray'>Lorem ipsum dolor sit amet consectetur. Orci justo parturient vitae pellentesque urna. Eu diam accumsan blandit nibh elementum venenatis. Nulla posuere donec risus et accumsan aliquam volutpat integer id. Proin massa quis commodo viverra nisi et. Elementum hac sed nisl lacus tristique faucibus dignissim. Suspendisse habitant nisi diam viverra et. Rhoncus nunc faucibus senectus feugiat iaculis integer commodo. Volutpat id tellus mi leo rhoncus. Metus diam eleifend ornare vitae. Vestibulum non risus mi cras turpis at et. Fermentum at adipiscing ut habitasse sociis consectetur. Volutpat nunc ultricies amet aliquet mauris augue nunc faucibus condimentum. Mauris nunc et turpis malesuada arcu nunc metus.</p>
            </div>
        </div>
    )
}

export default ViewEvent;
