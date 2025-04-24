import React, { useEffect, useState, useCallback, memo } from "react";
import { useParams } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { createImage } from "@/lib/utils";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAllCompanies, getAllJobTitles, getAllIndustries } from "@/api/extras";
import { CompanyType, JobTitleType, IndustryType } from "@/types";
import { statuses } from "@/constants";

// Memoized Input Component
const MemoizedInput = memo(({ label, id, name, type, value, onChange, required = false }: {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
}) => (
    <div className="flex flex-col gap-2 w-full">
        <Label className="font-semibold" htmlFor={id}>
            {label} {required && <span className="text-brand-secondary">*</span>}
        </Label>
        <Input
            id={id}
            name={name}
            type={type}
            className='input !h-12 min-w-full text-base'
            value={value}
            onChange={onChange}
        />
    </div>
));

// Memoized Select Component
const MemoizedSelect = memo(({ 
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
}) => (
    <div className="flex flex-col gap-2">
        <Label className="font-semibold">
            {label} {required && <span className="text-brand-secondary">*</span>}
        </Label>
        <Select
            value={value}
            onValueChange={onValueChange}
        >
            <SelectTrigger className="input !h-12 min-w-full text-base cursor-pointer">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem
                        key={option.id}
                        value={option.id.toString()}
                        className="cursor-pointer"
                    >
                        {option.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
));

const AddAttendee: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [companies, setCompanies] = useState<CompanyType[]>([]);
    const [jobTitles, setJobTitles] = useState<JobTitleType[]>([]);
    const [industries, setIndustries] = useState<IndustryType[]>([]);
    const [showCustomCompany, setShowCustomCompany] = useState(false);
    const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
    const [showCustomIndustry, setShowCustomIndustry] = useState(false);
    const [customCompany, setCustomCompany] = useState('');
    const [customJobTitle, setCustomJobTitle] = useState('');
    const [customIndustry, setCustomIndustry] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        website: '',
        linkedin_page_link: '',
        employee_size: '',
        company_turn_over: '',
        status: '',
        image: null as File | null,
        alternate_mobile_number: '',
        alternate_email: '',
        company_name: '',
        industry: '',
        job_title: '',
        award_winner: '0',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companiesData, jobTitlesData, industriesData] = await Promise.all([
                    getAllCompanies(),
                    getAllJobTitles(),
                    getAllIndustries()
                ]);
                setCompanies(companiesData);
                setJobTitles(jobTitlesData);
                setIndustries(industriesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast("Error fetching companies, job titles, and industries", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        };

        fetchData();
    }, []);

    // Memoized handlers
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target as HTMLInputElement;
        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    }, []);

    const handleCompanyChange = useCallback((value: string) => {
        const selectedCompany = companies.find(company => company.id.toString() === value);
        setFormData(prev => ({ 
            ...prev, 
            company_name: selectedCompany ? selectedCompany.name : value 
        }));
        setShowCustomCompany(value === '439');
        if (value !== '439') {
            setCustomCompany('');
        }
    }, [companies]);

    const handleJobTitleChange = useCallback((value: string) => {
        const selectedJobTitle = jobTitles.find(jobTitle => jobTitle.id.toString() === value);
        setFormData(prev => ({ 
            ...prev, 
            job_title: selectedJobTitle ? selectedJobTitle.name : value 
        }));
        setShowCustomJobTitle(value === '252');
        if (value !== '252') {
            setCustomJobTitle('');
        }
    }, [jobTitles]);

    const handleIndustryChange = useCallback((value: string) => {
        const selectedIndustry = industries.find(industry => industry.id.toString() === value);
        setFormData(prev => ({ 
            ...prev, 
            industry: selectedIndustry ? selectedIndustry.name : value 
        }));
        setShowCustomIndustry(value === '212');
        if (value !== '212') {
            setCustomIndustry('');
        }
    }, [industries]);

    const handleCustomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        switch (name) {
            case 'custom_company':
                setCustomCompany(value);
                break;
            case 'custom_job_title':
                setCustomJobTitle(value);
                break;
            case 'custom_industry':
                setCustomIndustry(value);
                break;
        }
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.company_name || !formData.status || !formData.job_title || !formData.phone_number) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.email)) {
            toast("Please enter a valid email", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Prepare the final data
        const finalData = {
            ...formData,
            company_name: showCustomCompany ? customCompany : formData.company_name,
            job_title: showCustomJobTitle ? customJobTitle : formData.job_title,
            industry: showCustomIndustry ? customIndustry : formData.industry,
        };

        console.log(finalData);
    }

    return (
        <div className="">
            <div className="w-[690px] bg-brand-light-gray p-7 rounded-[10px] mx-auto shadow-blur">
                <Tabs defaultValue="single" className="mx-auto">
                    <TabsList className="bg-white p-0 max-w-[390px] mx-auto !max-h-9">
                        <TabsTrigger
                            value="single"
                            className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                        >
                            Add Attendee Details
                        </TabsTrigger>
                        <TabsTrigger
                            value="bulk"
                            className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                        >
                            Bulk Upload
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="single" className="mt-5">
                        <form onSubmit={handleSubmit} className="w-[620px] mx-auto">
                            <div className="flex gap-3.5 w-full">
                                <MemoizedInput
                                    label="First Name"
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <MemoizedInput
                                    label="Last Name"
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid gap-3.5 grid-cols-2 mt-3.5 w-full">
                                <div className="flex flex-col gap-3.5 w-full">
                                    {/* Profile Picture */}
                                    <div className="flex flex-col gap-2">
                                        <Label className="font-semibold" htmlFor="image">Profile Picture</Label>
                                        <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                            <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                            <p className="w-full text-nowrap overflow-hidden text-ellipsis">{formData.image ? formData.image.name : 'No file Chosen'}</p>
                                            <Input
                                                id="image"
                                                name="image"
                                                type='file'
                                                accept="image/*"
                                                className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>

                                    <MemoizedInput
                                        label="E-Mail"
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />

                                    <MemoizedSelect
                                        label="Job Title"
                                        value={jobTitles.find(jobTitle => jobTitle.name === formData.job_title)?.id.toString() || formData.job_title}
                                        onValueChange={handleJobTitleChange}
                                        placeholder="Select Job Title"
                                        options={jobTitles}
                                        required
                                    />

                                    {showCustomJobTitle && (
                                        <MemoizedInput
                                            label="Specify Job Title"
                                            id="custom_job_title"
                                            name="custom_job_title"
                                            type="text"
                                            value={customJobTitle}
                                            onChange={handleCustomInputChange}
                                            required
                                        />
                                    )}

                                    <MemoizedSelect
                                        label="Company Name"
                                        value={companies.find(company => company.name === formData.company_name)?.id.toString() || formData.company_name}
                                        onValueChange={handleCompanyChange}
                                        placeholder="Select Company"
                                        options={companies}
                                        required
                                    />

                                    {showCustomCompany && (
                                        <MemoizedInput
                                            label="Specify Company"
                                            id="custom_company"
                                            name="custom_company"
                                            type="text"
                                            value={customCompany}
                                            onChange={handleCustomInputChange}
                                            required
                                        />
                                    )}
                                </div>

                                <div className="w-full mx-auto flex flex-col gap-2">
                                    <Label className="font-semibold">Select Image</Label>
                                    <div className="w-full h-full">
                                        <AspectRatio className="aspect-video w-full h-full">
                                            <img src={createImage(formData.image)} alt="Attendee Image" className="rounded-md object-cover w-full h-full" />
                                        </AspectRatio>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3.5 flex-col mt-2.5 w-full">
                                <MemoizedSelect
                                    label="Industry"
                                    value={industries.find(industry => industry.name === formData.industry)?.id.toString() || formData.industry}
                                    onValueChange={handleIndustryChange}
                                    placeholder="Select Industry"
                                    options={industries}
                                    required
                                />

                                {showCustomIndustry && (
                                    <MemoizedInput
                                        label="Specify Industry"
                                        id="custom_industry"
                                        name="custom_industry"
                                        type="text"
                                        value={customIndustry}
                                        onChange={handleCustomInputChange}
                                        required
                                    />
                                )}

                                {/* Employee Size */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="employee_size">Employee Size</Label>
                                    <Input
                                        id="employee_size"
                                        name="employee_size"
                                        type='number'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.employee_size}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Company Turn Over */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="company_turn_over">Company Turn Over</Label>
                                    <Input
                                        id="company_turn_over"
                                        name="company_turn_over"
                                        type='text'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.company_turn_over}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Phone Number */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="phone_number">Phone Number <span className="text-brand-secondary">*</span></Label>
                                    <Input
                                        id="phone_number"
                                        name="phone_number"
                                        type='tel'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Alternate Phone Number */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="alternate_mobile_number">Alternate Phone Number</Label>
                                    <Input
                                        id="alternate_mobile_number"
                                        name="alternate_mobile_number"
                                        type='tel'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.alternate_mobile_number}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Website */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        type='url'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.website}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* LinkedIn Profile */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="linkedin_page_link">LinkedIn Profile</Label>
                                    <Input
                                        id="linkedin_page_link"
                                        name="linkedin_page_link"
                                        type='url'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.linkedin_page_link}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {/* Status */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="status">Status <span className="text-brand-secondary">*</span></Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="input !h-12 min-w-full text-base cursor-pointer">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status, index) => (
                                                <SelectItem key={index} value={status} className="cursor-pointer">{status}</SelectItem>
                                            ))}
                                            <SelectItem value="others" className="cursor-pointer">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Award Winner */}
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="award_winner">Award Winner</Label>
                                    <Select
                                        value={formData.award_winner}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, award_winner: value }))}
                                    >
                                        <SelectTrigger className="input !h-12 min-w-full text-base cursor-pointer">
                                            <SelectValue placeholder="Select Award Winner Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1" className="cursor-pointer">Yes</SelectItem>
                                            <SelectItem value="0" className="cursor-pointer">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button type="submit">Submit</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="bulk">

                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
};

export default AddAttendee;