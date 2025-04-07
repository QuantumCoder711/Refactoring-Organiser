import React from 'react';

const Wave: React.FC = () => {
    return (
        <div className='w-full h-full items-center gap-3 p-2'>
            <div className='flex gap-1.5 items-center justify-center'>
                <div className='w-3 h-3 rounded-full bg-brand-primary animate-bounce delay-0'></div>
                <div className='w-3 h-3 rounded-full bg-brand-primary animate-bounce delay-150'></div>
                <div className='w-3 h-3 rounded-full bg-brand-primary animate-bounce delay-300'></div>
            </div>
        </div>
    )
}

export default Wave;
