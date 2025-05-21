import React, { useState } from 'react';
import EventsBg from '@/assets/eventsBg.png';
import { Link } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import Video from '@/assets/video.mp4';
import Phone from '@/assets/frame.png';
import Footer from '@/components/Footer';

const ExploreEvents: React.FC = () => {

    const [isMuted, setIsMuted] = useState<boolean>(true);

    // State to control hover effect
    const [isHovered, setIsHovered] = useState<boolean>(false);

    // Toggle mute state when video is clicked
    const handleVideoClick = () => {
        setIsMuted(prevState => !prevState);
    };

    // Set hover state when mouse enters or leaves the video
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    // Handle icon click to stop propagation and toggle mute
    const handleIconClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent click from bubbling up to the video div
        setIsMuted(prevState => !prevState); // Toggle mute state
    };

    return (
        <main
            className={`!overflow-x-hidden relative bg-zinc-800 h-screen text-white p-5 flex flex-col bg-cover bg-center`}
            style={{ background: `url(${EventsBg})` }}
        >
            <div className='max-w-screen-lg w-full flex mt-20 flex-col sm:flex-row justify-between gap-5 items-center mx-auto sm:h-full'>
                <div className=''>
                    <span className='text-base md:text-xl !m-0'>Welcome To</span>
                    <h1 className='text-3xl sm:text-4xl xl:text-5xl font-bold'>Klout Club <br />
                        <span className='curly'>Smarter</span> Event <br />
                        <span className='curly'>Smoother</span> Experience!
                    </h1>
                    <div className='mb-14'>
                        <h2 className='text-3xl sm:text-4xl xl:text-5xl font-bold capitalize'><span className='curly'>Ready</span> to host a smarter event<span className='curly'>?</span></h2>
                        <Link to="/add-first-event" className='py-2 px-5 inline-block font-semibold mt-6 bg-white text-black rounded-full '>Create Your First Event</Link>
                    </div>
                    <p className='max-w-[500px] text-sm md:text-base mt-3'>Effortlessly create, manage, and elevate your events
                        All in one place. From hassle-free check-ins to
                        AI-powered insights, Make Your event management smarter! <br /> <br /></p>

                    <p>Powerful, free event management tool designed to streamline your event experience. From QR code check-ins and AI-enhanced networking to real-time attendee insights and post-event session summaries, Klout Club makes organizing events seamless. Whether you're hosting a conference, summit, or exhibition, our platform helps you manage attendees efficiently while fostering meaningful connections. Set up your event in just 10 minutes and enhance engagement with smart networking features. Join thousands of organizers who trust Klout Club to create impactful events. Start now and transform the way you manage and experience events effortlessly!</p>

                </div>

                {/* Video in Frame */}
                <div
                    onClick={handleVideoClick}  // Toggle mute when clicked
                    onMouseEnter={handleMouseEnter}  // Show icons when hovered
                    onMouseLeave={handleMouseLeave}  // Hide icons when mouse leaves
                    className='h-[500px] !overflow-hidden cursor-pointer min-w-[246px] !bg-cover bg-center relative rounded-[42px] !bg-no-repeat'>

                    <video
                        className='absolute top-0 inset-1 left-0 w-full h-full z-10 object-cover py-7 mx-2 !pr-4'
                        src={Video}
                        autoPlay
                        loop
                        muted={isMuted}  // Control mute state
                        playsInline
                    />
                    <img src={Phone} alt="IPhone Frame" className='absolute z-10 w-full h-full' />

                    {/* Mute/Unmute Icons */}
                    {isHovered && (
                        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20'>
                            {isMuted ? (
                                <VolumeX
                                    className='text-white text-4xl cursor-pointer'
                                    onClick={handleIconClick}  // Handle icon click
                                />
                            ) : (
                                <Volume2
                                    className='text-white text-4xl cursor-pointer'
                                    onClick={handleIconClick}  // Handle icon click
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='mt-5 invert-50'>
                <Footer type='basic' />
            </div>
        </main>
    )
}

export default ExploreEvents;