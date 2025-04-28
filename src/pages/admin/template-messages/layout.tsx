import React, { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import GoBack from '@/components/GoBack';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { roles } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const MessageTemplateLayout: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getEventBySlug } = useEventStore(state => state);
  const event = getEventBySlug(slug);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    setAllSelected(selectedRoles.length === roles.length);
  }, [selectedRoles]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleAllChange = () => {
    if (allSelected) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles([...roles]);
    }
    setAllSelected(!allSelected);
  };

  return (
    <div>
      <div className="flex items-center gap-7">
        <GoBack /> <h1 className='text-xl font-semibold'>{event?.title}</h1>
      </div>
      <div className='mt-8 flex gap-4 h-full'>
        <div className='bg-brand-background rounded-[10px] h-full w-full p-5'>

          {/* SelectBoxes */}
          <h2 className='font-semibold'>Select Roles</h2>
          <div className='flex gap-5 mt-[15px]'>
            <div className="flex items-center gap-x-2.5">
              <Checkbox
                id="all"
                checked={allSelected}
                onCheckedChange={handleAllChange}
                className='border cursor-pointer border-brand-dark-gray shadow-none data-[state=checked]:border-brand-primary size-5 data-[state=checked]:bg-brand-primary data-[state=checked]:text-white'
              />
              <Label htmlFor="all" className='cursor-pointer'>All</Label>
            </div>
            {roles.map((role, index) => (
              <div key={index} className="flex items-center gap-x-2.5">
                {/* <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleChange(role)}
                  className='border appearance-auto accent-brand-primary border-brand-dark-gray shadow-none size-5'
                /> */}
                <Checkbox
                  id={role}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleChange(role)}
                  className='border cursor-pointer border-brand-dark-gray shadow-none data-[state=checked]:border-brand-primary size-5 data-[state=checked]:bg-brand-primary data-[state=checked]:text-white'
                />

                <Label htmlFor={role} className='cursor-pointer'>{role}</Label>
              </div>
            ))}
          </div>

          <h2 className='font-semibold mt-[30px]'>Send By</h2>
          <RadioGroup defaultValue="email" className='flex gap-5 mt-[15px]'>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary'/>
              <Label htmlFor="email" className='cursor-pointer'>Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem  value="whatsapp" id="whatsapp" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary' />
              <Label htmlFor="whatsapp" className='cursor-pointer'>Whatsapp</Label>
            </div>
          </RadioGroup>
        </div>

        <div className='min-w-[300px] h-full bg-brand-background rounded-[10px] p-3'>
          <img src={getImageUrl(event?.image)} alt={event?.title} className='rounded-[10px]' />
        </div>
      </div>
    </div >
  )
}

export default MessageTemplateLayout;