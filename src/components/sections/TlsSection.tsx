import React from 'react';
import Tls from "@/assets/tls.png";
import AppleStore from '../AppleStore';
import GooglePlay from '../GooglePlay';

const TlsSection: React.FC = () => {
    return (
        <section className='mt-20 max-w-[1205px] flex flex-col-reverse items-center lg:flex-row justify-center gap-10 lg:gap-[195px] w-full h-full mx-auto p-5'>
            
            <div className='w-full lg:w-1/2 flex flex-col gap-7 items-center justify-center'>
                <h2 className='font-bold text-primary lg:text-[40px] text-2xl'>Thought Leadership Score</h2>
                <p className='text-lg text-center lg:text-left lg:text-2xl'>Quantify Your Influence: The Klout Club <strong>Thought Leadership Score</strong> measures your visibility, credibility, and impact across industry platforms. Download the app today to check your score and level up your leadership.</p>
                <div className='flex gap-[30px] dark:invert flex-initial lg:justify-self-start justify-center w-full'>
                    <AppleStore />
                    <GooglePlay />
                </div>
            </div>
            <div className='lg:w-1/2'>
                <img src={Tls} width={484} height={551} alt="TLS" className='max-w-80 lg:max-w-full h-full' />
            </div>
        </section>
    )
}

export default TlsSection;