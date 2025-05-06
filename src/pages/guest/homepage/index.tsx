import Linea from '@/components/Linea';
import Herosection from '@/components/sections/Herosection';
import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className='w-full h-full'>
      
      {/* Herosection */}
      <div className='flex flex-col flex-1 h-full'>
        <Linea />
        <Herosection />
        <Linea />
      </div>
    </div>
  )
}

export default Homepage;