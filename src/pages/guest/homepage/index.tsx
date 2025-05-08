import Linea from '@/components/Linea';
import Features from '@/components/sections/Features';
import Herosection from '@/components/sections/Herosection';
import TlsSection from '@/components/sections/TlsSection';
import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className='w-full h-full'>

      {/* Herosection */}
      <div className='flex flex-col lg:flex-1 h-full'>
        <Linea />
        <Herosection />
        <Linea />
      </div>

      {/* How Klout Club Works */}
      <div className='flex flex-col lg:flex-1 h-full'>
        <Features />
        <Linea />
      </div>

      {/* TLS Section */}
      <div className='flex flex-col lg:flex-1 h-full'>
        <TlsSection />
        <Linea />
      </div>
    </div>
  )
}

export default Homepage;