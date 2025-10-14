import React from 'react';

const Linea: React.FC = () => {
    return (
        <div className='flex gap-2.5 items-center'>
            <div className='bg-accent h-[1px] w-full' />
            <span className='min-w-3.5 min-h-3.5 border border-accent shadow-blur bg-brand-light-gray rounded-full inline-block' />
            <div className='bg-accent h-[1px] w-full' />
        </div>
    )
}

export default Linea;
