import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, CircleCheck, CircleX, Download, FileText, FileUp } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { domain, roles } from "@/constants";
import useExtrasStore from "@/store/extrasStore";
import useAuthStore from "@/store/authStore";
import useEventStore from "@/store/eventStore";
import Wave from "@/components/Wave";
import axios from "axios";
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
            {label} {required && <span className="text-secondary">*</span>}
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
    const [selectedIndex, setSelectedIndex] = useState(-1);
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
        setSelectedIndex(-1); // Reset selected index
        onValueChange(newValue);
    };

    // Handle key down for navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (isOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prevIndex) =>
                    prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
                    handleOptionSelect(filteredOptions[selectedIndex]);
                }
            }
        }
    };

    // Handle option selection
    const handleOptionSelect = (option: { id: number; name: string }) => {
        setInputValue(option.name);
        setSearchTerm('');
        setIsOpen(false);
        setSelectedIndex(-1); // Reset selected index
        onValueChange(option.name);
        inputRef.current?.blur();
    };

    // Handle creating new option
    const handleCreateNew = () => {
        setInputValue(searchTerm);
        setIsOpen(false);
        setSelectedIndex(-1); // Reset selected index
        onValueChange(searchTerm);
        inputRef.current?.blur();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setSelectedIndex(-1); // Reset selected index
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update input value when value prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    // Scroll to selected option
    useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedOption = dropdownRef.current.querySelectorAll('.option')[selectedIndex];
            if (selectedOption) {
                selectedOption.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <div className="flex gap-2 flex-col w-full" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-secondary">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full capitalize !h-12 !text-sm pr-10"
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
                    <div className="absolute z-50 w-full mt-1 bg-background/70 border backdrop-blur-xl rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`px-3 py-2 cursor-pointer hover:bg-accent flex items-center justify-between text-sm ${selectedIndex === index ? 'bg-accent' : ''} option`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <span className="capitalize">{option.name}</span>
                                    {inputValue === option.name && (
                                        <Check className="size-4 min-w-4 min-h-4 text-secondary" />
                                    )}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm font-medium"
                                onClick={handleCreateNew}
                            >
                                {searchTerm}
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
            {label} {required && <span className="text-secondary">*</span>}
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

const AddRequestedAttendee: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { token, user } = useAuthStore(state => state);
    const { getEventBySlug } = useEventStore(state => state);
    const { companies, designations, getDesignations, getCompanies, loading } = useExtrasStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email_id: '',
        phone_number: '',
        country_code: '',  // Add this line
        linkedin_url: '',
        status: '',
        alternate_mobile_number: '',
        company_name: '',
        job_title: '',
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

    // Handlers with cursor position preservation
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, selectionStart } = e.target;

        // Store the cursor position
        const cursorPosition = selectionStart;

        // Update the form data
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Restore cursor position after state update
        requestAnimationFrame(() => {
            const input = e.target;
            if (input) {
                input.setSelectionRange(cursorPosition, cursorPosition);
            }
        });
    }, []);

    useEffect(() => {
        getCompanies(formData.company_name);
        getDesignations(formData.job_title);
    }, [formData.company_name, formData.job_title]);

    const handleBulkUpload = async () => {
        if (!bulkFile) {
            toast("Please select a file to upload", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!event || !user) return;

        setIsLoading(true);

        const formData = new FormData();
        formData.append('excel_file', bulkFile);
        formData.append('event_id', String(event.id));
        formData.append('user_id', String(user.id));

        try {
            // TODO: Replace with your API endpoint
            const response = await axios.post(`${domain}/api/bulk-upload-requested-attendee`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.data.status) {
                toast(response.data.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                setBulkFile(null);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            toast(error.data.message || "Failed to upload file", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        if (!token || !event || !user) {
            toast("Authentication or event information missing", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // Define required fields
        const requiredFields = ['first_name', 'last_name', 'email_id', 'company_name', 'status', 'job_title', 'phone_number', 'country_code'];

        // Validate the form
        if (!validateForm(formData, requiredFields)) {
            setIsLoading(false);
            return;
        }

        // Create FormData using our utility function
        const finalFormData = createFormData(formData);
        finalFormData.append('event_id', String(event.id));
        finalFormData.append('user_id', String(user.id));

        try {
            const response = await axios.post(
                `${domain}/api/request-attendees`,
                finalFormData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === 200) {
                setFormData({
                    first_name: '',
                    last_name: '',
                    email_id: '',
                    phone_number: '',
                    country_code: '+1',  // Add this line
                    linkedin_url: '',
                    status: '',
                    alternate_mobile_number: '',
                    company_name: '',
                    job_title: '',
                });
                toast(response.data.message || "Attendee added successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            toast(error.response?.data?.message || error.message || "Failed to add attendee", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false)
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setBulkFile(acceptedFiles[0]);
        }
    }, []);

    const downloadSampleFile = () => {
        const sampleData = [
            {
                first_name: 'John',
                last_name: 'Doe',
                email_id: 'john.doe@example.com',
                country_code: '+1',  // Add this line
                phone_number: '1234567890',
                status: 'Delegate',
                alternate_mobile_number: '9876543210',
                alternate_email: 'john.doe2@example.com',
                company_name: 'Google',
                job_title: 'Software Engineer',
                linkedin_url: 'https://linkedin.com/in/johndoe'
            },
            {
                first_name: 'Jane',
                last_name: 'Smith',
                email_id: 'jane.smith@example.com',
                country_code: '+44',  // Add this line
                phone_number: '9876543210',
                status: 'Delegate',
                alternate_mobile_number: '',
                alternate_email: 'jane.smith2@example.com',
                company_name: 'Meta',
                job_title: 'Product Manager',
                linkedin_url: 'https://linkedin.com/in/janesmith',
            }
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sampleData);
        XLSX.utils.book_append_sheet(wb, ws, 'Sample Attendees');
        XLSX.writeFile(wb, 'sample_attendees_import.xlsx');
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    if (loading || isLoading) return <Wave />;

    return (
        <div className="">
            <div className='flex items-center gap-5 mb-5'>
                <GoBack />
                <h1 className='text-xl font-semibold'>{event?.title}</h1>
            </div>

            <div className="max-w-[690px] bg-muted p-5 lg:p-7 rounded-[10px] mx-auto shadow-blur">
                <Tabs defaultValue="single" className="mx-auto">
                    <TabsList className="bg-background/50 p-0 max-w-[390px] mx-auto !max-h-9">
                        <TabsTrigger
                            value="single"
                            className="cursor-pointer"
                        >
                            Add Attendee
                        </TabsTrigger>
                        <TabsTrigger
                            value="bulk"
                            className="cursor-pointer"
                        >
                            Bulk Upload
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="single" className="mt-5">
                        <form onSubmit={handleSubmit} className="max-w-[620px] mx-auto text-center">
                            <div className="flex flex-col sm:flex-row gap-3.5 w-full">
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

                            <div className="flex flex-col sm:flex-row gap-3.5 mt-3.5 w-full">
                                <div className="flex flex-col gap-3.5 w-full">
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
                                        onValueChange={(value: string) => {
                                            setFormData(prev => ({ ...prev, job_title: value }))
                                        }}
                                        placeholder="Select Job Title"
                                        options={designations.map((designation, index) => ({ id: index + 1, name: designation.designation }))}
                                        required
                                    />

                                    <CustomComboBox
                                        label="Company Name"
                                        value={formData.company_name}
                                        onValueChange={(value: string) => {
                                            setFormData(prev => ({ ...prev, company_name: value }))
                                        }}
                                        placeholder="Select Company"
                                        options={companies.map((company, index) => ({ id: index + 1, name: company.company }))}
                                        required
                                    />
                                </div>

                                <div className="flex flex-col gap-3.5 w-full">
                                    <div className="flex gap-2 w-full">
                                        <div className="w-32">
                                        <CustomInput
                                                label="Country Code"
                                                id="country_code"
                                                name="country_code"
                                                type="text"
                                                value={formData.country_code}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="w-2/3">
                                            <CustomInput
                                                label="Phone Number"
                                                id="phone_number"
                                                name="phone_number"
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <CustomInput
                                        label="Alternate Phone Number"
                                        id="alternate_mobile_number"
                                        name="alternate_mobile_number"
                                        type="tel"
                                        value={formData.alternate_mobile_number}
                                        onChange={handleInputChange}
                                    />

                                    <CustomInput
                                        label="LinkedIn Profile"
                                        id="linkedin_url"
                                        name="linkedin_url"
                                        type="url"
                                        value={formData.linkedin_url}
                                        onChange={handleInputChange}
                                    />

                                    <CustomSelectSimple
                                        label="Status"
                                        value={formData.status}
                                        onValueChange={(value: string) => setFormData(prev => ({ ...prev, status: value }))}
                                        placeholder="Select Status"
                                        options={[
                                            ...roles.map(status => ({ value: status, label: status })),
                                        ]}
                                        required
                                    />
                                </div>
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
                                onClick={downloadSampleFile}
                                size="sm"
                            >
                                <Download size={20} /> Download Sample
                            </Button>
                        </div>

                        <div className="mt-1.5 w-full">
                            <div {...getRootProps()} className={`border group duration-300 hover:border-primary bg-background/50 border-accent shadow-blur rounded-lg p-6 cursor-pointer transition-colors ${isDragActive ? 'border-secondary bg-secondary/10' : 'border-accent'}`}>
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                    <FileUp width={24} className="group-hover:stroke-primary duration-300" />
                                    {isDragActive ? (
                                        <p className="text-secondary font-medium">Drop the file here...</p>
                                    ) : (
                                        <>
                                            <p className="text-lg"><span className="text-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                                            <p className="">Supported file: <span className="font-semibold">.csv, .xlsx, .xls (Max 10MB)</span></p>
                                        </>
                                    )}
                                    {bulkFile && (
                                        <div className="mt-4 flex items-center gap-2 p-2 bg-muted rounded-md w-full">
                                            <FileText className="size-5 text-secondary" />
                                            <span className="text-sm font-medium truncate">{bulkFile.name}</span>
                                            <span className="text-xs text-muted">({(bulkFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-9 flex justify-center">
                                <Button
                                    onClick={handleBulkUpload}
                                    disabled={!bulkFile}
                                >
                                    Upload Excel Now
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AddRequestedAttendee;