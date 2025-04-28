import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import "quill/dist/quill.snow.css";
import Quill from "quill";
import GoBack from '@/components/GoBack';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { roles } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MessageTemplateLayoutProps {
  handleSubmit: () => void;
  sendBy: "email" | "whatsapp" | "both";
  messageBoxType: "simplex" | "complex";
  message: string;
  sendTo?: "everyone" | "checkedIn" | "nonCheckedIn";
}

const MessageTemplateLayout: React.FC<MessageTemplateLayoutProps> = (props) => {
  const { slug } = useParams<{ slug: string }>();
  const { getEventBySlug } = useEventStore(state => state);
  const event = getEventBySlug(slug);

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const quillRef = useRef<Quill | null>(null);

  // Initialize Quill editor
  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = new Quill('#editor', {
        theme: 'snow',
      });
    }
  }, []);

  // Update allSelected state when selectedRoles changes
  useEffect(() => {
    setAllSelected(selectedRoles.length === roles.length);
  }, [selectedRoles]);

  // Handle role checkbox changes
  const handleRoleChange = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  // Handle select all roles checkbox changes
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
          <div className='flex gap-5 mt-[15px] flex-wrap'>
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

          {/* Send By Options (WhatsApp/Email) */}
          <h2 className='font-semibold mt-[30px]'>Send By</h2>
          <RadioGroup defaultValue="email" className='flex gap-5 mt-[15px]'>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary' />
              <Label htmlFor="email" className='cursor-pointer'>Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="whatsapp" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary' />
              <Label htmlFor="whatsapp" className='cursor-pointer'>Whatsapp</Label>
            </div>
          </RadioGroup>

          {/* Send To Options (All/Checked In/Not Checked In) */}
          <h2 className='font-semibold mt-[30px]'>Send To</h2>
          <RadioGroup defaultValue="everyone" className='flex gap-5 mt-[15px]'>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="everyone" id="everyone" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary' />
              <Label htmlFor="everyone" className='cursor-pointer'>All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="checkedIn" id="checkedIn" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary' />
              <Label htmlFor="checkedIn" className='cursor-pointer'>Checked In</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nonCheckedIn" id="nonCheckedIn" className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary' />
              <Label htmlFor="nonCheckedIn" className='cursor-pointer'>Non-Checked In</Label>
            </div>
          </RadioGroup>

          {/* MessageBox */}
          <div className='mt-[30px]'>
            <Input type='text' className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border focus:border-b-none !rounded-b-none !h-12 font-semibold' placeholder='Subject *' />
            <div id="editor" className='!h-96 border bg-white rounded-[10px] rounded-t-none'></div>
          </div>

          {/* Send Button */}
          <Button className='btn !mt-5' onClick={()=>props.handleSubmit()}>Send</Button>
        </div>

        <div className='min-w-[300px] h-full bg-brand-background rounded-[10px] p-3'>
          <img src={getImageUrl(event?.image)} alt={event?.title} className='rounded-[10px]' />
        </div>
      </div>
    </div >
  )
}

export default MessageTemplateLayout;