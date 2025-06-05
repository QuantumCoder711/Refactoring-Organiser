import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { CircleCheck, CircleX } from 'lucide-react';

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

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { getAllCompanies, companies, loading } = useExtrasStore(state => state);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userAccount, setUserAccount] = useState({
        first_name: "",
        last_name: "",
        email: "",
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
        setUserAccount(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCompanyChange = (value: string) => {
        const companyId = parseInt(value);
        setUserAccount(prevState => ({
            ...prevState,
            company: companyId
        }));
    };

    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserAccount(prevState => ({
            ...prevState,
            company_name: e.target.value
        }));
    };

    const handleCreateAccount = async () => {
        const { first_name, last_name, email, mobile_number, password, confirm_password, company_name, tnc, notifications, company } = userAccount;

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

        if (company === 0) {
            toast("Please select your company", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (company === 439 && !company_name) {
            toast("Please enter your company name", {
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
        <div className='flex items-center justify-center p-4'>
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

                            <div className='flex gap-2 flex-col w-full'>
                                <Label className='font-semibold'>Mobile Number</Label>
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                    <Input
                                        value={userAccount.mobile_number}
                                        onChange={handleInputChange}
                                        name='mobile_number'
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-2 flex-col w-full'>
                            <Label className='font-semibold'>Company Name</Label>
                            <Select onValueChange={handleCompanyChange}>
                                <SelectTrigger className="w-full bg-white !h-12 cursor-pointer">
                                    <SelectValue placeholder="Company Name" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map((company: CompanyType) => (
                                        <SelectItem
                                            key={company.id}
                                            value={company.id.toString()}
                                            className='cursor-pointer'
                                        >
                                            {company.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {userAccount.company === 439 && (
                                <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end mt-2'>
                                    <Input
                                        value={userAccount.company_name}
                                        onChange={handleCompanyNameChange}
                                        name='company_name'
                                        type='text'
                                        placeholder="Enter custom company name"
                                        className='input !h-full min-w-full absolute right-0 text-base z-10'
                                    />
                                </div>
                            )}
                        </div>

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