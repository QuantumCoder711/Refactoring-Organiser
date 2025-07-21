import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { CircleCheck, CircleX, ChevronDown, Check } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Wave from '@/components/Wave';
import useExtrasStore from '@/store/extrasStore';
import { CompanyType } from '@/types';
import { domain } from '@/constants';

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
        <div className="flex gap-2 flex-col w-full" ref={dropdownRef}>
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
                        className="w-full bg-white !h-12 text-base pr-10"
                    />
                    <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
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
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm"
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

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { getAllCompanies, companies, loading } = useExtrasStore(state => state);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userAccount, setUserAccount] = useState({
        first_name: "",
        last_name: "",
        email: "",
        country_code: "91",
        mobile_number: "",
        password: "",
        company_name: "",
        company: 0,
        confirm_password: "",
        tnc: false,
        notifications: false,
        mobile_otp: "",
        email_otp: "",
        step: "1",
        source_website: true,
    });

    useEffect(() => {
        getAllCompanies();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = name === 'country_code' ? value.replace(/\+/g, '') : value;
        setUserAccount(prevState => ({
            ...prevState,
            [name]: sanitizedValue
        }));
    };



    const handleCreateAccount = async () => {
        const { first_name, last_name, email, country_code, mobile_number, password, confirm_password, company_name, tnc, notifications, company } = userAccount;

        if (!country_code) {
            toast("Country code is required", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!first_name) {
            toast("Please enter your first name", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!last_name) {
            toast("Please enter your last name", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!email) {
            toast("Please enter your email", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!mobile_number) {
            toast("Please enter your mobile number", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!password) {
            toast("Please enter your password", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (password !== confirm_password) {
            toast("Passwords don't match", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!company_name) {
            toast("Please select your company", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!tnc) {
            toast("Please agree to terms and conditions", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!notifications) {
            toast("Please agree to receive important updates", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/register`, userAccount, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === 200) {
                setUserAccount((prev) => ({
                    ...prev,
                    step: "2"
                }));
            }
            else if (res.data.status === 422) {
                toast("Email or Phone No. already exists", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            } else {
                toast(res.data.message || "Something went wrong", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            toast(error.data.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/register`, userAccount, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === 200) {
                toast("Account created successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                navigate("/organiser/login");
            } else {
                toast(res.data.message || "Invalid OTP", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            toast(error.data.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (loading || isLoading) {
        return <Wave />;
    }

    return (
        <div className='flex items-center h-full w-full justify-center p-4'>
            <div className='max-w-xl w-full rounded-[10px] p-8'>
                <h1 className='text-2xl font-semibold text-center mb-6'>Create Account</h1>

                {userAccount.step === "1" && (
                    <div className='space-y-5'>
                        <div className='flex gap-5 justify-between'>
                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>First Name</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.first_name}
                                        onChange={handleInputChange}
                                        name='first_name'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>

                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Last Name</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.last_name}
                                        onChange={handleInputChange}
                                        name='last_name'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-5 justify-between'>
                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Email</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.email}
                                        onChange={handleInputChange}
                                        name='email'
                                        type='email'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>

                            <div className='flex items-center gap-2 w-full'>

                                <div className='w-fit flex flex-col gap-2'>
                                    <Label className='font-semibold'>Country Code</Label>
                                    <div className='input !h-12 relative !p-1 flex items-center'>
                                        <span className='pl-2 pr-1 select-none'>+</span>
                                        <Input
                                            value={userAccount.country_code}
                                            onChange={(e) => handleInputChange(e)}
                                            name='country_code'
                                            className='input !h-full w-full text-base z-10 border-none shadow-none bg-transparent pl-1'
                                            required
                                        />
                                    </div>
                                </div>
                                <div className='flex flex-col gap-2 w-full'>
                                    <Label className='font-semibold'>Mobile Number</Label>
                                    <div className='w-full'>
                                        <div className='input !h-12 relative !p-1'>
                                            <Input
                                                value={userAccount.mobile_number}
                                                onChange={handleInputChange}
                                                name='mobile_number'
                                                className='input !h-full w-full text-base z-10'
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <CustomComboBox
                            label="Company Name"
                            value={userAccount.company_name}
                            onValueChange={(value: string) => {
                                const id = companies.find(c => c.name === value)?.id || 439;
                                setUserAccount(prev => ({ ...prev, company: id, company_name: value }))
                            }}
                            placeholder="Type or select company"
                            options={companies}
                            required
                        />

                        <div className='flex gap-5 justify-between'>
                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Password</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.password}
                                        onChange={handleInputChange}
                                        name='password'
                                        type='password'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>

                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Confirm Password</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.confirm_password}
                                        onChange={handleInputChange}
                                        name='confirm_password'
                                        type='password'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='space-y-5'>
                            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setUserAccount(prevState => ({
                                ...prevState,
                                tnc: !prevState.tnc
                            }))}>
                                <Checkbox id="tnc" checked={userAccount.tnc} className='bg-white' />
                                <label
                                    htmlFor="tnc"
                                    className="text-sm leading-none"
                                >
                                    I agree to company <Link to='/terms-and-conditions' className='text-brand-primary'>Terms & Conditions</Link> and <Link to='/privacy-policy' className='text-brand-primary'>Privacy Policy</Link>
                                </label>
                            </div>

                            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setUserAccount(prevState => ({
                                ...prevState,
                                notifications: !prevState.notifications
                            }))}>
                                <Checkbox id="notifications" checked={userAccount.notifications} className='bg-white' />
                                <label
                                    htmlFor="notifications"
                                    className="text-sm leading-none"
                                >
                                    I agree to receive Important updates on SMS, Email & Whatsapp.
                                </label>
                            </div>
                        </div>

                        <Button onClick={handleCreateAccount} className='btn mx-auto w-full'>Create Account</Button>
                        <p className="text-center">Already have an account? <Link to="/organiser/login" className='text-brand-primary'>Login Here</Link></p>
                    </div>
                )}

                {userAccount.step === "2" && (
                    <div className='space-y-5'>
                        <div className='flex gap-5 justify-between'>
                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Email OTP</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.email_otp}
                                        onChange={handleInputChange}
                                        name='email_otp'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>

                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Mobile OTP</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.mobile_otp}
                                        onChange={handleInputChange}
                                        name='mobile_otp'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleVerifyOTP} className='btn mx-auto w-full'>Verify OTP</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup; 