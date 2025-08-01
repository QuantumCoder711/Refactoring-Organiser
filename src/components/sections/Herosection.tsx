import React from 'react';
import { Button } from "@/components/ui/button";
import KloutUser from "@/assets/klout-user.png";
import Network from "@/assets/network.svg";
import AiFile from "@/assets/ai-file.svg";
import Handshake from "@/assets/handshake.svg";
import QrCode from "@/assets/qr-code.svg";
import { Link } from 'react-router-dom';

const Herosection: React.FC = () => {
    return (
        <section className='w-full h-fit lg:h-full flex flex-col-reverse lg:flex-row items-center lg:gap-24 justify-center max-w-[1205px] mx-auto p-5'>

            {/* Text Div */}
            <div className='flex flex-col gap-9 w-full mt-[68px] lg:mt-0 lg:w-1/2 text-center lg:text-left'>
                <h1 className='text-5xl font-bold'>Make Business Networking Effortless with <span className='text-brand-primary'>Klout Club</span></h1>
                <p className='text-2xl '>Klout Club helps you create smarter events — with instant QR check-in, real-time networking, AI photos, and professional connections that last beyond the event. Start free, set up in minutes.</p>
                <Link to={"/add-first-event"}>
                    <Button className='btn !rounded-full !max-w-fit !text-lg !font-semibold !h-12 mx-auto lg:mx-0'>Get Started -  It's Free</Button>
                </Link>
            </div>

            {/* Image Div with Feature Icons */}
            <div className='w-full lg:w-1/2 relative flex justify-center mt-11 lg:mt-0'>
                {/* Center user image */}
                <div className='relative flex items-center justify-center'>
                    <img src={KloutUser} alt="Klout User" className="z-10" width={320} height={500} />

                    {/* Feature icons positioned around the user */}
                    <div className='absolute bottom-0 -right-20 z-20 rounded-xl'>
                        <img src={Network} alt="Network" width={186} height={186} />
                    </div>

                    <div className='absolute top-2/4 -left-24 z-20 rounded-xl'>
                        <img src={Handshake} alt="Handshake" width={128} height={128} />
                    </div>

                    <div className='absolute top-10 left-5 rounded-xl'>
                        <img src={QrCode} alt="QrCode" width={86} height={86} />
                    </div>

                    <div className='absolute top-24 -right-8 rounded-xl'>
                        <img src={AiFile} alt="AiFile" width={74} height={74}/>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Herosection;