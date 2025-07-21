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
import { CircleCheckBig, CircleX, ChevronDown, Check } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import Wave from '@/components/Wave';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '@/api/auth';

// Custom Combo Box Component for company names and job titles with filtering and creation
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
        <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
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
                        className="input !h-12 min-w-full text-base pr-10"
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
                                No options found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

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

    // Update form data when companies and designations are loaded and user data is available
    useEffect(() => {
        if (user && companies.length > 0 && designations.length > 0) {
            // Find company name if only ID is available
            if (user.company && !formData.company_name) {
                const company = companies.find(c => c.id === Number(user.company));
                if (company) {
                    setFormData(prev => ({ ...prev, company_name: company.name }));
                }
            }

            // Find designation name if only ID is available
            if (user.designation && !formData.designation_name) {
                const designation = designations.find(d => d.id === Number(user.designation));
                if (designation) {
                    setFormData(prev => ({ ...prev, designation_name: designation.name }));
                }
            }
        }
    }, [user, companies, designations, formData.company_name, formData.designation_name]);

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



    const validateForm = () => {
        const requiredFields = [
            'first_name',
            'last_name',
            'email',
            'mobile_number',
            'company_name',
            'designation_name',
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
                <CustomComboBox
                    label="Company"
                    value={formData.company_name}
                    onValueChange={(value: string) => {
                        const id = companies.find(c => c.name === value)?.id || 439;
                        setFormData(prev => ({ ...prev, company: id, company_name: value }))
                    }}
                    placeholder="Type or select company"
                    options={companies}
                    required
                />

                {/* Designation */}
                <CustomComboBox
                    label="Designation"
                    value={formData.designation_name}
                    onValueChange={(value: string) => {
                        const id = designations.find(d => d.name === value)?.id || 252;
                        setFormData(prev => ({ ...prev, designation: id, designation_name: value }))
                    }}
                    placeholder="Type or select designation"
                    options={designations}
                    required
                />

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