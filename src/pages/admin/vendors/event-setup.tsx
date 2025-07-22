import React, { useEffect } from 'react';
import GoBack from '@/components/GoBack';
import useVendorStore from '@/store/vendorStore';
import Wave from '@/components/Wave';
import VendorCompanyCard from '@/components/VendorCompanyCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { VendorCompanyType } from '@/types';

const cityList: string[] = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Surat",
  "Visakhapatnam",
]

const EventSetupPage: React.FC = () => {

  const { eventSetupVendors, loading, getEventSetupVendors } = useVendorStore();
  const [selectedCity, setSelectedCity] = React.useState<string>("");
  const [filteredVendors, setFilteredVendors] = React.useState<VendorCompanyType[]>([]);

  useEffect(() => {
    getEventSetupVendors();
  }, []);

  useEffect(() => {
    if(selectedCity === "all" || selectedCity === "") {
      setFilteredVendors(eventSetupVendors);
    } else {
      const filtered = eventSetupVendors?.filter((vendor) => vendor?.city?.includes(selectedCity?.toLowerCase()));
      setFilteredVendors(filtered);
    }
  }, [selectedCity, eventSetupVendors]);

  if (loading) {
    return <Wave />
  }

  return (
    <div className="h-full w-full">
      <div className='flex items-center gap-5'>
        <GoBack />
        <h1 className="text-2xl font-bold">Event Setup</h1>
      </div>

      <div>
        <div className="mt-10 !mx-auto max-w-fit">
          <Label className='mb-3'>Select City</Label>
          <Select onValueChange={(value) => setSelectedCity(value)} defaultValue="all">
            <SelectTrigger className="input min-w-96 text-base cursor-pointer">
              <SelectValue placeholder="Select City"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all" className="cursor-pointer">
                All
              </SelectItem>
              {cityList.map((city) => (
                <SelectItem key={city} value={city} className="cursor-pointer">
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-10 flex gap-5">
        {/* Company Card */}
        {filteredVendors?.map((company, index) => (
          <VendorCompanyCard key={index} company={company} />
        ))}
      </div>
    </div>
  );
};

export default EventSetupPage;
