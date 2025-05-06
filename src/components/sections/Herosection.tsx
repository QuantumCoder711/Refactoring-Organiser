import React from 'react';
import {Button} from "@/components/ui/button";
import KloutUser from "@/assets/klout-user.png";
import Network from "@/assets/network.svg";
import AiFile from "@/assets/ai-file.svg";
import Handshake from "@/assets/handshake.svg";
import QrCode from "@/assets/qr-code.svg";

const Herosection: React.FC = () => {
  return (
    <section className='w-full h-full flex items-center gap-24 justify-center p-5'>

        {/* Text Div */}
        <div className='flex flex-col gap-9 w-1/2'>
            <h1 className='text-5xl font-bold'>Make Business Networking Effortless with <span className='text-brand-primary'>Klout Club</span></h1>
            <p className='text-2xl'>Klout Club helps you create smarter events — with instant QR check-in, real-time networking, AI photos, and professional connections that last beyond the event. Start free, set up in minutes.</p>
            <Button className='btn !rounded-full !max-w-fit !text-lg !font-semibold !h-12'>Get Started -  It's Free</Button>
        </div>

        {/* Image Div with Feature Icons */}
        <div className='w-1/2 relative flex justify-center'>
            {/* Center user image */}
            <div className='relative flex items-center justify-center'>
                <img src={KloutUser} alt="Klout User" className="z-10" width={320} />
                
                {/* Feature icons positioned around the user */}
                <div className='absolute bottom-0 -right-20 z-20 rounded-xl'>
                    <img src={Network} alt="Network" width={186}/>
                </div>
                
                <div className='absolute top-2/4 -left-24 z-20 rounded-xl'>
                    <img src={Handshake} alt="Handshake" width={128} />
                </div>
                
                <div className='absolute top-10 left-5 rounded-xl'>
                    <img src={QrCode} alt="QrCode" width={86} />
                </div>
                
                <div className='absolute top-24 -right-8 rounded-xl'>
                    <img src={AiFile} alt="AiFile" width={74} />
                </div>
            </div>
        </div>
    </section>
  )
}

export default Herosection;
