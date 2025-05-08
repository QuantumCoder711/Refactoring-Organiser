import React from 'react';
import { Trophy } from 'lucide-react';

const Features: React.FC = () => {
    return (
        <section className='p-5 mt-7 max-w-[1205px] mx-auto'>
            <h2 className='text-[40px] font-bold text-center'>How Klout Works</h2>

            <div className='mt-[66px] grid grid-cols-9 gap-5'>

                <div className='bg-white rounded-md p-5 h-[400px] relative flex flex-col items-center'>
                    <Trophy size={50} />
                    <h4 className='text-xl font-semibold rotate-90 text-center top-48 absolute text-nowrap'>Set Up Your Event (in Min.)</h4>
                </div>
            </div>
        </section>
    )
}

export default Features;
