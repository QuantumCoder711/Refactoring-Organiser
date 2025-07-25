import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, CircleCheck, CircleX } from "lucide-react";
import { toast } from "sonner";
import GoBack from "@/components/GoBack";
import Wave from "@/components/Wave";
import useAuthStore from "@/store/authStore";
import useEventStore from "@/store/eventStore";
import { domain } from "@/constants";
import axios from "axios";
import { roles } from "@/constants";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useExtrasStore from "@/store/extrasStore";

// Simple Input Component with React.memo to prevent unnecessary re-renders
const CustomInput = React.memo(({ label, id, name, type, value, onChange, required = false, disabled = false }: {
    label: string;
    id: string;
    name: string;
    type: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
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
            required={required}
            disabled={disabled}
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
    required = false,
    disabled = false
}: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
}) => (
    <div className="flex flex-col w-full gap-2">
        <Label className="font-semibold">
            {label} {required && <span className="text-brand-secondary">*</span>}
        </Label>
        <Select
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
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
                        className="w-full capitalize bg-white !h-12 text-base pr-10"
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
                                    <span className="capitalize">{option.name}</span>
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

const EditRequestedAttendee: React.FC = () => {
    const { slug, uuid } = useParams<{ slug: string; uuid: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuthStore(state => state);
    const event = useEventStore(state => state.getEventBySlug(slug));
    const [loading, setLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const {companies, getCompanies, designations, getDesignations} = useExtrasStore(state=>state);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        job_title: '',
        company_name: '',
        email_id: '',
        phone_number: '',
        alternate_mobile_number: '',
        status: '',
        confirmed_status: '',
        reaching_out_status: '',
        follow_up: '',
        managed_by: '',
        remark: '',
    });

    useEffect(()=>{
        getCompanies(formData.company_name);
        getDesignations(formData.job_title);
    }, [formData.company_name, formData.job_title]);

    // Load attendee data
    useEffect(() => {
        const loadAttendeeData = async () => {
            if (!token || !event || !uuid) return;

            try {
                const response = await axios.post(`${domain}/api/requested-attendee/${uuid}`, {}, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });

                if (response.data.status) {
                    const attendee = response.data.data;
                    setFormData({
                        first_name: attendee.first_name || '',
                        last_name: attendee.last_name || '',
                        job_title: attendee.job_title || '',
                        company_name: attendee.company_name || '',
                        email_id: attendee.email_id || '',
                        phone_number: attendee.phone_number || '',
                        alternate_mobile_number: attendee.alternate_mobile_number || '',
                        status: attendee.status || '',
                        confirmed_status: attendee.confirmed_status || '',
                        reaching_out_status: attendee.reaching_out_status || '',
                        follow_up: attendee.follow_up || '',
                        managed_by: attendee.managed_by || '',
                        remark: attendee.remark || '',
                    });
                    setIsDataLoaded(true);
                }
            } catch (error) {
                console.error('Error loading attendee data:', error);
                toast("Failed to load attendee data", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        };

        loadAttendeeData();
    }, [token, event, uuid]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token || !event || !uuid || !user) {
            toast("Authentication or event information missing", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${domain}/api/update-requested-attendee/${uuid}`, {
                ...formData,
                confirmed_status: formData.confirmed_status === 'yes' ? 1 : 0,
                event_id: event.id,
                user_id: user.id
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (response.data.status) {
                navigate(`/all-events/send-invitations/${slug}`);
                toast(response.data.message || "Attendee updated successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            }
        } catch (error: any) {
            console.error('Error updating attendee:', error);
            toast(error.response?.data?.message || "Failed to update attendee", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !isDataLoaded) {
        return <Wave />;
    }

    return (
        <div className="">
            <div className="w-[690px] bg-brand-light-gray p-7 rounded-[10px] mx-auto shadow-blur">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-2xl font-semibold">Edit Requested Attendee</h1>
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

                    <div className="flex gap-3.5 w-full mt-3.5">
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

                    <div className="flex gap-3.5 w-full mt-3.5">
                        <CustomInput
                            label="Email"
                            id="email_id"
                            name="email_id"
                            type="email"
                            value={formData.email_id}
                            onChange={handleInputChange}
                            required
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
                    </div>

                    <div className="flex gap-3.5 w-full mt-3.5">
                        <CustomInput
                            label="Alternate Mobile Number"
                            id="alternate_mobile_number"
                            name="alternate_mobile_number"
                            type="tel"
                            value={formData.alternate_mobile_number}
                            onChange={handleInputChange}
                        />
                        <CustomSelect
                            label="Status"
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                            placeholder="Select Status"
                            options={[
                                { value: 'delegate', label: 'Delegate' },
                                ...roles.filter(role => role.toLowerCase() !== 'delegate')
                                    .map(status => ({
                                        value: status.toLowerCase(),
                                        label: status
                                    }))
                            ]}
                            required
                        />
                    </div>

                    <div className="flex gap-3.5 w-full mt-3.5">
                        <CustomSelect
                            label="Confirmed Status"
                            value={formData.confirmed_status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, confirmed_status: value }))}
                            placeholder="Select Confirmed Status"
                            options={[
                                { value: 'yes', label: 'Yes' },
                                { value: 'no', label: 'No' }
                            ]}
                        />
                        <CustomInput
                            label="Reaching Out Status"
                            id="reaching_out_status"
                            name="reaching_out_status"
                            type="text"
                            value={formData.reaching_out_status}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="flex gap-3.5 w-full mt-3.5">
                        <CustomInput
                            label="Follow Up"
                            id="follow_up"
                            name="follow_up"
                            type="datetime-local"
                            value={formData.follow_up}
                            onChange={handleInputChange}
                            disabled={formData.confirmed_status === 'yes'}
                        />
                        <CustomInput
                            label="Managed By"
                            id="managed_by"
                            name="managed_by"
                            type="text"
                            value={formData.managed_by}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="flex gap-3.5 w-full mt-3.5">
                        <CustomInput
                            label="Remark"
                            id="remark"
                            name="remark"
                            type="text"
                            value={formData.remark}
                            onChange={handleInputChange}
                        />
                    </div>

                    <Button type="submit" disabled={loading} className="btn !bg-brand-secondary mt-9 !text-white">
                        Update
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default EditRequestedAttendee; 