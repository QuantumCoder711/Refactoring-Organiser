import React, { useEffect } from 'react';
import GoBack from '@/components/GoBack';
import useVendorStore from '@/store/vendorStore';
import Wave from '@/components/Wave';
import VendorCompanyCard from '@/components/VendorCompanyCard';

const EventSetupPage: React.FC = () => {

  const { eventSetupVendors, loading, getEventSetupVendors } = useVendorStore();

  useEffect(() => {
    getEventSetupVendors();
  }, []);

  if (loading) {
    return <Wave />
  }

  return (
    <div className="h-full w-full">
      <div className='flex items-center gap-5'>
        <GoBack />
        <h1 className="text-2xl font-bold">Event Setup</h1>
      </div>

      <div className="mt-10 flex gap-5">
        {/* Company Card */}
        {eventSetupVendors.map((company, index) => (
          <VendorCompanyCard key={index} company={company} />
        ))}
      </div>
    </div>
  );
};

export default EventSetupPage;
