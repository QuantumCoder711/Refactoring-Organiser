import React, { useState, useEffect, useRef } from 'react';
import Quill from "quill";
import { useParams } from 'react-router-dom';
import "quill/dist/quill.snow.css";
import GoBack from '@/components/GoBack';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { roles } from '@/constants';
import { formatDateTime, formatTemplateMessage, getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageTemplate } from '@/types';
import { toast } from 'sonner';
import { CircleX, CircleCheck } from 'lucide-react';
import { dayTwoReminder, dayTwoSameDayReminder, sendReminder, sendSameDayReminder, sessionReminder, visitBoothReminder } from '@/api/messageTemplates';
import Wave from './Wave';
import useAuthStore from '@/store/authStore';

interface NotifcationsFormProps {
  sendBy: "email" | "whatsapp" | "both";
  message: string | undefined;
  sendTo?: boolean | false;
}

const NotifcationsForm: React.FC<NotifcationsFormProps> = (props) => {
  const { slug } = useParams<{ slug: string }>();
  const { getEventBySlug } = useEventStore(state => state);
  const event = getEventBySlug(slug);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore(state => state);

  const [selectedRoles, setSelectedRoles] = useState<string[]>(roles);
  const [allSelected, setAllSelected] = useState(true); // Initialize as true since all roles are selected by default
  const quillRef = useRef<HTMLDivElement | null>(null);

  console.log("The event is: ", event);

  const [formData, setFormData] = useState<MessageTemplate>({
    event_id: event?.uuid as string,
    send_to: selectedRoles.join(','),
    send_method: props.sendBy === 'both' ? 'email' : props.sendBy,
    subject: '',
    message: props.message || "Template",
    start_date: event?.event_start_date as string,
    delivery_schedule: 'now', // For now
    start_date_time: event?.start_time as string,
    start_date_type: event?.start_time_type as string,
    end_date: event?.event_end_date as string,
    end_date_time: event?.end_time as string,
    end_date_type: event?.end_time_type as string,
    no_of_times: 1,
    hour_interval: 1,
    status: 1,
    check_in: 2,
  });

  // Initialize Quill editor
  useEffect(() => {
    if (quillRef.current && formData.send_method === "email") {
      const quill = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Type your message here...",
      });

      quill.on('text-change', () => {
        setFormData(prev => ({
          ...prev,
          message: quill.root.innerHTML
        }));
      });

      // // Set initial content if message exists
      // if (formData.message) {
      //   quill.root.innerHTML = formData.message;
      // }
    }
  }, [quillRef, formData.send_method === "email", loading]);

  // Update formData when selectedRoles changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      send_to: selectedRoles.join(','),
    }));
  }, [selectedRoles]);

  // Update allSelected when selectedRoles changes
  useEffect(() => {
    setAllSelected(selectedRoles.length === roles.length);
  }, [selectedRoles]);

  const handleRoleChange = (role: string) => {
    setSelectedRoles(prev => {
      let newSelection: string[];

      if (prev.includes(role)) {
        // If trying to unselect
        if (prev.length === 1) {
          // Prevent unselecting the last role
          return prev;
        }
        newSelection = prev.filter(r => r !== role);
      } else {
        newSelection = [...prev, role];
      }

      // Update allSelected based on whether all roles are selected
      setAllSelected(newSelection.length === roles.length);
      return newSelection;
    });
  };

  const handleAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedRoles([...roles]);
      setAllSelected(true);
    } else {
      // When unchecking "All", keep only the first role selected
      setSelectedRoles([roles[0]]);
      setAllSelected(false);
    }
  };

  const handleSendMethodChange = (value: "email" | "whatsapp") => {
    if (value === "email") {
      setFormData(prev => ({
        ...prev,
        send_method: value,
        message: "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        send_method: value,
        message: props.message || "Template",
      }));
    }
  };

  const handleCheckIn = (value: "everyone" | "checkedIn" | "nonCheckedIn") => {
    setFormData(prev => ({
      ...prev,
      check_in: value === "everyone" ? 2 : value === "checkedIn" ? 1 : 0,
    }));
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      subject: e.target.value
    }));
  };

  const handleSubmit = async () => {
    if (formData.send_method === "email" && (!formData.message || !formData.subject)) {
      toast("Please fill in all required fields", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
      return;
    }

    setLoading(true);

    // Get the template name from URL
    const pathname = window.location.pathname;
    const templateName = pathname.split('/')[pathname.split('/').length - 2];
    try {
      let response;
      switch (templateName) {
        case 'send-reminder': {
          response = await sendReminder(formData);
          break;
        }
        case 'send-same-day-reminder':
          response = await sendSameDayReminder(formData);
          break;
        case 'session-reminder':
          response = await sessionReminder(formData);
          break;
        case 'visit-booth-reminder':
          response = await visitBoothReminder(formData);
          break;
        case 'day-two-reminder':
          response = await dayTwoReminder(formData);
          break;
        case 'day-two-same-day-reminder':
          response = await dayTwoSameDayReminder(formData);
          break;
        default:
          throw new Error('Unknown template type');
      }

      if (response.status === 200) {
        toast("Message sent successfully!", {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className='size-5' />
        });
      } else {
        toast(response.message || "Something went wrong!!!", {
          className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className='size-5' />
        });
      }
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to send message", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
    } finally {
      setLoading(false);
      setFormData({
        ...formData,
        subject: "",
      });
    }
  };

  if (loading) return <Wave />

  return (
    <div>
      <div className="flex items-center gap-7">
        <GoBack /> <h1 className='text-xl font-semibold'>{event?.title}</h1>
      </div>
      <div className='mt-8 flex gap-4 h-full'>
        <div className='bg-brand-background rounded-[10px] min-h-full w-full p-5'>

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

          {/* Send By Options */}
          <h2 className='font-semibold mt-[30px]'>Send By</h2>
          <RadioGroup
            value={formData.send_method}
            onValueChange={handleSendMethodChange}
            className='flex gap-5 mt-[15px]'
          >
            {(props.sendBy === "email" || props.sendBy === "both") && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="email"
                  id="email"
                  className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary'
                />
                <Label htmlFor="email" className='cursor-pointer'>Email</Label>
              </div>
            )}
            {(props.sendBy === "whatsapp" || props.sendBy === "both") && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="whatsapp"
                  id="whatsapp"
                  className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary'
                />
                <Label htmlFor="whatsapp" className='cursor-pointer'>Whatsapp</Label>
              </div>
            )}
          </RadioGroup>

          {/* Send To Options */}
          {props.sendTo && (
            <div>
              <h2 className='font-semibold mt-[30px]'>Send To</h2>
              <RadioGroup
                value={formData.check_in == 2 ? "everyone" : formData.check_in == 1 ? "checkedIn" : "nonCheckedIn"}
                onValueChange={handleCheckIn}
                className='flex gap-5 mt-[15px]'
              >
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
            </div>
          )}

          {/* MessageBox */}
          <div className='mt-[30px]'>
            {formData.send_method === "email" ? (
              <>
                <Input
                  type='text'
                  value={formData.subject}
                  onChange={handleSubjectChange}
                  className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border focus:border-b-none !rounded-b-none !h-12 font-semibold'
                  placeholder='Subject *'
                />
                <div>
                  <div ref={quillRef} className={`!h-40 border bg-white rounded-[10px] rounded-t-none`}></div>
                </div>
              </>
            ) : (
              <>
                <h3 className='font-semibold mb-[15px]'>Your Message</h3>
                <div className='p-5 bg-white rounded-[10px]' dangerouslySetInnerHTML={{ __html: formatTemplateMessage(formData.message, event, user) }} />
              </>
            )}
          </div>

          {/* Send Button */}
          <Button className='btn !mt-5' onClick={handleSubmit}>Send</Button>
        </div>

        <div className='min-w-[300px] flex flex-col gap-4 h-full bg-brand-background rounded-[10px] p-3'>
          <img src={getImageUrl(event?.image)} alt={event?.title} className='rounded-[10px]' />
          <h3 className='font-semibold text-nowrap text-ellipsis overflow-hidden text-xl'>{event?.title}</h3>
          <Separator className='bg-white w-full' />
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <h3 className='font-semibold'>Date</h3>
              <p>{formatDateTime(event?.event_date as string)}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <h3 className='font-semibold'>Time</h3>
              <p>{formatDateTime(event?.event_date as string)}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <h3 className='font-semibold'>Location</h3>
              <p className='max-w-[300px]'>{event?.event_venue_address_1}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotifcationsForm;
