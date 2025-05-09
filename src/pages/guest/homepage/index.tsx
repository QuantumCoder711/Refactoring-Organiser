import Linea from '@/components/Linea';
import DownloadOptions from '@/components/sections/DownloadOptions';
import Features from '@/components/sections/Features';
import Herosection from '@/components/sections/Herosection';
import LaunchEvent from '@/components/sections/LaunchEvent';
import PrivacySection from '@/components/sections/PrivacySection';
import TlsSection from '@/components/sections/TlsSection';
import ToolsSection from '@/components/sections/ToolsSection';
import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className='w-full h-full'>

      {/* Herosection */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <Linea />
        <Herosection />
        <Linea />
      </div>

      {/* How Klout Club Works */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <Features />
        <Linea />
      </div>

      {/* TLS Section */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <TlsSection />
        <Linea />
      </div>

      {/* Tools Section */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <ToolsSection />
        <Linea />
      </div>

      {/* Privacy Section */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <PrivacySection />
        <Linea />
      </div>

      {/* Launch Event Section */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <LaunchEvent />
        <Linea />
      </div>

      {/* Download Options Section */}
      <div className='flex flex-col lg:flex-1 min-h-fit'>
        <DownloadOptions />
        <Linea />
      </div>
    </div>
  )
}

export default Homepage;