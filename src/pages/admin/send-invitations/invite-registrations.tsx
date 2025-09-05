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
import { MessageTemplateType } from '@/types';
import { toast } from 'sonner';
import { CircleX, CircleCheck, Info } from 'lucide-react';
import { inviteRegistrations } from '@/api/messageTemplates';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';

const InviteRegistrations: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { getEventBySlug } = useEventStore(state => state);
    const event = getEventBySlug(slug);
    const [loading, setLoading] = useState(false);

    const { user } = useAuthStore(state => state);

    const [selectedRoles, setSelectedRoles] = useState<string[]>(roles);
    const [allSelected, setAllSelected] = useState(true);
    const quillRef = useRef<HTMLDivElement | null>(null);

    const [formData, setFormData] = useState<MessageTemplateType>({
        event_id: event?.uuid as string,
        send_to: selectedRoles.join(','),
        send_method: 'email',
        subject: `Exclusive Invitation: ${event?.title}- Join Industry Leaders!`,
        message: `<p>
                                    We are delighted to invite you to the ${event?.title}, an exclusive gathering of top thought
                                    leaders and industry experts. This premier event is designed to foster meaningful
                                    discussions, networking, and recognition of excellence in the industry.<br /><br />

                                    📅 Date: ${event?.event_start_date}<br />
                                    📍 Location: ${event?.event_venue_name}<br /><br />

                                    Join us for an evening/day based on timing of the event of insights, connections, and
                                    celebration.<br /><br />

                                    We look forward to your participation!<br /><br />

                                    Best regards,<br />
                                    ${user?.first_name} ${user?.last_name}<br />
                                    ${user?.company_name}
                                </p>`,
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
        check_in: 2,
    });

    const whatsappMessage = `<p>Hello, this is a follow-up reminder for the email sent for <strong>${event?.title}</strong> happening on <strong>${event?.event_start_date}</strong> at <strong>${event?.event_venue_name}</strong>. <br /><br />
    
    Kindly review the same or check the link below for more details on the invitation. <br /><br />
    
    Best Regards, <br />
    ${user?.company_name}</p>`;

    const handleSubmit = async () => {
        if (formData.send_method === "email" && (!formData.message || !formData.subject)) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setLoading(true);

        try {
            const newFormData = { user_id: user?.id, ...formData }
            const response = await inviteRegistrations(newFormData);

            // Check if response exists and has a message property
            if (response.status == 200) {
                toast(response.message || "Message sent successfully!", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                // Default error message if no specific response format
                toast("Something went wrong!!!", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast(error instanceof Error ? error.message : "Failed to send message", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    };

    // Initialize Quill editor
    useEffect(() => {

        if (quillRef.current && formData.send_method === "email") {
            const quill = new Quill(quillRef.current, {
                theme: "snow",
                placeholder: "Type your message here...",
            });

            // Set initial content if message exists
            if (formData.message) {
                quill.clipboard.dangerouslyPasteHTML(formData.message);
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
    }, [quillRef, formData.send_method === "email"]);

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
                message: formData.message,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                send_method: value,
                message: whatsappMessage,
            }));
        }
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            subject: e.target.value
        }));
    };

    if (loading) return <Wave />

    return (
        <div>
            <div className="flex items-center gap-7">
                <GoBack /> <h1 className='text-xl font-semibold'>{event?.title}</h1>
            </div>
            <div className='mt-8 flex gap-4 h-full'>
                <div className='bg-brand-background rounded-[10px] flex-1 w-full p-5 flex flex-col'>
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
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="email"
                                id="email"
                                className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary'
                            />
                            <Label htmlFor="email" className='cursor-pointer'>Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="whatsapp"
                                id="whatsapp"
                                className='cursor-pointer border-brand-dark-gray text-white size-5 data-[state=checked]:bg-brand-primary'
                            />
                            <Label htmlFor="whatsapp" className='cursor-pointer'>Whatsapp</Label>
                        </div>
                    </RadioGroup>

                    <div className='w-full flex-1 flex flex-col'>
                        {/* MessageBox */}
                        <div className='mt-[30px] flex-1 flex flex-col'>
                            {formData.send_method === "email" ? (
                                <>
                                    <Input
                                        type='text'
                                        value={formData.subject}
                                        onChange={handleSubjectChange}
                                        className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border focus:border-b-none !rounded-b-none !h-12 font-semibold'
                                        placeholder='Subject *'
                                    />
                                    <div className='flex-1 flex flex-col'>
                                        <div ref={quillRef} className={`flex-1 border bg-white rounded-[10px] rounded-t-none`}></div>
                                    </div>
                                </>
                            ) : (
                                <div className='flex-1 flex flex-col'>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                                        <Info className="text-blue-600 mt-0.5" size={20} />
                                        <p className="text-blue-700 text-sm">
                                            Please note: You need to send an email invitation first before sending WhatsApp messages. This ensures proper communication flow and tracking.
                                        </p>
                                    </div>
                                    <h3 className='font-semibold mb-[15px]'>Your Message</h3>
                                    <div className='p-5 bg-white rounded-[10px] flex-1' dangerouslySetInnerHTML={{ __html: formatTemplateMessage(whatsappMessage, event, user) }} />
                                </div>
                            )}
                        </div>

                        {/* Send Button */}
                        <Button className='btn !mt-5 w-fit' onClick={handleSubmit}>Send</Button>
                    </div>
                </div>

                <div className='w-[300px] flex flex-col gap-4 min-h-full bg-brand-background rounded-[10px] p-3'>
                    <img src={getImageUrl(event?.image)} alt={event?.title} className='rounded-[10px]' />
                    <h3 className='font-semibold text-nowrap text-ellipsis overflow-hidden text-xl'>{event?.title}</h3>
                    <Separator className='bg-white w-full' />
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
                        </div>
                    </div>
                    {/* Remove setFormData from finally block to prevent clearing the form */}
                </div>
            </div>
        </div>
    );
}

export default InviteRegistrations; 