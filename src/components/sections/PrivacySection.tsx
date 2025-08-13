import React from 'react';
import Bot from "@/assets/bot.png";
import Authentication from "@/assets/authentication.png";
import Share from "@/assets/share.png";

const PrivacySection: React.FC = () => {
    return (
        <section className='max-w-[1205px] flex items-center flex-col justify-center mx-auto p-5'>
            <h2 className='capitalize text-center mt-14 mb-[70px] text-2xl lg:text-[40px] font-bold'>Your Data, Your Rules</h2>

            <div className='lg:hidden mx-auto bg-white/20 px-6 py-4 shadow-blur rounded-[10px] max-w-[370px] font-semibold text-2xl text-center'>We built Klout Club with privacy at the core.</div>
            <div className='flex flex-col sm:flex-row mt-8 gap-8 lg:gap-12'>
                <div className='bg-white/20 w-full px-6 py-4 shadow-blur rounded-[10px] max-w-[370px] min-h-full flex justify-between flex-col font-semibold text-2xl text-center'>
                    <img src={Authentication} alt="Bot illustration" width={285} height={166} className='mx-auto h-full w-auto' />
                    <p className='mt-2'>We don't sell your data. Period.</p>
                </div>

                <div className='hidden lg:flex flex-col gap-7'>
                    <div className='bg-white/20 px-6 py-4 shadow-blur rounded-[10px] max-w-[370px] font-semibold text-2xl text-center'>We built Klout Club with privacy at the core.</div>
                    <div className='mt-7 bg-white/20 px-6 py-4 shadow-blur rounded-[10px] max-w-[370px] font-semibold text-2xl text-center'>
                        <img src={Bot} alt="Bot illustration" width={144} height={64} className='mx-auto' />
                        <p className='mt-2'>We don't sell your data. Period.</p>
                    </div>
                </div>

                <div className='bg-white/20 px-6 py-4 shadow-blur rounded-[10px] max-w-[370px] min-h-full flex justify-between flex-col font-semibold text-2xl'>
                    <img src={Share} alt="Share illustration" width={206} height={137} className='mx-auto h-full w-auto' />
                    <p className='mt-2 text-left'>Control your data — set your photo private and choose visibility.</p>
                </div>
            </div>
            <div className='mt-8 lg:hidden mx-auto bg-white/20 px-6 py-4 shadow-blur rounded-[10px] max-w-[370px] font-semibold text-2xl text-center'>
                <img src={Bot} alt="Bot illustration" width={144} height={64} className='mx-auto' />
                <p className='mt-2'>We don't sell your data. Period.</p>
            </div>
            <p className='text-center mt-8'>100% Transparency. 0% Spam.</p>
        </section>
    )
}

export default PrivacySection;