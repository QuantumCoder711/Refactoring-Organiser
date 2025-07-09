import React, { useEffect } from 'react';
import GoBack from '@/components/GoBack';
import useVendorStore from '@/store/vendorStore';
import Wave from '@/components/Wave';
import VendorCompanyCard from '@/components/VendorCompanyCard';

const AudienceAcquisitionPage: React.FC = () => {

  const { acquisitionVendors, loading, getAcquisitionVendors } = useVendorStore();

  useEffect(() => {
    getAcquisitionVendors();
  }, []);

  if (loading) {
    return <Wave />
  }

  return (
    <div className="h-full w-full">
      <div className='flex items-center gap-5'>
        <GoBack />
        <h1 className="text-2xl font-bold">Audience Acquisition</h1>
      </div>

      <div className="mt-10 flex gap-5">
        {/* Company Card */}
        {acquisitionVendors.map((company, index) => (
          <VendorCompanyCard key={index} company={company} />
        ))}
      </div>
    </div>
  );
};

export default AudienceAcquisitionPage;
