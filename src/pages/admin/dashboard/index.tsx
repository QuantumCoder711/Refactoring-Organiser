import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      {/* Events Information */}
      <div className='grid grid-cols-4 gap-5'>

        {/* Card 1 */}
        <div className='cursor-pointer duration-300 hover:bg-brand-background rounded-lg h-9 px-4 shadow-[0_0_4px_0_rgba(0,0,0,0.25)] flex justify-between items-center'>
          <span>Total Events</span>
          <span>10</span>
        </div>
        {/* Card 2 */}
        <div className='cursor-pointer duration-300 hover:bg-brand-background rounded-lg h-9 px-4 shadow-[0_0_4px_0_rgba(0,0,0,0.25)] flex justify-between items-center'>
          <span>Total Attendees</span>
          <span>10</span>
        </div>
        {/* Card 3 */}
        <div className='cursor-pointer duration-300 hover:bg-brand-background rounded-lg h-9 px-4 shadow-[0_0_4px_0_rgba(0,0,0,0.25)] flex justify-between items-center'>
          <span>Total Sponsers</span>
          <span>10</span>
        </div>
        {/* Card 4 */}
        <div className='cursor-pointer duration-300 hover:bg-brand-background rounded-lg h-9 px-4 shadow-[0_0_4px_0_rgba(0,0,0,0.25)] flex justify-between items-center'>
          <span>Upcoming Events</span>
          <span>10</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
