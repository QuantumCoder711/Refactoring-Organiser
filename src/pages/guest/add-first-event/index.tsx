import AddEvent from '@/pages/admin/all-events/add-event';
import useAuthStore from '@/store/authStore';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useExtrasStore from '@/store/extrasStore';
import { CompanyType } from '@/types';
import Wave from '@/components/Wave';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';
import axios from 'axios';
import { domain } from '@/constants';


const AddFirstEvent: React.FC = () => {

    const { token } = useAuthStore(state => state);
    const [open, setOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState({
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

    const { getAllCompanies, companies, loading } = useExtrasStore(state => state);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        getAllCompanies();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Handle company selection change 
    const handleCompanyChange = (value: string) => {
        const companyId = parseInt(value);
        setFormData(prevState => ({
            ...prevState,
            company: companyId
        }));
        console.log("Company selected:", companyId);
    };

    // Handle Account Creation
    const handleCreateAccount = async () => {
        const { first_name, last_name, email, mobile_number, password, confirm_password, company, tnc, notifications } = formData;

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

        if (!company) {
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
            const res = await axios.post(`${domain}/api/register`, formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === 200) {
                setFormData((prev) => ({
                    ...prev,
                    step: "2"
                }));
            }

            if (res.data.status === 422) {
                const errors = [];
                if (res.data.error.email) {
                    errors.push(res.data.error.email[0]);
                }
                if (res.data.error.mobile_number) {
                    errors.push(res.data.error.mobile_number[0]);
                }
            }
            if (res.data.status === 400) {
                const errors = [];
                if (res.data.error.email) {
                    errors.push(res.data.error.email[0]);
                }
                if (res.data.error.mobile_number) {
                    errors.push(res.data.error.mobile_number[0]);
                }
            }
        } catch (error) {
            toast(error instanceof Error ? error.message : "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            })
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/register`, formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === 200) {
                // Event Will Create
            }
        } catch (error) {
            toast(error instanceof Error ? error.message : "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            })
        } finally {
            setIsLoading(false);
        }
    }

    if (loading || isLoading) {
        return <Wave />
    }

    return (
        <div className='min-h-full min-w-full'>
            <Dialog open={!open}>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent className='bg-brand-light'>
                    <DialogHeader>
                        <DialogTitle className='text-center text-2xl'>Create Account</DialogTitle>

                        {/* Sign Up Form */}
                        {formData.step == "1" && <div>
                            {/* First Name & Last Name */}
                            <div className='flex gap-5 justify-between'>
                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>First Name</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            name='first_name'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Last Name</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            name='last_name'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email & Mobile Number */}
                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Email</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            name='email'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Mobile Number</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.mobile_number}
                                            onChange={handleInputChange}
                                            name='mobile_number'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company and Company Name */}
                            <div className='flex gap-5 justify-between mt-5'>
                                {/* Company Name */}
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

                                    {formData.company === 439 && (
                                        <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end mt-2'>
                                            <Input
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                name='company_name'
                                                type='text'
                                                placeholder="Enter custom company name"
                                                className='input !h-full min-w-full absolute right-0 text-base z-10'
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Password & Confirm Password */}
                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Password</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.password}
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
                                            value={formData.confirm_password}
                                            onChange={handleInputChange}
                                            name='confirm_password'
                                            type='password'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className='mt-5 space-y-5'>
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setFormData(prevState => ({
                                    ...prevState,
                                    tnc: !prevState.tnc
                                }))}>
                                    <Checkbox id="tnc" checked={formData.tnc} className='bg-white' />
                                    <label
                                        htmlFor="tnc"
                                        className="text-sm leading-none"
                                    >
                                        I agree to company <Link to='#' className='text-brand-primary'>Terms & Conditions</Link> and <Link to='#' className='text-brand-primary'>Privacy Policy</Link>
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setFormData(prevState => ({
                                    ...prevState,
                                    notifications: !prevState.notifications
                                }))}>
                                    <Checkbox id="notifications" checked={formData.notifications} className='bg-white' />
                                    <label
                                        htmlFor="notifications"
                                        className="text-sm leading-none"
                                    >
                                        I agree to receive Important updates on SMS, Email & Whatsapp.
                                    </label>
                                </div>
                            </div>

                            <Button onClick={handleCreateAccount} className='mt-5 btn mx-auto w-full'>Create Account</Button>
                            <p className="text-center mt-2">Already have an account ? <Link to={"/login"} className='text-brand-primary'><span>Login Here</span></Link></p>
                        </div>}

                        {formData.step == "2" && <div>
                            {/* Email and Mobile OTP */}
                            <div className='flex gap-5 justify-between'>
                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Email OTP</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.email_otp}
                                            onChange={handleInputChange}
                                            name='email_otp'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Mobile OTP</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={formData.mobile_otp}
                                            onChange={handleInputChange}
                                            name='mobile_otp'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleCreateEvent} className='mt-5 btn mx-auto w-full'>Create Account</Button>
                        </div>}
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddFirstEvent;