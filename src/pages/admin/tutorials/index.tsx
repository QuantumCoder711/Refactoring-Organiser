import GoBack from '@/components/GoBack';
import React from 'react';
import { tutorials } from './tutorialsData';

const Tutorials:React.FC = () => {
  return (
    <div>
      <GoBack />

      <div className='grid grid-cols-3 gap-6 rounded-[15px] mt-5'>
        {tutorials.map((tutorial, index) => (
          <div key={index} className='bg-brand-light-gray p-2 !rounded-[10px] w-full aspect-video flex flex-col justify-between'>
            <iframe
              src={tutorial.videoUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className='w-full h-full !rounded-[10px]'
            />
            <div className='flex flex-col gap-2 mt-2.5'>
              <h2 className="text-lg font-medium group-hover:text-brand-primary duration-300">{tutorial.title}</h2>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

export default Tutorials;
