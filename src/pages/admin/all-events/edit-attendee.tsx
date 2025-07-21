import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { getImageUrl } from "@/lib/utils";

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

// Add custom function for image URL
// const getImageUrl = (imageUrl: string | null): string => {
//     if (!imageUrl) return UserAvatar;
//     return `${imageUrl}`;
// };

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

const EditAttendee: React.FC = () => {
    const { slug, uuid } = useParams<{ slug: string; uuid: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { getEventBySlug } = useEventStore(state => state);
    const { companies, jobTitles, industries, loading: extrasLoading } = useExtrasStore();
    const { updateAttendee, loading: attendeeLoading, singleEventAttendees, getSingleEventAttendees } = useAttendeeStore();
    const loading = extrasLoading || attendeeLoading;
    const [showCustomIndustry, setShowCustomIndustry] = useState(false);
    const [customIndustry, setCustomIndustry] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
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
        image: null as File | string | null,
        alternate_mobile_number: '',
        alternate_email: '',
        company_name: '',
        industry: '',
        job_title: '',
        award_winner: '0',
    });

    const event = getEventBySlug(slug);

    // Load attendee data
    useEffect(() => {
        const loadAttendeeData = async () => {
            if (!token || !event || !uuid) return;
            
            try {
                await getSingleEventAttendees(token, event.uuid);
            } catch (error) {
                console.error('Error loading attendee data:', error);
                toast("Failed to load attendee data", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        };

        loadAttendeeData();
    }, [token, event, uuid, getSingleEventAttendees]);

    // Set form data when attendee data is available
    useEffect(() => {
        if (uuid && singleEventAttendees.length > 0) {
            const attendee = singleEventAttendees.find(a => a.uuid === uuid);
            if (attendee) {
                // Convert status to lowercase for consistent matching
                const statusValue = attendee.status ? attendee.status.toLowerCase() : 'delegate';
                setFormData({
                    first_name: attendee.first_name || '',
                    last_name: attendee.last_name || '',
                    email_id: attendee.email_id || '',
                    phone_number: attendee.phone_number || '',
                    website: attendee.website || '',
                    linkedin_page_link: attendee.linkedin_page_link || '',
                    employee_size: attendee.employee_size || '',
                    company_turn_over: attendee.company_turn_over || '',
                    status: statusValue,
                    image: attendee.image || null,
                    alternate_mobile_number: attendee.alternate_mobile_number || '',
                    alternate_email: attendee.alternate_email || '',
                    company_name: attendee.company_name || '',
                    industry: attendee.industry || '',
                    job_title: attendee.job_title || '',
                    award_winner: attendee.award_winner?.toString() || '0',
                });



                // Handle industry dropdown
                const industryMatch = industries.find(i => i.name.toLowerCase() === (attendee.industry || '').toLowerCase());
                if (industryMatch) {
                    setFormData(prev => ({ ...prev, industry: industryMatch.name }));
                    setShowCustomIndustry(false);
                } else if (attendee.industry) {
                    setShowCustomIndustry(true);
                    setCustomIndustry(attendee.industry);
                }

                setIsDataLoaded(true);
            }
        }
    }, [uuid, singleEventAttendees, companies, jobTitles, industries]);

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token || !event || !uuid) {
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

        // Log the initial form data
        console.log('Initial form data:', formData);

        // Create a new object with single values
        const processedFormData = {
            ...formData,
            status: Array.isArray(formData.status) ? formData.status[0] : formData.status,
            company_name: Array.isArray(formData.company_name) ? formData.company_name[0] : formData.company_name,
            industry: Array.isArray(formData.industry) ? formData.industry[0] : formData.industry,
            job_title: Array.isArray(formData.job_title) ? formData.job_title[0] : formData.job_title
        };

        // Log the processed form data
        console.log('Processed form data:', processedFormData);

        // Prepare special fields that need custom handling
        const specialFields: Record<string, any> = {
            company_name: processedFormData.company_name,
            job_title: processedFormData.job_title,
            industry: showCustomIndustry ? customIndustry : processedFormData.industry,
            image: processedFormData.image,
            status: processedFormData.status.toLowerCase() // Ensure status is lowercase
        };

        // Create FormData using our utility function
        const finalFormData = createFormData(processedFormData, specialFields);
        finalFormData.append('event_id', event.id.toString());
        finalFormData.append('_method', 'PUT');

        // Log the final form data
        console.log('Final form data entries:');
        for (let [key, value] of finalFormData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const response = await updateAttendee(token, uuid, event.uuid, finalFormData);

            if (response.status === 200) {
                navigate(`/all-events/attendees/${slug}`);
                toast(response.message || "Attendee updated successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(response.message || "Failed to update attendee", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            console.error('Error updating attendee:', error);

            let errorMessage = "Error updating attendee";

            if (error.response && error.response.data) {
                if (error.response.status === 422 && error.response.data.errors) {
                    Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                        const fieldMessages = Array.isArray(messages) ? messages.join(', ') : String(messages);
                        toast(`${field.replace('_', ' ')}: ${fieldMessages}`, {
                            className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <CircleX className='size-5' />
                        });
                    });
                    return;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }

            toast(errorMessage, {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    }

    if (loading || !isDataLoaded) {
        return <Wave />
    }

    return (
        <div className="">
            <div className="w-[690px] bg-brand-light-gray p-7 rounded-[10px] mx-auto shadow-blur">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-2xl font-semibold">Edit Attendee Details</h1>
                    <GoBack />
                </div>

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
                                    <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                        {formData.image instanceof File ? formData.image.name : formData.image ? 'Image Selected' : 'No file Chosen'}
                                    </p>
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
                                    <img 
                                        src={
                                            formData.image instanceof File 
                                                ? URL.createObjectURL(formData.image) 
                                                : getImageUrl(formData.image as string)
                                        } 
                                        alt="Attendee Image" 
                                        className="rounded-md object-cover w-full h-full" 
                                    />
                                </AspectRatio>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3.5 flex-col mt-2.5 w-full">

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
                            value={formData.status.toLowerCase()}
                            onValueChange={(value: string) => {
                                setFormData(prev => ({ ...prev, status: value.toLowerCase() }));
                            }}
                            placeholder="Select Status"
                            options={[
                                { value: 'delegate', label: 'Delegate' },
                                ...roles.filter(role => role.toLowerCase() !== 'delegate')
                                    .map(status => ({ 
                                        value: status.toLowerCase(), 
                                        label: status 
                                    })),
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
                        Update
                    </Button>
                </form>
            </div>
        </div>
    )
};

export default EditAttendee;