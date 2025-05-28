import { appDomain, domain } from '@/constants';
import { EventType } from '@/types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const CheckinPage: React.FC = () => {
    const location = useLocation();
    const params: URLSearchParams = new URLSearchParams(location.search);
    const eventUUID: string | null = params.get("eventuuid");
    const [loading, setLoading] = useState<boolean>(false);
    const [steps, setSteps] = useState<number>(1);
    const [event, setEvent] = useState<EventType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        designation: '',
        company: '',
        otp: '',
        eventName: event?.title || ''
    });

    useEffect(() => {
        axios.get(`${domain}/api/events/${eventUUID}`).then(res => {
            if (res.data.status === 200) {
                setEvent(res.data.data);
                setFormData(prev => ({
                    ...prev,
                    eventName: res.data.data.title
                }));
            }
        });
    }, [eventUUID]);


    const sendOTP = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                `${appDomain}/api/organiser/v1/event-checkin/send-otp`,
                { mobileNumber: Number(formData.mobile) },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status) {
                setSteps(2);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
        } finally {
            setLoading(false);
        }
    }

    const verifyOTP = async () => {
        if (!formData.otp || formData.otp.length !== 6) {
            toast("Please enter a valid 6-digit OTP", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${appDomain}/api/organiser/v1/event-checkin/verify-otp`,
                {
                    mobileNumber: Number(formData.mobile),
                    otp: formData.otp,
                    eventOtp: event?.event_otp
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status) {
                toast(response.data.message || "OTP verified successfully!", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });

                // Check for existing user
                const userResponse = await axios.post(
                    `${appDomain}/api/organiser/v1/event-checkin/existing-user`,
                    {
                        mobile: Number(formData.mobile),
                        eventID: event?.id,
                        userID: event?.user_id
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (userResponse.data.data.length > 0) {
                    setSteps(3);
                    const userData = userResponse.data.data[0];
                    setFormData(prev => ({
                        ...prev,
                        name: userData.name,
                        email: userData.email,
                        designation: userData.designation,
                        company: userData.company
                    }));
                } else {
                    // No existing user found, proceed to step 3 with empty form
                    setSteps(3);
                }
            } else {
                toast("Invalid OTP", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            toast("Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${appDomain}/api/organiser/v1/event-checkin/submit`,
                {
                    name: formData.name,
                    email: formData.email,
                    mobile: Number(formData.mobile),
                    designation: formData.designation,
                    company: formData.company,
                    eventID: event?.id,
                    userID: event?.user_id
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status) {
                toast("Check-in completed successfully!", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });

                // Reset form or redirect as needed
                setSteps(1);
                setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    designation: '',
                    company: '',
                    otp: '',
                    eventName: event?.title || ''
                });
            } else {
                toast(response.data.message || "Check-in failed", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            toast("Something went wrong during check-in", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    }

    const getFirstName = (fullName: string): string => {
        return fullName.split(' ')[0] || '';
    }

    const getLastName = (fullName: string): string => {
        const parts = fullName.split(' ');
        return parts.length > 1 ? parts.slice(1).join(' ') : '';
    }

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            
            // Check if OTP is verified (from step 2)
            if (!formData.otp || formData.otp.length !== 6) {
                toast("Please verify your mobile number first", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return;
            }

            // Proceed with check-in if verified
            const response = await axios.post(`${domain}/api/accept_decline_event_invitation`, {
                user_id: event?.user_id,
                event_uuid: eventUUID,
                email: formData.email,
                phone_number: formData.mobile,
                acceptance: '1',
                first_name: getFirstName(formData.name),
                last_name: getLastName(formData.name),
                job_title: formData.designation,
                company_name: formData.company,
                industry: 'Others'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                toast(response.data.message || "Checked-In Successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                
                // Reset everything after successful check-in
                setSteps(1);
                setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    designation: '',
                    company: '',
                    otp: '',
                    eventName: event?.title || ''
                });
            } else {
                toast("Check-in failed", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            toast("Something went wrong during check-in", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Wave />
    }

    return (
        <div className='min-h-screen w-full flex items-center justify-center p-8'>
            <div className='max-w-md w-full flex flex-col gap-3 text-center'>
                <h1 className='text-2xl font-semibold'>Registration for {event?.title}</h1>
                <p>Thank you for your interest in attending the {event?.title}. Please fill the detail below to check in at the {event?.title}</p>

                {steps === 1 && <div>
                    <div className='flex mt-5 gap-2 flex-col'>
                        <Label htmlFor="mobile_number" className='font-semibold'>Mobile Number</Label>
                        <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                            <Input
                                id="mobile_number"
                                type="tel"
                                name='mobile_number'
                                value={formData.mobile}
                                onChange={e => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                className='input !h-full min-w-full absolute text-base z-10'
                            />
                        </div>
                        <Button onClick={sendOTP} className="btn !h-12 w-full mt-2">Send OTP</Button>
                    </div>
                </div>}

                {steps === 2 && <div className='mx-auto'>
                    <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        value={formData.otp}
                        onChange={(value) => setFormData(prev => ({ ...prev, otp: value }))}
                    >
                        <InputOTPGroup className='h-12 min-w-fit'>
                            <InputOTPSlot className="focus-visible:border-brand-primary border-brand-primary focus-visible:ring-2 focus-visible:ring-blue-500" index={0} />
                            <InputOTPSlot className="focus-visible:border-brand-primary border-brand-primary focus-visible:ring-2 focus-visible:ring-blue-500" index={1} />
                            <InputOTPSlot className="focus-visible:border-brand-primary border-brand-primary focus-visible:ring-2 focus-visible:ring-blue-500" index={2} />
                            <InputOTPSlot className="focus-visible:border-brand-primary border-brand-primary focus-visible:ring-2 focus-visible:ring-blue-500" index={3} />
                            <InputOTPSlot className="focus-visible:border-brand-primary border-brand-primary focus-visible:ring-2 focus-visible:ring-blue-500" index={4} />
                            <InputOTPSlot className="focus-visible:border-brand-primary border-brand-primary focus-visible:ring-2 focus-visible:ring-blue-500" index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    <Button onClick={verifyOTP} className='btn !h-12 w-full mt-2'>Verify OTP</Button>
                    <span onClick={() => setSteps(1)} className='inline-block cursor-pointer text-brand-primary hover:text-brand-primary-dark duration-300 mt-2 px-2'>Go Back</span>
                </div>}

                {steps === 3 && <div className="w-full">
                    <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5 mt-5">
                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor="name">
                                Full Name <span className="text-brand-secondary">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                className='input !h-12 min-w-full text-base'
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor="email">
                                Email Address <span className="text-brand-secondary">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                className='input !h-12 min-w-full text-base'
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor="designation">
                                Job Title/Designation
                            </Label>
                            <Input
                                id="designation"
                                name="designation"
                                type="text"
                                className='input !h-12 min-w-full text-base'
                                value={formData.designation}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor="company">
                                Company Name
                            </Label>
                            <Input
                                id="company"
                                name="company"
                                type="text"
                                className='input !h-12 min-w-full text-base'
                                value={formData.company}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                            <Button
                                type="submit"
                                className="btn !h-12 w-full"
                                disabled={loading}
                                onClick={handleCheckIn}
                            >
                                {loading ? 'Submitting...' : 'Complete Check-in'}
                            </Button>
                            <span onClick={() => setSteps(2)} className='inline-block cursor-pointer text-brand-primary hover:text-brand-primary-dark duration-300 mt-2 px-2'>Go Back</span>

                        </div>
                    </form>
                </div>}
            </div>
        </div>
    );
};

export default CheckinPage;