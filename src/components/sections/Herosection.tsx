import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import KloutUser from "@/assets/klout-user.png";
import Network from "@/assets/network.svg";
import AiFile from "@/assets/ai-file.svg";
import Handshake from "@/assets/handshake.svg";
import QrCode from "@/assets/qr-code.svg";
import { motion } from "framer-motion";

const imageList = [Network, AiFile, QrCode, Handshake];

const positions = [
    { top: "40px", left: "20px", zIndex: "auto", width: 86 },
    { top: "96px", right: "-32px", zIndex: "auto", width: 74 },
    { bottom: "0", right: "-80px", zIndex: 20, width: 186 },
    { top: "50%", left: "-96px", zIndex: 20, width: 128 },
];

const Herosection: React.FC = () => {
<<<<<<< HEAD
    const [images, setImages] = useState(imageList);

    useEffect(() => {
        const interval = setInterval(() => {
            setImages(prev => {
                const newImages = [...prev];
                newImages.unshift(newImages.pop()!); // Rotate array
                return newImages;
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className='w-full h-full flex items-center gap-24 justify-center p-5'>
            {/* Text Content */}
            <div className='flex flex-col gap-9 w-1/2'>
                <h1 className='text-5xl font-bold'>
                    Make Business Networking Effortless with <span className='text-brand-primary'>Klout Club</span>
                </h1>
                <p className='text-2xl'>
                    Klout Club helps you create smarter events — with instant QR check-in, real-time networking, AI photos, and professional connections that last beyond the event. Start free, set up in minutes.
                </p>
                <Button className='btn !rounded-full !max-w-fit !text-lg !font-semibold !h-12'>
                    Get Started - It's Free
                </Button>
            </div>

            {/* Image Display */}
            <div className='w-1/2 relative flex justify-center'>
                <div className='relative flex items-center justify-center'>
                    <img src={KloutUser} alt="Klout User" className="z-10" width={320} />

                    {/* Fixed positions, rotating images */}
                    {positions.map((pos, index) => (
                        <motion.div
                            key={images[index]} // Ensures correct animation
                            className="absolute rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 1 } }}
                            exit={{ opacity: 0 }}
                            // transition={{ duration: 1 }}
                            style={{
                                top: pos.top,
                                left: pos.left,
                                right: pos.right,
                                bottom: pos.bottom,
                                zIndex: pos.zIndex,
                                width: pos.width,
                            }}
                        >
                            <img
                                src={images[index]}
                                alt={`Feature ${index}`}
                                className="rounded-xl w-full h-auto"
                            />
                        </motion.div>
                    ))}
=======
  return (
    <section className='w-full h-fit lg:h-full flex flex-col-reverse lg:flex-row items-center lg:gap-24 justify-center max-w-[1205px] mx-auto p-5'>

        {/* Text Div */}
        <div className='flex flex-col gap-9 w-full mt-[68px] lg:mt-0 lg:w-1/2 text-center lg:text-left'>
            <h1 className='text-5xl font-bold'>Make Business Networking Effortless with <span className='text-brand-primary'>Klout Club</span></h1>
            <p className='text-2xl '>Klout Club helps you create smarter events — with instant QR check-in, real-time networking, AI photos, and professional connections that last beyond the event. Start free, set up in minutes.</p>
            <Button className='btn !rounded-full !max-w-fit !text-lg !font-semibold !h-12 mx-auto lg:mx-0'>Get Started -  It's Free</Button>
        </div>

        {/* Image Div with Feature Icons */}
        <div className='w-full lg:w-1/2 relative flex justify-center mt-11 lg:mt-0'>
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
>>>>>>> homepage
                </div>
            </div>
        </section>
    );
};

export default Herosection;
