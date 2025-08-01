import React from 'react';
import Tls from "@/assets/tls.png";
import AppleStore from '../AppleStore';
import GooglePlay from '../GooglePlay';

const TlsSection: React.FC = () => {
    return (
        <section className='mt-20 max-w-[1205px] flex flex-col-reverse lg:flex-row justify-center gap-[195px] w-full h-full mx-auto p-5'>
            <div className='w-1/2 flex flex-col gap-7 items-center justify-center'>
                <h2 className='font-bold text-brand-primary text-[40px]'>Thought Leadership Score</h2>
                <p className='text-2xl'>Quantify Your Influence: The Klout Club <strong>Thought Leadership Score</strong> measures your visibility, credibility, and impact across industry platforms. Download the app today to check your score and level up your leadership.</p>
                <div className='flex gap-[30px] flex-initial w-full'>
                    <AppleStore />
                    <GooglePlay />
                </div>
            </div>
            <div className='w-1/2'>
                <img src={Tls} width={484} height={551} alt="TLS" className='h-full' />
            </div>
        </section>
    )
}

export default TlsSection;