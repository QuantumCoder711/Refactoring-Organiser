import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GoBack from '@/components/GoBack';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { domain, roles, token } from '@/constants';
import { formatDateTime, formatTemplateMessage, getImageUrl } from '@/lib/utils';
import useEventStore from '@/store/eventStore';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { MessageTemplateType } from '@/types';
import { toast } from 'sonner';
import { CircleX, CircleCheck, Info, Upload } from 'lucide-react';
import { inviteRegistrations } from '@/api/messageTemplates';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';
import axios from 'axios';

const getBannerImage = async (id: number) => {
    const response = await axios.get(`${domain}/api/get-email-banner/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    });

    // Response:
    // {
    // "success": true,
    // "message": "Email template fetched successfully",
    // "data": {
    //     "id": 1,
    //     "uuid": "9baf267b-24a2-438c-9544-21338dbdd900",
    //     "user_id": 10,
    //     "event_id": 20,
    //     "email_banner": "uploads/EmailBanner/1758002941.jfif"
    // }
    return response.data;
}

const uploadBannerImage = async (email_banner: File, user_id: number, event_id: number) => {
    const response = await axios.post(`${domain}/api/upload-email-banner`, {
        email_banner,
        user_id,
        event_id
    }, {
        headers: {
            'Content-Type': 'multipart/form-data',
            "Authorization": `Bearer ${token}`
        }
    });

    // Response:
    // {
    //     "success": true,
    //         "message": "Email template created successfully",
    //             "data": {
    //         "user_id": "11",
    //             "event_id": "20",
    //                 "email_banner": "uploads/EmailBanner/1758004192.jpg",
    //                     "uuid": "7af27acf-3dc3-4131-a925-90bb8b8ec5de",
    //                         "id": 2
    //     }
    // }
    return response.data;
}

const generateEmailTemplate = async (company_name: string, event_name: string, date_time: string, location?: string, event_mode?: 0 | 1, webinar_link?: string) => {

    const formData = {
        company_name,
        event_name,
        date_time,
        ...(event_mode === 0 ? { location } : { webinar_link }),
        event_mode
    }

    const response = await axios.post(`${domain}/api/generate-email-template`, formData, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });


    // response:
    // {
    //     "success": true,
    //         "email_templates": [
    //             {
    //                 "template_1": "Subject: You're Invited! Join Us for an Exclusive DevOps Meetup\n\n---\n\nDear [Recipient's Name],\n\nI hope this message finds you well. We are thrilled to extend a special invitation for you to join us at an exciting upcoming event hosted by Klout Club.\n\n🌟 **DevOps Meetup: Unleashing the Future of Technology** 🌟\n\nThis event promises to be an exceptional opportunity to connect with like-minded industry professionals, gain valuable insights into the latest DevOps trends, and explore innovative strategies to enhance your professional journey. Whether you're looking to deepen your knowledge or expand your network, this meetup is designed to provide immense value.\n\n**Event Details:**\n\n📌 **Event:** DevOps Meetup  \n📅 **Date:** 20th September 2025  \n🕛 **Time:** 12:00 PM  \n📍 **Location:** Cyber Hub, Gurgaon (In-Person Event)  \n\n🔗 **[View Details](#)**  \n🔗 **[Confirm Your Attendance](#)**\n\nJoin us for an enriching experience filled with engaging discussions, expert speakers, and the chance to connect with fellow professionals in the field. Your presence would undoubtedly enrich the event, and we are eager to welcome you to our community.\n\nPlease feel free to reach out if you have any questions or need further information. We look forward to seeing you there!\n\nWarm regards,\n\nThe Klout Club Team\n\n---  \n**Klout Club**  \n[Your Contact Information]  \n[Your Website URL]  \n\n---\n\nThank you for considering our invitation. We are excited about the possibility of your participation and hope to meet you soon at the DevOps Meetup!"
    //             },
    //             {
    //                 "template_2": "Subject: You're Invited to the DevOps Meetup at Klout Club!\n\n---\n\nDear [Recipient's Name],\n\nWe hope this message finds you well!\n\nAt Klout Club, we are thrilled to extend an exclusive invitation to our upcoming **DevOps Meetup**—a fantastic opportunity to connect, learn, and share insights with industry peers and experts.\n\n---\n\n**🔍 About the Event:**\n\nJoin us for a dynamic session where you can dive into the latest trends in DevOps, explore innovative solutions, and enhance your professional network. Our lineup of experienced speakers and interactive workshops are designed to provide valuable insights and practical takeaways.\n\n---\n\n**📌 Event Details:**\n\n- **Event:** DevOps Meetup  \n- **📅 Date:** September 20, 2025  \n- **🕒 Time:** 12:00 PM  \n- **📍 Location:** Cyber Hub, Gurgaon (In-Person Event)\n\n---\n\nWe believe your participation would greatly enrich the discussions and collaborations taking place at the event.\n\n**👉 [View Details](#)**  \n**👉 [Confirm Your Attendance](#)**\n\n---\n\nWe look forward to welcoming you to the DevOps Meetup and are excited about the opportunity to connect with you in person. Should you have any questions, please feel free to reach out.\n\nWarm regards,\n\nThe Klout Club Team\n\n---\n\nThank you for considering this opportunity to engage with fellow professionals and leaders in the DevOps community."
    //             },
    //             {
    //                 "template_3": "Subject: You're Invited to Our Exciting DevOps Meetup!\n\n---\n\nHello [Recipient's Name],\n\nWe hope this message finds you well!\n\nWe are thrilled to invite you to an exclusive gathering hosted by Klout Club, designed for industry professionals like yourself who are passionate about the transformative world of DevOps. This is an excellent opportunity to connect with fellow experts, share insights, and gain valuable knowledge that could propel your career and organizational success.\n\n---\n\n📌 **Event**: DevOps Meetup  \n📅 **Date**: 20/09/2025  \n⏰ **Time**: 12:00 PM  \n📍 **Location**: Cyber Hub, Gurgaon (In-Person Event)\n\n---\n\nAt this meetup, you'll have the chance to engage with thought leaders, participate in dynamic discussions, and explore the latest trends in DevOps strategies and technologies.\n\nWe would be delighted to have you join us. Please confirm your attendance and learn more about the event by clicking the links below:\n\n[View Details](#) | [Confirm](#)\n\nFeel free to reach out if you have any questions. We look forward to an insightful and engaging experience with you at the meetup!\n\nWarm regards,\n\nThe Klout Club Team\n\n--- \n\nNote: Please RSVP by [RSVP Deadline Date] to secure your spot, as seats are limited.\n\n---\n\nThank you for considering our invitation, and we hope to see you there!"
    //             }
    //         ]
    // }

    return response.data;
}

const InviteRegistrations: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { getEventBySlug } = useEventStore(state => state);
    const event = getEventBySlug(slug);
    const [loading, setLoading] = useState(false);

    const { user } = useAuthStore(state => state);

    const [selectedRoles, setSelectedRoles] = useState<string[]>(roles);
    const [allSelected, setAllSelected] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<string>("template1");
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [uploadedBannerUrl, setUploadedBannerUrl] = useState<string | null>(null);
    const [bannerError, setBannerError] = useState<string>('');

    // Helper to scope stored banner id per event
    const getBannerIdKey = (eventId?: number) => eventId ? `emailBannerId_${eventId}` : 'emailBannerId';

    // Email template definitions
    const emailTemplates = {
        template1: {
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
                                </p>`
        },
        template2: {
            subject: `You're Invited: ${event?.title} - Premium Networking Event`,
            message: `<p>
                                    <strong>Dear Industry Leader,</strong><br /><br />

                                    It is our pleasure to extend a personal invitation to you for <strong>${event?.title}</strong>,
                                    a distinguished gathering that brings together visionary leaders and innovators from across industries.<br /><br />

                                    <strong>Event Details:</strong><br />
                                    🗓️ <strong>Date:</strong> ${event?.event_start_date}<br />
                                    🏢 <strong>Venue:</strong> ${event?.event_venue_name}<br />
                                    ⏰ <strong>Time:</strong> ${event?.start_time}:${event?.start_minute_time} ${event?.start_time_type}<br /><br />

                                    This exclusive event offers unparalleled opportunities for strategic networking,
                                    knowledge sharing, and collaborative discussions that drive industry advancement.<br /><br />

                                    Your expertise and insights would be invaluable to our community of leaders.<br /><br />

                                    Warm regards,<br />
                                    <strong>${user?.first_name} ${user?.last_name}</strong><br />
                                    ${user?.company_name}
                                </p>`
        },
        template3: {
            subject: `Special Invitation: ${event?.title} - Connect, Learn, Lead`,
            message: `<p>
                                    Greetings!<br /><br />

                                    We cordially invite you to join us at <strong>${event?.title}</strong>, where industry excellence meets innovation.<br /><br />

                                    <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
                                        <strong>📋 Event Information</strong><br />
                                        <strong>Event:</strong> ${event?.title}<br />
                                        <strong>Date:</strong> ${event?.event_start_date}<br />
                                        <strong>Location:</strong> ${event?.event_venue_name}<br />
                                        <strong>Duration:</strong> ${event?.start_time}:${event?.start_minute_time} ${event?.start_time_type} - ${event?.end_time}:${event?.end_minute_time} ${event?.end_time_type}
                                    </div>

                                    This premier gathering is designed for forward-thinking professionals who are shaping the future of their industries.
                                    Experience meaningful connections, gain valuable insights, and be part of conversations that matter.<br /><br />

                                    We would be honored by your presence at this exceptional event.<br /><br />

                                    Best wishes,<br />
                                    ${user?.first_name} ${user?.last_name}<br />
                                    <em>${user?.company_name}</em>
                                </p>`
        }
    };

    const [formData, setFormData] = useState<MessageTemplateType>({
        event_id: event?.uuid as string,
        send_to: selectedRoles.join(','),
        send_method: 'email',
        subject: emailTemplates.template1.subject,
        message: '',
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
        template_banner: null,
    });

    const whatsappMessage = `<p>Hello, this is a follow-up reminder for the email sent for <strong>${event?.title}</strong> happening on <strong>${event?.event_start_date}</strong> at <strong>${event?.event_venue_name}</strong>. <br /><br />

    Kindly review the same or check the link below for more details on the invitation. <br /><br />

    Best Regards, <br />
    ${user?.company_name}</p>`;

    const handleSubmit = async () => {
        // Validate required fields
        if (formData.send_method === "email" && (!formData.message || !formData.subject)) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Update formData with banner image before sending
        const updatedFormData = {
            ...formData,
            template_banner: uploadedBannerUrl,
            user_id: user?.id as Number
        };

        console.log("the template banner is: ", updatedFormData)

        // Validate banner image is required
        // if (!formData.template_banner) {
        //     setBannerError("Template banner image is required");
        //     toast("Template banner image is required", {
        //         className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        //         icon: <CircleX className='size-5' />
        //     });
        //     return;
        // }

        setBannerError('');
        setLoading(true);

        try {

            const response = await inviteRegistrations(updatedFormData);

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

    // Template selection handler
    const handleTemplateChange = (templateKey: string) => {
        setSelectedTemplate(templateKey);
        const template = emailTemplates[templateKey as keyof typeof emailTemplates];
        setFormData(prev => ({
            ...prev,
            subject: template.subject,
            message: stripHtmlTags(template.message)
        }));
    };



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

    // Initialize message content with stripped HTML
    useEffect(() => {
        if (formData.message === '') {
            setFormData(prev => ({
                ...prev,
                message: stripHtmlTags(emailTemplates.template1.message)
            }));
        }
    }, []);

    // Fetch uploaded banner on mount using stored banner id
    useEffect(() => {
        if (!event?.id) return;
        const key = getBannerIdKey(event.id);
        const storedId = localStorage.getItem(key);
        if (!storedId) return;

        const bannerId = Number(storedId);
        if (Number.isNaN(bannerId)) return;

        setLoading(true);
        getBannerImage(bannerId)
            .then((res) => {
                if (res?.success && res?.data?.email_banner) {
                    setUploadedBannerUrl(getImageUrl(res.data.email_banner));
                } else {
                    toast(res?.message || 'Failed to fetch banner image', {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleX className='size-5' />
                    });
                }
            })
            .catch((err: any) => {
                toast(err?.response?.data?.message || err?.message || 'Failed to fetch banner image', {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            })
            .finally(() => setLoading(false));
    }, [event?.id]);

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

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            message: e.target.value
        }));
    };

    // Helper function to strip HTML tags from text
    const stripHtmlTags = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setBannerError('Please select a valid image file');
            toast('Please select a valid image file', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setBannerError('File size must be less than 10MB');
            toast('File size must be less than 10MB', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setBannerImage(file);
        setBannerError('');

        // Immediately upload the image
        try {
            setLoading(true);
            const user_id = user?.id as number;
            const event_id = event?.id as number;

            const res = await uploadBannerImage(file, user_id, event_id);

            if (res?.success && res?.data) {
                const idToStore = res.data.id;
                if (idToStore) {
                    localStorage.setItem(getBannerIdKey(event_id), String(idToStore));
                }
                if (res.data.email_banner) {
                    setUploadedBannerUrl(getImageUrl(res.data.email_banner));
                }
                toast(res.message || 'Banner uploaded successfully', {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(res?.message || 'Failed to upload banner image', {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (err: any) {
            toast(err?.response?.data?.message || err?.message || 'Failed to upload banner image', {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    };

    const triggerFileUpload = () => {
        const fileInput = document.getElementById('banner-upload') as HTMLInputElement;
        fileInput?.click();
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
                                <div className='flex-1 flex flex-col'>
                                    {/* Commented out subject input as requested */}
                                    {/* <Input
                                        type='text'
                                        value={formData.subject}
                                        onChange={handleSubjectChange}
                                        className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border focus:border-b-none !rounded-b-none !h-12 font-semibold'
                                        placeholder='Subject *'
                                    /> */}

                                    {/* Subject Input - Commented out as requested */}
                                    {/* <div className='mb-4'>
                                        <Label className="font-semibold mb-2 block">Subject</Label>
                                        <Input
                                            type='text'
                                            value={formData.subject}
                                            onChange={handleSubjectChange}
                                            className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border !h-12'
                                            placeholder='Enter email subject'
                                        />
                                    </div> */}

                                    {/* Email Template Tabs */}
                                    <Tabs value={selectedTemplate} onValueChange={handleTemplateChange} className="flex-1 flex flex-col">
                                        <TabsList className="bg-white p-0 w-fit mx-auto mt-4 mb-2 !max-h-9">
                                            <TabsTrigger
                                                value="template1"
                                                className="max-h-9 px-4 h-full font-medium text-sm !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                                            >
                                                Template 1
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="template2"
                                                className="max-h-9 px-4 h-full font-medium text-sm !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                                            >
                                                Template 2
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="template3"
                                                className="max-h-9 px-4 h-full font-medium text-sm !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                                            >
                                                Template 3
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="template1" className="flex-1 flex flex-col mt-0">
                                            <div className='flex-1 flex justify-center'>
                                                <div className='w-full max-w-2xl bg-gray-50 rounded-[10px] p-6 border'>
                                                    <h4 className='font-semibold mb-4 text-lg text-gray-700'>Template 1 Preview</h4>
                                                    <div className='bg-white rounded-lg p-6 border text-sm'>
                                                        <div className='mb-4 pb-3 border-b'>
                                                            <Label className="font-semibold mb-2 block">Subject</Label>
                                                            <Input
                                                                type='text'
                                                                value={formData.subject}
                                                                onChange={handleSubjectChange}
                                                                className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border !h-10'
                                                                placeholder='Enter email subject'
                                                            />
                                                        </div>
                                                        <div className='mb-4 flex justify-center'>
                                                            <div
                                                                onClick={triggerFileUpload}
                                                                className='w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400 hover:border-gray-500'
                                                                style={{ aspectRatio: '16/9' }}
                                                            >
                                                                {uploadedBannerUrl ? (
                                                                    <img
                                                                        src={uploadedBannerUrl}
                                                                        alt="Template Banner"
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                ) : bannerImage ? (
                                                                    <img
                                                                        src={URL.createObjectURL(bannerImage)}
                                                                        alt="Template Banner"
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                ) : (
                                                                    <div className='text-center'>
                                                                        <Upload className='mx-auto mb-2' size={32} />
                                                                        <p>Click to upload banner image</p>
                                                                        <p className='text-xs text-gray-400 mt-1'>Recommended: 16:9 aspect ratio</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='mb-4'>
                                                            <Label className="font-semibold mb-2 block">Message Content</Label>
                                                            <Textarea
                                                                value={formData.message}
                                                                onChange={handleMessageChange}
                                                                className='w-full min-h-[200px] bg-white rounded-[10px] text-base focus-visible:ring-0 border'
                                                                placeholder='Enter email message content'
                                                            />
                                                        </div>
                                                        {bannerError && (
                                                            <p className="text-red-500 text-sm mb-4">{bannerError}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="template2" className="flex-1 flex flex-col mt-0">
                                            <div className='flex-1 flex justify-center'>
                                                <div className='w-full max-w-2xl bg-gray-50 rounded-[10px] p-6 border'>
                                                    <h4 className='font-semibold mb-4 text-lg text-gray-700'>Template 2 Preview</h4>
                                                    <div className='bg-white rounded-lg p-6 border text-sm'>
                                                        <div className='mb-4 pb-3 border-b'>
                                                            <Label className="font-semibold mb-2 block">Subject</Label>
                                                            <Input
                                                                type='text'
                                                                value={formData.subject}
                                                                onChange={handleSubjectChange}
                                                                className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border !h-10'
                                                                placeholder='Enter email subject'
                                                            />
                                                        </div>
                                                        <div className='mb-4 flex justify-center'>
                                                            <div
                                                                onClick={triggerFileUpload}
                                                                className='w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400 hover:border-gray-500'
                                                                style={{ aspectRatio: '16/9' }}
                                                            >
                                                                {uploadedBannerUrl ? (
                                                                    <img
                                                                        src={uploadedBannerUrl}
                                                                        alt="Template Banner"
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                ) : bannerImage ? (
                                                                    <img
                                                                        src={URL.createObjectURL(bannerImage)}
                                                                        alt="Template Banner"
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                ) : (
                                                                    <div className='text-center'>
                                                                        <Upload className='mx-auto mb-2' size={32} />
                                                                        <p>Click to upload banner image</p>
                                                                        <p className='text-xs text-gray-400 mt-1'>Recommended: 16:9 aspect ratio</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='mb-4'>
                                                            <Label className="font-semibold mb-2 block">Message Content</Label>
                                                            <Textarea
                                                                value={formData.message}
                                                                onChange={handleMessageChange}
                                                                className='w-full min-h-[200px] bg-white rounded-[10px] text-base focus-visible:ring-0 border'
                                                                placeholder='Enter email message content'
                                                            />
                                                        </div>
                                                        {bannerError && (
                                                            <p className="text-red-500 text-sm mb-4">{bannerError}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="template3" className="flex-1 flex flex-col mt-0">
                                            <div className='flex-1 flex justify-center'>
                                                <div className='w-full max-w-2xl bg-gray-50 rounded-[10px] p-6 border'>
                                                    <h4 className='font-semibold mb-4 text-lg text-gray-700'>Template 3 Preview</h4>
                                                    <div className='bg-white rounded-lg p-6 border text-sm'>
                                                        <div className='mb-4 pb-3 border-b'>
                                                            <Label className="font-semibold mb-2 block">Subject</Label>
                                                            <Input
                                                                type='text'
                                                                value={formData.subject}
                                                                onChange={handleSubjectChange}
                                                                className='w-full bg-white rounded-[10px] text-base focus-visible:ring-0 border !h-10'
                                                                placeholder='Enter email subject'
                                                            />
                                                        </div>
                                                        <div className='mb-4 flex justify-center'>
                                                            <div
                                                                onClick={triggerFileUpload}
                                                                className='w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400 hover:border-gray-500'
                                                                style={{ aspectRatio: '16/9' }}
                                                            >
                                                                {uploadedBannerUrl ? (
                                                                    <img
                                                                        src={uploadedBannerUrl}
                                                                        alt="Template Banner"
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                ) : bannerImage ? (
                                                                    <img
                                                                        src={URL.createObjectURL(bannerImage)}
                                                                        alt="Template Banner"
                                                                        className='w-full h-full object-cover rounded-lg'
                                                                    />
                                                                ) : (
                                                                    <div className='text-center'>
                                                                        <Upload className='mx-auto mb-2' size={32} />
                                                                        <p>Click to upload banner image</p>
                                                                        <p className='text-xs text-gray-400 mt-1'>Recommended: 16:9 aspect ratio</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='mb-4'>
                                                            <Label className="font-semibold mb-2 block">Message Content</Label>
                                                            <Textarea
                                                                value={formData.message}
                                                                onChange={handleMessageChange}
                                                                className='w-full min-h-[200px] bg-white rounded-[10px] text-base focus-visible:ring-0 border'
                                                                placeholder='Enter email message content'
                                                            />
                                                        </div>
                                                        {bannerError && (
                                                            <p className="text-red-500 text-sm mb-4">{bannerError}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    {/* Hidden file input for banner upload */}
                                    <Input
                                        id="banner-upload"
                                        type='file'
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        className='hidden'
                                    />
                                </div>
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
