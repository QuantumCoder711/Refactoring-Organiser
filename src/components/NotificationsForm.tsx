import React, { useState, useEffect, useRef } from 'react';
import Quill from "quill";
import { Link, useParams } from 'react-router-dom';
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
import { MessageTemplateType, SendPollType } from '@/types';
import { toast } from 'sonner';
import { CircleX, CircleCheck, ChevronRight, Send } from 'lucide-react';
import { dayTwoReminder, dayTwoSameDayReminder, sendInAppMessage, sendPoll, sendReminder, sendSameDayReminder, sessionReminder, thankYouMessage, visitBoothReminder } from '@/api/messageTemplates';
import Wave from './Wave';
import useAuthStore from '@/store/authStore';
import Logo from '@/assets/logo.svg';

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
  const [allSelected, setAllSelected] = useState(true);
  const quillRef = useRef<HTMLDivElement | null>(null);
  const [pollLink, setPollLink] = useState("");

  // Get the template name from URL
  const pathname = window.location.pathname;
  const templateName = pathname.split('/')[pathname.split('/').length - 2];
  const isPollTemplate = templateName === 'send-poll';
  const isThankYouTemplate = templateName === 'thank-you-message';
  const isInAppTemplate = templateName === 'send-in-app-message';

  const [formData, setFormData] = useState<MessageTemplateType>({
    event_id: event?.uuid as string,
    send_to: selectedRoles.join(','),
    send_method: isThankYouTemplate ? 'whatsapp' : (props.sendBy === 'both' ? 'email' : props.sendBy),
    subject: '',
    message: formatTemplateMessage(props.message || "", event, user) || "Template",
    start_date: event?.event_start_date as string,
    delivery_schedule: 'now',
    start_date_time: event?.start_time as string,
    start_date_type: event?.start_time_type as string,
    end_date: event?.event_end_date as string,
    end_date_time: event?.end_time as string,
    end_date_type: event?.end_time_type as string,
    no_of_times: 1,
    hour_interval: 1,
    status: 1,
    check_in: isThankYouTemplate ? 1 : 2,
  });

  // Initialize Quill editor
  useEffect(() => {
    if (quillRef.current && (formData.send_method === "email" || isInAppTemplate)) {
      const quill = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Type your message here...",
      });

      // Set initial content if message exists
      if (props.message) {
        quill.clipboard.dangerouslyPasteHTML(formatTemplateMessage(props.message, event, user));
        setFormData(prev => ({
          ...prev,
          message: formatTemplateMessage(props.message || "", event, user)
        }));
      }

      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
        setFormData(prev => ({
          ...prev,
          message: content
        }));
      });

      return () => {
        quill.off('text-change');
      };
    }
  }, [quillRef, formData.send_method === "email" || isInAppTemplate, props.message]);

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

    if (isPollTemplate && !pollLink) {
      toast("Please enter the poll link", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
      return;
    }

    if (isInAppTemplate && (!formData.message || !formData.subject)) {
      toast("Please fill in all required fields", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
      return;
    }

    setLoading(true);

    try {
      let response;
      const newFormData = { user_id: user?.id, ...formData }
      switch (templateName) {
        case 'send-reminder': {
          response = await sendReminder(newFormData);
          break;
        }
        case 'send-same-day-reminder':
          response = await sendSameDayReminder(newFormData);
          break;
        case 'session-reminder':
          response = await sessionReminder(newFormData);
          break;
        case 'visit-booth-reminder':
          response = await visitBoothReminder(newFormData);
          break;
        case 'day-two-reminder':
          response = await dayTwoReminder(newFormData);
          break;
        case 'day-two-same-day-reminder':
          response = await dayTwoSameDayReminder(newFormData);
          break;
        case 'send-poll':
          response = await sendPoll({ ...newFormData, link: pollLink } as SendPollType);
          break;
        case 'thank-you-message':
          response = await thankYouMessage(newFormData);
          break;
        case 'send-in-app-message':
          if (!event?.id) {
            throw new Error("Event ID is required");
          }
          // For in-app messages, only send event_id, title, and message
          const inAppData = {
            event_id: event.id.toString(),
            title: newFormData.subject,
            message: newFormData.message
          };
          response = await sendInAppMessage(inAppData);
          break;
        default:
          throw new Error('Unknown template type');
      }

      console.log('API Response:', response); // Debug log

      // Check if response exists and has a message property
      if (response.status === 200) {
        toast("Message sent successfully!", {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className='size-5' />
        });
      } else if (response && response.message) {
        // If there's a message in the response, show it
        toast(response.message, {
          className: response.message === "Messages sent successfully" ? "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2" : "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: response.message === "Messages sent successfully" ? <CircleCheck className='size-5' /> : <CircleX className='size-5' />
        });
      } else {
        // Default error message if no specific response format
        toast("Something went wrong!!!", {
          className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className='size-5' />
        });
      }
    } catch (error) {
      console.error('Error:', error); // Debug log
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
      if (isPollTemplate) {
        setPollLink("");
      }
    }
  };

  if (loading) return <Wave />

  return (
    <div>
      <div className="flex items-center gap-7">
        <GoBack /> <h1 className='text-xl font-semibold'>{event?.title}</h1>
      </div>
      <div className='mt-8 flex gap-4 h-full'>
        <div className='bg-muted rounded-[10px] flex-1 w-full p-5 flex flex-col'>
          {/* SelectBoxes - Only show if not in-app message */}
          {!isInAppTemplate && (
            <>
              <h2 className='font-semibold'>Select Roles</h2>
              <div className='flex gap-5 mt-[15px] flex-wrap'>
                <div className="flex items-center gap-x-2.5">
                  <Checkbox
                    id="all"
                    checked={allSelected}
                    onCheckedChange={handleAllChange}
                    className='size-5'
                  />
                  <Label htmlFor="all" className='cursor-pointer'>All</Label>
                </div>
                {roles.map((role, index) => (
                  <div key={index} className="flex items-center gap-x-2.5">
                    <Checkbox
                      id={role}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleChange(role)}
                      className='size-5'
                    />
                    <Label htmlFor={role} className='cursor-pointer'>{role}</Label>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Send By Options */}
          {!isThankYouTemplate && !isInAppTemplate && (
            <>
              <h2 className='font-semibold mt-[30px]'>Send By</h2>
              <RadioGroup
                value={formData.send_method}
                onValueChange={handleSendMethodChange}
                className='flex gap-5 mt-[15px]'
              >
                {(props.sendBy === "email" || props.sendBy === "both") && !isPollTemplate && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="email"
                      id="email"
                    />
                    <Label htmlFor="email" className='cursor-pointer'>Email</Label>
                  </div>
                )}
                {(props.sendBy === "whatsapp" || props.sendBy === "both") && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="whatsapp"
                      id="whatsapp"
                    />
                    <Label htmlFor="whatsapp" className='cursor-pointer'>Whatsapp</Label>
                  </div>
                )}
              </RadioGroup>
            </>
          )}

          {/* Send By for In-App Message */}
          {isInAppTemplate && (
            <>
              <h2 className='font-semibold mt-[30px]'>Send By</h2>
              <RadioGroup
                value="app"
                className='flex gap-5 mt-[15px]'
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="app"
                    id="app"
                  />
                  <Label htmlFor="app" className='cursor-pointer flex items-center gap-2'>
                    App
                    <div className='h-6'>
                      <img src={Logo} alt="App Logo" className="object-contain w-full h-full" />
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </>
          )}

          <div className='w-full flex-1 flex flex-col'>
            {/* Send To Options */}
            {props.sendTo && (
              <div>
                <h2 className='font-semibold mt-[30px]'>Send To</h2>
                <RadioGroup
                  value={formData.check_in == 2 ? "everyone" : formData.check_in == 1 ? "checkedIn" : "nonCheckedIn"}
                  onValueChange={handleCheckIn}
                  className='flex gap-5 mt-[15px]'
                >
                  {!isThankYouTemplate && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="everyone" id="everyone" />
                      <Label htmlFor="everyone" className='cursor-pointer'>All</Label>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checkedIn" id="checkedIn" />
                    <Label htmlFor="checkedIn" className='cursor-pointer'>Checked In</Label>
                  </div>
                  {!isThankYouTemplate && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nonCheckedIn" id="nonCheckedIn" />
                      <Label htmlFor="nonCheckedIn" className='cursor-pointer'>Non-Checked In</Label>
                    </div>
                  )}
                </RadioGroup>
              </div>
            )}

            {/* MessageBox */}
            <div className='mt-[30px] flex-1 flex flex-col'>
              {(formData.send_method === "email" || isInAppTemplate) ? (
                <>
                  <Input
                    type='text'
                    value={formData.subject}
                    onChange={handleSubjectChange}
                    className='w-full rounded-[10px] text-base focus-visible:ring-0 border focus:border-b-none !rounded-b-none !h-12 font-semibold'
                    placeholder='Subject *'
                  />
                  <div className='flex-1 flex flex-col'>
                    <div ref={quillRef} className={`flex-1 border bg-background/50 rounded-[10px] rounded-t-none`}></div>
                  </div>
                </>
              ) : (
                <div className='flex-1 flex flex-col'>
                  {isPollTemplate && (
                    <div className='mb-4'>
                      <Input
                        type='text'
                        value={pollLink}
                        onChange={(e) => setPollLink(e.target.value)}
                        className='w-full bg-background/50 rounded-[10px] text-base focus-visible:ring-0 border !h-12 font-semibold'
                        placeholder='Poll Link *'
                      />
                    </div>
                  )}
                  <h3 className='font-semibold mb-[15px] flex items-center gap-2'>
                    {isInAppTemplate && (
                      <>
                        Your Message
                      </>
                    )}
                    {!isInAppTemplate && "Your Message"}
                  </h3>
                  <div className='p-5 bg-background/50 rounded-[10px] flex-1' dangerouslySetInnerHTML={{ __html: formatTemplateMessage(formData.message, event, user) }} />
                </div>
              )}
            </div>

            {/* Send Button */}
            <div className='flex justify-end'>
              <Button className='mt-5 w-20' onClick={handleSubmit}>Send <Send className='size-4'/></Button>
            </div>
          </div>
        </div>

        <div className='w-[300px] flex flex-col gap-4 min-h-full bg-muted rounded-[10px] p-3'>
          <img src={getImageUrl(event?.image)} alt={event?.title} className='rounded-[10px]' />
          <h3 className='font-semibold text-nowrap text-ellipsis overflow-hidden text-xl'>{event?.title}</h3>
          <Separator className='bg-accent w-full' />
          <div className='flex flex-col flex-1 gap-4'>
            <div className='flex flex-col gap-2'>
              <h3 className='font-semibold'>Date</h3>
              <p>{formatDateTime(event?.event_date as string)}</p>
            </div>
            <div className='flex flex-col gap-2'>
              <h3 className='font-semibold'>Time</h3>
              <p>{event?.start_time}:{event?.start_minute_time} {event?.start_time_type} - {event?.end_time}:{event?.end_minute_time} {event?.end_time_type}</p>
            </div>

            <div className='flex flex-1 flex-col justify-between'>
              <div className='flex flex-col flex-1 gap-2'>
                <h3 className='font-semibold'>Location</h3>
                <p className='max-w-[300px]'>{event?.event_venue_address_1}</p>
              </div>

              <Link to={`/all-events/view/${slug}`} className='w-fit mx-auto mt-4 mb-2'>
                <Button className='btn !w-[200px]'>View Event Details <ChevronRight height={10} width={5} /></Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotifcationsForm;
