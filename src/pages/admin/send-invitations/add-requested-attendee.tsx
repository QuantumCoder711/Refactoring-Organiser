import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, Download, FileText, FileUp } from "lucide-react";
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

const AddRequestedAttendee: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { token, user } = useAuthStore(state => state);
    const { getEventBySlug } = useEventStore(state => state);
    const { companies, jobTitles, loading: extrasLoading } = useExtrasStore();
    const loading = extrasLoading;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showCustomCompany, setShowCustomCompany] = useState(false);
    const [showCustomJobTitle, setShowCustomJobTitle] = useState(false);
    const [customCompany, setCustomCompany] = useState('');
    const [customJobTitle, setCustomJobTitle] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email_id: '',
        phone_number: '',
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

    const handleCompanyChange = useCallback((value: string) => {
        requestAnimationFrame(() => {
            const selectedCompany = companies.find((company: { id: number, name: string }) => company.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                company_name: selectedCompany ? selectedCompany.name : value
            }));
            setShowCustomCompany(value === '439');
            if (value !== '439') {
                setCustomCompany('');
            }
        });
    }, [companies]);

    const handleJobTitleChange = useCallback((value: string) => {
        requestAnimationFrame(() => {
            const selectedJobTitle = jobTitles.find((jobTitle: { id: number, name: string }) => jobTitle.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                job_title: selectedJobTitle ? selectedJobTitle.name : value
            }));
            setShowCustomJobTitle(value === '252');
            if (value !== '252') {
                setCustomJobTitle('');
            }
        });
    }, [jobTitles]);

    const handleCustomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        requestAnimationFrame(() => {
            switch (name) {
                case 'custom_company':
                    setCustomCompany(value);
                    break;
                case 'custom_job_title':
                    setCustomJobTitle(value);
                    break;
            }
        });
    }, []);

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
        const requiredFields = ['first_name', 'last_name', 'email_id', 'company_name', 'status', 'job_title', 'phone_number'];

        // Validate the form
        if (!validateForm(formData, requiredFields)) {
            return;
        }

        // Prepare special fields that need custom handling
        const specialFields: Record<string, any> = {
            company_name: showCustomCompany ? customCompany : formData.company_name,
            job_title: showCustomJobTitle ? customJobTitle : formData.job_title,
        };

        // Create FormData using our utility function
        const finalFormData = createFormData(formData, specialFields);
        finalFormData.append('event_id', String(event.id));
        finalFormData.append('user_id', String(user.id));

        // Ensure we're sending single values for company_name and job_title
        finalFormData.set('company_name', showCustomCompany ? customCompany : formData.company_name);
        finalFormData.set('job_title', showCustomJobTitle ? customJobTitle : formData.job_title);

        // Log the form data
        console.log('Form Data:', {
            ...formData,
            company_name: showCustomCompany ? customCompany : formData.company_name,
            job_title: showCustomJobTitle ? customJobTitle : formData.job_title,
            event_id: event.uuid
        });

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
                                    <CustomInput
                                        label="E-Mail"
                                        id="email_id"
                                        name="email_id"
                                        type="email"
                                        value={formData.email_id}
                                        onChange={handleInputChange}
                                        required
                                    />

                                    <CustomSelect
                                        label="Job Title"
                                        value={jobTitles.find((jobTitle: { id: number, name: string }) => jobTitle.name === formData.job_title)?.id.toString() || formData.job_title}
                                        onValueChange={handleJobTitleChange}
                                        placeholder="Select Job Title"
                                        options={jobTitles}
                                        required
                                    />

                                    {showCustomJobTitle && (
                                        <CustomInput
                                            label="Specify Job Title"
                                            id="custom_job_title"
                                            name="custom_job_title"
                                            type="text"
                                            value={customJobTitle}
                                            onChange={handleCustomInputChange}
                                            required
                                        />
                                    )}

                                    <CustomSelect
                                        label="Company Name"
                                        value={companies.find((company: { id: number, name: string }) => company.name === formData.company_name)?.id.toString() || formData.company_name}
                                        onValueChange={handleCompanyChange}
                                        placeholder="Select Company"
                                        options={companies}
                                        required
                                    />

                                    {showCustomCompany && (
                                        <CustomInput
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

                                <div className="flex flex-col gap-3.5 w-full">
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
                                            { value: 'others', label: 'Others' }
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
                                className="border border-brand-secondary bg-transparent hover:bg-transparent text-brand-secondary rounded-[5px] cursor-pointer h-5 text-sm"
                            >
                                <Download size={13} strokeWidth={1} /> Download Sample Excel CSV Sheet Format
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
    );
};

export default AddRequestedAttendee; 