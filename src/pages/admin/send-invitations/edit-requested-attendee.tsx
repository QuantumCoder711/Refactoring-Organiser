import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleCheck, CircleX } from "lucide-react";
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

const EditRequestedAttendee: React.FC = () => {
    const { slug, uuid } = useParams<{ slug: string; uuid: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuthStore(state => state);
    const event = useEventStore(state => state.getEventBySlug(slug));
    const [loading, setLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

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
                        <CustomInput
                            label="Job Title"
                            id="job_title"
                            name="job_title"
                            type="text"
                            value={formData.job_title}
                            onChange={handleInputChange}
                            required
                        />
                        <CustomInput
                            label="Company Name"
                            id="company_name"
                            name="company_name"
                            type="text"
                            value={formData.company_name}
                            onChange={handleInputChange}
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