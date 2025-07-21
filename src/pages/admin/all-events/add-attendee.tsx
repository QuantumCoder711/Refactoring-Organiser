import React, { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from 'xlsx';
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Download, FileText, FileUp, ChevronDown, Check } from "lucide-react";
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
import { roles } from "@/constants";
import useExtrasStore from "@/store/extrasStore";
import useAttendeeStore from "@/store/attendeeStore";
import useAuthStore from "@/store/authStore";
import useEventStore from "@/store/eventStore";
import Wave from "@/components/Wave";
import GoBack from "@/components/GoBack";

// Simple Input Component with React.memo to prevent unnecessary re-renders
const CustomInput = React.memo(({ label, id, name, type, value, onChange, required = false }: {
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

// Simple Select Component with React.memo to prevent unnecessary re-renders
const CustomSelect = React.memo(({
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

// Simple Select Component for string options with React.memo
const CustomSelectSimple = React.memo(({
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
    options: { value: string; label: string }[];
    required?: boolean;
}) => (
    <div className="flex flex-col gap-2">
        <Label className="font-semibold" htmlFor={label.toLowerCase().replace(/\s+/g, '_')}>
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
                {options.map((option, index) => (
                    <SelectItem
                        key={index}
                        value={option.value}
                        className="cursor-pointer"
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
));

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
                        className="input !h-12 min-w-full text-base pr-10"
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

const AddAttendee: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { token } = useAuthStore();
    const { getEventBySlug } = useEventStore(state => state);
    const { companies, jobTitles, industries, loading: extrasLoading } = useExtrasStore();
    const { addAttendee, bulkUploadAttendees, loading: attendeeLoading } = useAttendeeStore();
    const loading = extrasLoading || attendeeLoading;
    const [showCustomIndustry, setShowCustomIndustry] = useState(false);
    const [customIndustry, setCustomIndustry] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email_id: '',
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
    const [bulkFile, setBulkFile] = useState<File | null>(null);

    const event = getEventBySlug(slug);

    // Utility functions for form handling
    const createFormData = useCallback((data: Record<string, any>, specialFields?: Record<string, any>) => {
        const formData = new FormData();

        // Loop through all fields in the data object
        Object.entries(data).forEach(([key, value]) => {
            // Skip the image field as it needs special handling
            if (key === 'image') return;

            // Handle empty values
            const stringValue = value === null || value === undefined ? '' : String(value);
            formData.append(key, stringValue);
        });

        // Handle special fields (like custom fields or file uploads)
        if (specialFields) {
            Object.entries(specialFields).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });
        }

        return formData;
    }, []);

    // Validation function
    const validateForm = useCallback((data: Record<string, any>, requiredFields: string[]) => {
        // Check required fields
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        // Validate email format
        if (data.email_id && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(data.email_id)) {
            toast("Please enter a valid email", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return false;
        }

        return true;
    }, []);

    // Handlers with debounce to reduce lag
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Use requestAnimationFrame to batch updates and reduce lag
        requestAnimationFrame(() => {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        });
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target as HTMLInputElement;
        if (files) {
            // Use requestAnimationFrame to batch updates and reduce lag
            requestAnimationFrame(() => {
                setFormData(prev => ({
                    ...prev,
                    [name]: files[0]
                }));
            });
        }
    }, []);





    const handleIndustryChange = useCallback((value: string) => {
        // Use requestAnimationFrame to batch updates and reduce lag
        requestAnimationFrame(() => {
            const selectedIndustry = industries.find((industry: { id: number, name: string }) => industry.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                industry: selectedIndustry ? selectedIndustry.name : value
            }));
            setShowCustomIndustry(value === '212');
            if (value !== '212') {
                setCustomIndustry('');
            }
        });
    }, [industries]);

    const handleCustomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Use requestAnimationFrame to batch updates and reduce lag
        requestAnimationFrame(() => {
            switch (name) {
                case 'custom_industry':
                    setCustomIndustry(value);
                    break;
            }
        });
    }, []);

    // Dropzone configuration for bulk upload
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setBulkFile(acceptedFiles[0]);
            }
        }
    });

    // Handle bulk file upload
    const handleBulkUpload = async () => {
        if (!token || !event) {
            toast("Authentication or event information missing", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!bulkFile) {
            toast("Please select a file to upload", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            const response = await bulkUploadAttendees(token, event.uuid, bulkFile);

            if (response.status === 200) {
                toast(response.message || "Attendees uploaded successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });

                // Reset the file state
                setBulkFile(null);
            }
            else {
                if (response.invalid_data && response.duplicate_entries) {
                    toast(`${response.message}, Duplicate ${response.duplicate_entries}` || "Failed to upload attendees", {
                        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleCheck className='size-5' />
                    });
                } else {
                    toast(response.message || "Failed to upload attendees", {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleX className='size-5' />
                    });
                }
            }
        } catch (error: any) {

            let errorMessage = "Error uploading file";
            if (error.message) {
                errorMessage = error.message;
            }

            toast(errorMessage, {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token || !event) {
            toast("Authentication or event information missing", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Define required fields
        const requiredFields = ['first_name', 'last_name', 'email_id', 'company_name', 'status', 'job_title', 'phone_number'];

        // Validate the form
        if (!validateForm(formData, requiredFields)) {
            return;
        }

        // Prepare special fields that need custom handling
        const specialFields: Record<string, any> = {
            company_name: formData.company_name,
            job_title: formData.job_title,
            industry: showCustomIndustry ? customIndustry : formData.industry,
            image: formData.image
        };

        // Create FormData using our utility function
        const finalFormData = createFormData(formData, specialFields);
        finalFormData.append('event_id', event.id.toString());

        try {
            const response = await addAttendee(token, event.uuid, finalFormData);

            if (response.status === 200) {
                setFormData({
                    first_name: '',
                    last_name: '',
                    email_id: '',
                    phone_number: '',
                    website: '',
                    linkedin_page_link: '',
                    employee_size: '',
                    company_turn_over: '',
                    status: '',
                    image: null,
                    alternate_mobile_number: '',
                    alternate_email: '',
                    company_name: '',
                    industry: '',
                    job_title: '',
                    award_winner: '0',
                });
                toast(response.message || "Attendee added successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                // Display general error message based on the response
                toast(response.message || "Failed to add attendee", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            console.error('Error adding attendee:', error);

            // Try to extract error message from the error object
            let errorMessage = "Error adding attendee";

            if (error.response && error.response.data) {
                // Check for validation errors (422 status code)
                if (error.response.status === 422 && error.response.data.errors) {
                    // Handle validation errors
                    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                        const fieldMessages = Array.isArray(messages) ? messages.join(', ') : String(messages);
                        toast(`${field.replace('_', ' ')}: ${fieldMessages}`, {
                            className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <CircleX className='size-5' />
                        });
                    });
                    return; // Return early to avoid showing the generic error message
                } else if (error.response.data.message) {
                    // Use the message from the response if available
                    errorMessage = error.response.data.message;
                }
            }

            toast(errorMessage, {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    }

    if (loading) {
        return <Wave />
    }

    return (
        <div className="">
            <div className='flex items-center gap-5 mb-5'>
                <GoBack />
                <h1 className='text-xl font-semibold'>{event?.title}</h1>
            </div>
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
                        </TabsTrigger></TabsList>
                    <TabsContent value="single" className="mt-5">
                        <form onSubmit={handleSubmit} className="w-[620px] mx-auto text-center">
                            <div className="flex gap-3.5 w-full">
                                <CustomInput
                                    label="First Name"
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    required
                                />
                                <CustomInput
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

                                    <CustomInput
                                        label="E-Mail"
                                        id="email_id"
                                        name="email_id"
                                        type="email"
                                        value={formData.email_id}
                                        onChange={handleInputChange}
                                        required
                                    />

                                    <CustomComboBox
                                        label="Job Title"
                                        value={formData.job_title}
                                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, job_title: value }))}
                                        placeholder="Type or select job title"
                                        options={jobTitles}
                                        required
                                    />

                                    <CustomComboBox
                                        label="Company Name"
                                        value={formData.company_name}
                                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, company_name: value }))}
                                        placeholder="Type or select company"
                                        options={companies}
                                        required
                                    />
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
                                {/* <CustomSelect
                                    label="Industry"
                                    value={industries.find((industry: { id: number, name: string }) => industry.name === formData.industry)?.id.toString() || formData.industry}
                                    onValueChange={handleIndustryChange}
                                    placeholder="Select Industry"
                                    options={industries}
                                    required
                                />

                                {showCustomIndustry && (
                                    <CustomInput
                                        label="Specify Industry"
                                        id="custom_industry"
                                        name="custom_industry"
                                        type="text"
                                        value={customIndustry}
                                        onChange={handleCustomInputChange}
                                        required
                                    />
                                )} */}

                                <CustomInput
                                    label="Employee Size"
                                    id="employee_size"
                                    name="employee_size"
                                    type="number"
                                    value={formData.employee_size}
                                    onChange={handleInputChange}
                                />

                                <CustomInput
                                    label="Company Turn Over"
                                    id="company_turn_over"
                                    name="company_turn_over"
                                    type="text"
                                    value={formData.company_turn_over}
                                    onChange={handleInputChange}
                                />

                                <CustomInput
                                    label="Phone Number"
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    required
                                />

                                <CustomInput
                                    label="Alternate Phone Number"
                                    id="alternate_mobile_number"
                                    name="alternate_mobile_number"
                                    type="tel"
                                    value={formData.alternate_mobile_number}
                                    onChange={handleInputChange}
                                />

                                <CustomInput
                                    label="Website"
                                    id="website"
                                    name="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                />

                                <CustomInput
                                    label="LinkedIn Profile"
                                    id="linkedin_page_link"
                                    name="linkedin_page_link"
                                    type="url"
                                    value={formData.linkedin_page_link}
                                    onChange={handleInputChange}
                                />

                                <CustomSelectSimple
                                    label="Status"
                                    value={formData.status}
                                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                                    placeholder="Select Status"
                                    options={[
                                        ...roles.map(status => ({ value: status, label: status })),
                                        { value: 'others', label: 'Others' }
                                    ]}
                                    required
                                />

                                <CustomSelectSimple
                                    label="Award Winner"
                                    value={formData.award_winner}
                                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, award_winner: value }))}
                                    placeholder="Select Award Winner Status"
                                    options={[
                                        { value: '1', label: 'Yes' },
                                        { value: '0', label: 'No' }
                                    ]}
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="btn !bg-brand-secondary mt-9 !text-white">
                                Submit
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="bulk">
                        <div className="mt-5 flex justify-between">
                            <span className="font-semibold">Upload File</span>
                            <Button
                                onClick={() => {
                                    // Create sample data with exact fields and sample data
                                    const sampleData = [{
                                        'first_name': 'John',
                                        'last_name': 'Doe',
                                        'job_title': 'CEO',
                                        'company_name': 'Digimantra',
                                        'industry': 'IT',
                                        'email': 'johndoe@example.com',
                                        'phone_number': '8709289369',
                                        'alternate_mobile_number': '7865656575',
                                        'website': 'www.digimantra.com',
                                        'status': 'Speaker',
                                        'employee_size': '200',
                                        'company_turn_over': '5M',
                                        'linkedin_page_link': 'https://linkedin/company/digimantra',
                                        'award_winner': 'YES'
                                    }];

                                    // Create workbook and worksheet
                                    const wb = XLSX.utils.book_new();
                                    const ws = XLSX.utils.json_to_sheet(sampleData);

                                    // Set column widths for better readability
                                    const wscols = [
                                        { wch: 15 }, // first_name
                                        { wch: 15 }, // last_name
                                        { wch: 15 }, // job_title
                                        { wch: 15 }, // company_name
                                        { wch: 15 }, // industry
                                        { wch: 25 }, // email
                                        { wch: 15 }, // phone_number
                                        { wch: 20 }, // alternate_mobile_number
                                        { wch: 20 }, // website
                                        { wch: 15 }, // status
                                        { wch: 15 }, // employee_size
                                        { wch: 20 }, // company_turn_over
                                        { wch: 30 }, // linkedin_page_link
                                        { wch: 15 }  // award_winner
                                    ];
                                    ws['!cols'] = wscols;

                                    // Add worksheet to workbook
                                    XLSX.utils.book_append_sheet(wb, ws, 'Sample Attendees');

                                    // Generate Excel file
                                    const fileName = `attendee_import_template_${new Date().toISOString().split('T')[0]}.xlsx`;
                                    XLSX.writeFile(wb, fileName);

                                    // Show success message
                                    toast('Sample file downloaded successfully!', {
                                        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                                        icon: <CircleCheck className='size-5' />
                                    });
                                }}
                                className="border border-brand-secondary bg-transparent hover:bg-transparent text-brand-secondary rounded-[5px] cursor-pointer h-5 text-sm flex items-center gap-1"
                            >
                                <Download size={13} strokeWidth={1} />
                                Download Sample Excel File
                            </Button>
                        </div>

                        <div className="mt-1.5 w-full">
                            <div {...getRootProps()} className={`border group duration-300 hover:border-brand-primary border-brand-light-gray shadow-blur rounded-lg bg-white p-6 cursor-pointer transition-colors ${isDragActive ? 'border-brand-secondary bg-brand-secondary/10' : 'border-gray-300'}`}>
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                    <FileUp width={24} className="group-hover:stroke-brand-primary duration-300" />
                                    {isDragActive ? (
                                        <p className="text-brand-secondary font-medium">Drop the file here...</p>
                                    ) : (
                                        <>
                                            <p className="text-lg"><span className="text-brand-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                                            <p className="">Supported file: <span className="font-semibold">.csv, .xlsx, .xls (Max 10MB)</span></p>
                                        </>
                                    )}
                                    {bulkFile && (
                                        <div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-md w-full">
                                            <FileText className="size-5 text-brand-secondary" />
                                            <span className="text-sm font-medium truncate">{bulkFile.name}</span>
                                            <span className="text-xs text-gray-500">({(bulkFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-9 flex justify-center">
                                <Button
                                    onClick={handleBulkUpload}
                                    disabled={!bulkFile}
                                    className="btn !bg-brand-secondary !text-white w-[200px] h-9"
                                >
                                    Upload Excel Now
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
};

export default AddAttendee;