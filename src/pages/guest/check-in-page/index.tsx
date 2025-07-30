import React from 'react';
import { appDomain, domain } from '@/constants';
import { EventType } from '@/types';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheck, CircleX, ChevronDown, Check } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';
import useExtrasStore from '@/store/extrasStore';
import { useEffect as useExtrasEffect } from 'react';

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

// Custom Combo Box Component for company names with filtering and creation
const CustomComboBox = React.memo(({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false
}: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { id: number; name: string }[];
    required?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSearchTerm(newValue);
        setIsOpen(true);
        onValueChange(newValue);
    };

    // Handle option selection
    const handleOptionSelect = (option: { id: number; name: string }) => {
        setInputValue(option.name);
        setSearchTerm('');
        setIsOpen(false);
        onValueChange(option.name);
        inputRef.current?.blur();
    };

    // Handle creating new option
    const handleCreateNew = () => {
        setInputValue(searchTerm);
        setIsOpen(false);
        onValueChange(searchTerm);
        inputRef.current?.blur();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update input value when value prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div className="flex flex-col gap-2" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-brand-secondary">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="input capitalize !h-12 min-w-full text-base pr-10"
                    />
                    <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        onClick={() => {
                            setIsOpen(!isOpen);
                            inputRef.current?.focus();
                        }}
                    />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="px-3 py-2 capitalize cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm"
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <span>{option.name}</span>
                                    {inputValue === option.name && (
                                        <Check className="size-4 text-brand-secondary" />
                                    )}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-brand-secondary text-sm font-medium"
                                onClick={handleCreateNew}
                            >
                                Create "{searchTerm}"
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                No companies found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

const CheckinPage: React.FC = () => {
    const location = useLocation();
    const params: URLSearchParams = new URLSearchParams(location.search);
    const eventUUID: string | null = params.get("eventuuid");
    const breakoutRoom: string | null = params.get("breakoutRoom");
    const tabId: string | null = params.get("tabId");
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
    const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
    const { companies, designations, getCompanies, getDesignations } = useExtrasStore();

    // Fetch companies and designations
    useExtrasEffect(() => {
        getCompanies(formData.company);
        getDesignations(formData.designation);
    }, [formData.company, formData.designation]);

    useEffect(() => {
        // Fetch event details first
        axios.get(`${domain}/api/events/${eventUUID}`).then(res => {
            if (res.data.status === 200) {
                setEvent(res.data.data);
                setFormData(prev => ({
                    ...prev,
                    eventName: res.data.data.title
                }));

                // After getting event details, check for breakout room flow
                if (breakoutRoom) {
                    const savedMobile = localStorage.getItem('breakoutCheckinMobile');
                    if (savedMobile) {
                        // Check for existing user with saved mobile
                        axios.post(
                            `${appDomain}/api/organiser/v1/event-checkin/existing-user`,
                            {
                                mobile: Number(savedMobile),
                                eventID: res.data.data.id,
                                userID: res.data.data.user_id
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        ).then(userRes => {
                            if (userRes.data.data.length > 0) {
                                const userData = userRes.data.data[0];
                                setFormData(prev => ({
                                    ...prev,
                                    mobile: savedMobile,
                                    name: userData.name,
                                    email: userData.email,
                                    designation: userData.designation,
                                    company: userData.company
                                }));
                                setSteps(3); // Go directly to form
                            } else {
                                setSteps(1); // No user found, start verification
                            }
                        }).catch(() => {
                            setSteps(1); // Error, start verification
                        });
                    } else {
                        setSteps(1); // No saved mobile, start verification
                    }
                }
            }
        });
    }, [eventUUID, breakoutRoom]);

    const sendOTP = async () => {
        if (!formData.mobile) {
            toast("Please enter your mobile number", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

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
                // Save mobile to localStorage for breakout room check-in

                localStorage.setItem('breakoutCheckinMobile', formData.mobile);
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
                    const userData = userResponse.data.data[0];
                    setFormData(prev => ({
                        ...prev,
                        name: userData.name,
                        email: userData.email,
                        designation: userData.designation,
                        company: userData.company
                    }));
                }
                setSteps(3);
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

            // Skip OTP verification if we have a saved mobile number for breakout room
            if (breakoutRoom && localStorage.getItem('breakoutCheckinMobile')) {
                // Proceed with check-in

            } else if (!formData.otp || formData.otp.length !== 6) {
                toast("Please verify your mobile number first", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return;
            }

            // Determine which API endpoint to use based on breakoutRoom parameter
            const endpoint = breakoutRoom
                ? `${domain}/api/breakout_room_checkin`
                : `${domain}/api/accept_decline_event_invitation`;

            if (!formData.name || !formData.email || !formData.designation || !formData.company || !formData.mobile) {
                toast("Please fill in all required fields", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return;
            }

            // Prepare the request payload
            const payload = breakoutRoom
                ? {
                    user_id: event?.user_id,
                    event_uuid: eventUUID,
                    email: formData.email,
                    phone_number: formData.mobile,
                    acceptance: '1',
                    first_name: getFirstName(formData.name),
                    last_name: getLastName(formData.name),
                    job_title: formData.designation,
                    company_name: formData.company,
                    industry: 'Others',
                    breakout_room: breakoutRoom
                }
                : {
                    user_id: event?.user_id,
                    event_uuid: eventUUID,
                    email: formData.email,
                    phone_number: formData.mobile,
                    acceptance: '1',
                    first_name: getFirstName(formData.name),
                    last_name: getLastName(formData.name),
                    job_title: formData.designation,
                    company_name: formData.company,
                    industry: 'Others',
                    tab_id: tabId || ''
                };

            // Make the API call
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.status === 200) {
                toast(response.data.message || "Checked-In Successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });

                // Show success screen instead of resetting
                setIsCheckedIn(true);
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
                <p>Welcome to the {event?.title}, please verify your details to check-in at this session.</p>

                {isCheckedIn ? (
                    <div className="flex flex-col items-center justify-center gap-4 mt-8">
                        <CircleCheck className="w-16 h-16 text-green-500" />
                        <h2 className="text-2xl font-semibold text-green-600">Check-in Successful!</h2>
                        <p className="text-gray-600">Thank you for checking in to {event?.title}</p>
                        <p className="text-gray-600">You can now close this window.</p>
                    </div>
                ) : (
                    <>
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
                                <Button onClick={sendOTP} className="btn !h-12 w-full mt-2">
                                    Send OTP
                                </Button>
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
                                        className='input !h-12 min-w-full text-base capitalize'
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
                                    {/* <Label className="font-semibold" htmlFor="designation">
                                        Job Title/Designation <span className='text-brand-secondary'>*</span>
                                    </Label>
                                    <Input
                                        id="designation"
                                        name="designation"
                                        type="text"
                                        required
                                        className='input !h-12 min-w-full text-base capitalize'
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                    /> */}

                                    <CustomComboBox
                                        label="Job Title"
                                        value={formData.designation}
                                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, designation: value }))}
                                        placeholder="Type or select job title"
                                        options={designations.map((designation, index) => ({ id: index + 1, name: designation.designation }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    {/* <Label className="font-semibold" htmlFor="company">
                                        Company Name <span className="text-brand-secondary">*</span>
                                    </Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        type="text"
                                        required
                                        className='input !h-12 min-w-full text-base capitalize'
                                        value={formData.company}
                                        onChange={handleInputChange}
                                    /> */}
                                    <CustomComboBox
                                        label="Company Name"
                                        value={formData.company}
                                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, company: value }))}
                                        placeholder="Type or select company"
                                        options={companies.map((company, index) => ({ id: index + 1, name: company.company }))}
                                        required
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
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckinPage;