import { getAllCompanies, getAllJobTitles } from '@/api/extras';
import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { domain, UserAvatar } from '@/constants';
import useAuthStore from '@/store/authStore';
import { CompanyType, UserType } from '@/types';
import { JobTitleType } from '@/types';
import axios from 'axios';
import { CircleCheckBig, CircleX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getImageUrl } from '@/lib/utils';
import Wave from '@/components/Wave';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '@/api/auth';

const UpdateProfile: React.FC = () => {
    const { user, setUser, token } = useAuthStore(state => state);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<CompanyType[]>([]);
    const [designations, setDesignations] = useState<JobTitleType[]>([]);
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        mobile_number: user?.mobile_number || '',
        company: user?.company || 0,
        company_name: user?.company_name || '',
        designation: user?.designation || 0,
        designation_name: user?.designation_name || '',
        address: user?.address || '',
        pincode: user?.pincode || '',
        company_logo: user?.company_logo || null as File | string | null,
        image: user?.image || null as File | string | null,
    });

    useEffect(() => {
        if (companies.length === 0 || designations.length === 0) {
            getAllCompanies().then((companies) => {
                setCompanies(companies);
            });
            getAllJobTitles().then((designations) => {
                setDesignations(designations);
            });
        }
    }, [companies, designations]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCompanyChange = (value: string) => {
        const companyId = parseInt(value);
        const selectedCompany = companies.find(company => company.id === companyId);

        setFormData(prev => ({
            ...prev,
            company: companyId,
            company_name: selectedCompany?.name || ''
        }));
    };

    const handleDesignationChange = (value: string) => {
        const designationId = parseInt(value);
        const selectedDesignation = designations.find(designation => designation.id === designationId);

        setFormData(prev => ({
            ...prev,
            designation: designationId,
            designation_name: selectedDesignation?.name || ''
        }));
    };

    const validateForm = () => {
        const requiredFields = [
            'first_name',
            'last_name',
            'email',
            'mobile_number',
            'company',
            'designation',
            'address',
            'pincode'
        ];

        const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

        if (missingFields.length > 0) {
            toast("Please fill in all required fields marked with *", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            const response = await axios.post(`${domain}/api/updateprofile`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });

            const profileResponse = await getProfile(token as string);

            setUser(profileResponse as unknown as UserType);

            if (response.status === 200) {
                toast(response.data.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheckBig className='size-5' />
                });

                navigate('/profile');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";

            toast(errorMessage, {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <Wave />
    }

    return (
        <div className='w-full h-full relative'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='max-w-[700px] mx-auto rounded-[10px] p-8 bg-brand-background flex flex-col gap-5'>
                {/* Name */}
                <div className='flex gap-5 justify-between'>
                    {/* First Name */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='first_name'>
                            First Name <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            name='first_name'
                            type="text"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                    {/* Last Name */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='last_name'>
                            Last Name <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            name='last_name'
                            type="text"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='email'>
                        Email <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="email"
                        name='email'
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='mobile_number'>
                        Phone No. <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="mobile_number"
                        name='mobile_number'
                        type="text"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='company'>
                        Company <span className="text-brand-secondary">*</span>
                    </Label>
                    <Select onValueChange={handleCompanyChange} value={formData.company?.toString()}>
                        <SelectTrigger className="w-full bg-white !h-12 cursor-pointer">
                            <SelectValue placeholder="Select Company" />
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
                </div>

                {/* Designation */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='designation'>
                        Designation <span className="text-brand-secondary">*</span>
                    </Label>
                    <Select onValueChange={handleDesignationChange} value={formData.designation?.toString()}>
                        <SelectTrigger className="w-full bg-white !h-12 cursor-pointer">
                            <SelectValue placeholder="Select Designation" />
                        </SelectTrigger>
                        <SelectContent>
                            {designations.map((designation: JobTitleType) => (
                                <SelectItem
                                    key={designation.id}
                                    value={designation.id.toString()}
                                    className='cursor-pointer'
                                >
                                    {designation.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Address & Pincode */}
                <div className='flex gap-5 justify-between'>
                    {/* Address */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='address'>
                            Address <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="address"
                            name='address'
                            type="text"
                            value={formData.address}
                            onChange={handleInputChange}
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='pincode'>
                            Pincode <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="pincode"
                            name='pincode'
                            type="text"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                </div>

                {/* Company Logo & Profile Picture */}
                <div className='flex gap-5 justify-between'>
                    {/* Company Image */}
                    <div className='flex gap-5 flex-col w-full'>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="company_logo">Company Logo <span className='text-brand-secondary'>*</span></Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                    {formData.company_logo ? (formData.company_logo instanceof File ? formData.company_logo.name : "File selected") : "No file Chosen"}
                                </p>
                                <Input
                                    id="company_logo"
                                    name="company_logo"
                                    type='file'
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                />
                            </div>
                        </div>

                        <img
                            src={formData.company_logo instanceof File ? URL.createObjectURL(formData.company_logo) : formData.company_logo ? getImageUrl(formData.company_logo) : UserAvatar}
                            alt="Company Logo"
                            width={150}
                            height={150}
                            className='rounded-md'
                        />
                    </div>

                    {/* Profile Picture */}
                    <div className='flex gap-5 flex-col w-full'>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="image">Profile Picture <span className='text-brand-secondary'>*</span></Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                    {formData.image ? (formData.image instanceof File ? formData.image.name : "File selected") : "No file Chosen"}
                                </p>
                                <Input
                                    id="image"
                                    name="image"
                                    type='file'
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                />
                            </div>
                        </div>

                        <img
                            src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image ? getImageUrl(formData.image) : UserAvatar}
                            alt="Profile Picture"
                            width={150}
                            height={150}
                            className='rounded-md'
                        />
                    </div>
                </div>

                <div className='flex gap-5 justify-center mt-12'>
                    <Button
                        onClick={handleSubmit}
                        className='btn !h-12 !text-base w-44'
                    >
                        Save
                    </Button>
                    <Button
                        onClick={() => window.history.back()}
                        className='btn !bg-brand-dark-gray !h-12 !text-base w-44'
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UpdateProfile;