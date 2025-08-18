import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useEventStore from '@/store/eventStore';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { beautifyDate } from '@/lib/utils';
import { ChevronLeft, CircleCheck, CircleX, X } from 'lucide-react';
import { domain } from '@/constants';
import axios from 'axios';
import { AttendeeType } from '@/types';
import { toast } from 'sonner';
import Wave from '@/components/Wave';
import useAuthStore from '@/store/authStore';

const AddAgenda: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState(false);
    const {token} = useAuthStore(state=>state)
    const event = useEventStore(state => state.getEventBySlug(slug));
    const [speakers, setSpeakers] = useState<AttendeeType[]>([]);

    useEffect(() => {
        if (event?.id) {
            axios.post(`${domain}/api/speaker-attendee/${event.id}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }).then(res => {
                setSpeakers(res.data.data);
            }).catch(error => {
                console.error("Error fetching speakers:", error);
                toast.error("Failed to fetch speakers");
            });
        }
    }, [event?.id]);

    const [formData, setFormData] = useState(() => {
        // Format the event date to YYYY-MM-DD format for the date input
        const formatDate = (dateString?: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        return {
            title: '',
            description: '',
            tag_speakers: [] as string[],
            event_date: formatDate(event?.event_date),
            position: '',
            start_time: '',
            start_time_type: 'PM',
            end_time: '',
            end_time_type: 'PM',
            event_id: event?.id
        };
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, timeType: 'start' | 'end') => {
        const timeValue = e.target.value;
        if (!timeValue) return;

        // Split the time to get hours for AM/PM determination
        const [hours] = timeValue.split(':').map(Number);

        // Determine if it's AM or PM
        const ampm = hours >= 12 ? 'PM' : 'AM';

        setFormData(prevState => ({
            ...prevState,
            [`${timeType}_time`]: timeValue, // Keep 24-hour format for HTML input
            [`${timeType}_time_type`]: ampm
        }));

        // Clear error when user changes time
        if (errors[`${timeType}_time`]) {
            setErrors(prev => ({ ...prev, [`${timeType}_time`]: '' }));
        }
    };

    const handleSpeakerSelect = (value: string) => {
        const selectedSpeaker = speakers.find(speaker => speaker.id.toString() === value);
        if (selectedSpeaker) {
            setFormData(prevData => ({
                ...prevData,
                tag_speakers: [...prevData.tag_speakers, value]
            }));
        }
        // Clear error when user selects a speaker
        if (errors.tag_speakers) {
            setErrors(prev => ({ ...prev, tag_speakers: '' }));
        }
    };

    const handleRemoveSpeaker = (speakerId: string) => {
        setFormData(prevData => ({
            ...prevData,
            tag_speakers: prevData.tag_speakers.filter(id => id !== speakerId)
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Agenda Name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.event_date) newErrors.event_date = "Event Date is required";
        if (!formData.position) newErrors.position = "Position is required";
        if (!formData.start_time) newErrors.start_time = "Start Time is required";
        if (!formData.end_time) newErrors.end_time = "End Time is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            // Convert 24-hour format to 12-hour format for API
            const convertTo12Hour = (time24: string) => {
                const [hours, minutes] = time24.split(':').map(Number);
                const twelveHour = hours % 12 || 12;
                return {
                    hour: twelveHour.toString(),
                    minute: minutes.toString().padStart(2, '0')
                };
            };

            const startTime = convertTo12Hour(formData.start_time);
            const endTime = convertTo12Hour(formData.end_time);

            const submissionData = {
                title: formData.title,
                description: formData.description,
                event_date: formData.event_date,
                start_time: startTime.hour,
                start_minute_time: startTime.minute,
                end_time: endTime.hour,
                end_minute_time: endTime.minute,
                start_time_type: formData.start_time_type,
                end_time_type: formData.end_time_type,
                position: formData.position,
                event_id: formData.event_id,
                tag_speakers: formData.tag_speakers.join(',') || ''
            };

            const response = await axios.post(`${domain}/api/agendas`, submissionData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.data.status === 201) {
                toast.success("Agenda added successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                // Reset form data
                setFormData({
                    title: '',
                    description: '',
                    tag_speakers: [],
                    event_date: '',
                    position: '',
                    start_time: '',
                    start_time_type: 'AM',
                    end_time: '',
                    end_time_type: 'AM',
                    event_id: event?.id
                });
            } else {
                toast.error("Failed to add agenda", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            console.error("Error adding agenda:", error);
            toast.error("Failed to add agenda", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Wave />
    }

    return (
        <div className='w-full h-full'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <Link to={`/all-agendas/${event?.slug}`}>
                        <Button className='btn !bg-brand-background !text-black'><ChevronLeft />Back</Button>
                    </Link>
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className='max-w-3xl flex flex-col gap-5 mt-8 p-8 mx-auto bg-brand-background rounded-[10px] w-full h-full'>
                {/* Agenda Name */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='title'>
                        Agenda Name <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="title"
                        name='title'
                        type="text"
                        className={`input !h-12 min-w-full text-base ${errors.title ? 'border-red-500' : ''}`}
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='description'>
                        Description <span className="text-brand-secondary">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        name='description'
                        className={`input !h-32 min-w-full text-base ${errors.description ? 'border-red-500' : ''}`}
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                {/* Tag Speakers & Speakers List */}
                <div className='flex gap-5 justify-between'>
                    {/* Tagged Speakers */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold">
                            Tagged Speakers
                        </Label>
                        <div className={`bg-white min-h-12 p-2 rounded-md flex flex-wrap gap-2 ${errors.tag_speakers ? 'border border-red-500' : ''}`}>
                            {formData.tag_speakers.map((speakerId) => {
                                const speaker = speakers.find(s => s.id.toString() === speakerId);
                                return (
                                    <span key={speakerId} className="bg-brand-primary/20 px-2 py-1 capitalize rounded flex items-center">
                                        {speaker?.first_name || speaker?.last_name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSpeaker(speakerId)}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                        {errors.tag_speakers && <p className="text-red-500 text-sm">{errors.tag_speakers}</p>}
                    </div>

                    {/* Speakers List */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='speakers_list'>
                            Speakers List
                        </Label>
                        <Select name="speakers_list" onValueChange={handleSpeakerSelect}>
                            <SelectTrigger className="!min-w-full cursor-pointer input capitalize !max-h-12 !h-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {speakers
                                    .filter(speaker => !formData.tag_speakers.includes(speaker.id.toString()))
                                    .map((speaker) => (
                                        <SelectItem key={speaker.id} className='cursor-pointer capitalize' value={speaker.id.toString()}>
                                            {speaker?.first_name || speaker?.last_name}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Event Date and Priority */}
                <div className='flex gap-5 justify-between'>
                    {/* Event Date */}
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold' htmlFor='event_date'>
                            Event Date <span className="text-brand-secondary">*</span>
                        </Label>

                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            <div className={`bg-brand-light h-full w-full relative rounded-md border-white ${errors.event_date ? 'border border-red-500' : ''}`}>
                                <Input
                                    type='date'
                                    name='event_date'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    value={formData.event_date}
                                    onChange={handleInputChange}
                                    required
                                />
                                <p className='h-full px-3 flex items-center'>{formData.event_date ? beautifyDate(new Date(formData.event_date)) : 'Select Date'}</p>
                            </div>
                        </div>
                        {errors.event_date && <p className="text-red-500 text-sm">{errors.event_date}</p>}
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='position'>
                            Position <span className="text-brand-secondary">*</span>
                        </Label>
                        <Select name="position" onValueChange={(value) => handleInputChange({ target: { name: 'position', value } } as React.ChangeEvent<HTMLSelectElement>)} required>
                            <SelectTrigger className={`!min-w-full cursor-pointer input !h-full ${errors.position ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Position" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(100)].map((_, i) => (
                                    <SelectItem key={i} className='cursor-pointer' value={`${i + 1}`}>{i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                    </div>
                </div>
                {/* Start Time & End Time */}
                <div className='flex gap-5 justify-between'>
                    {/* For Start Time */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='start_time'>
                            Start Time <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            <div className={`bg-brand-light h-full w-full relative rounded-md ${errors.start_time ? 'border border-red-500' : ''}`}>
                                <Input
                                    type='time'
                                    name='start_time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    value={formData.start_time}
                                    onChange={(e) => handleTimeChange(e, 'start')}
                                    required
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {formData.start_time ?
                                        new Date(`2000-01-01T${formData.start_time}`).toLocaleTimeString('en-US',
                                            { hour: 'numeric', minute: '2-digit', hour12: true })
                                        : 'Select Start Time'}
                                </p>
                            </div>
                        </div>
                        {errors.start_time && <p className="text-red-500 text-sm">{errors.start_time}</p>}
                    </div>

                    {/* For End Time */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='end_time'>
                            End Time <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            <div className={`bg-brand-light h-full w-full relative rounded-md ${errors.end_time ? 'border border-red-500' : ''}`}>
                                <Input
                                    type='time'
                                    name='end_time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    value={formData.end_time}
                                    onChange={(e) => handleTimeChange(e, 'end')}
                                    required
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {formData.end_time ?
                                        new Date(`2000-01-01T${formData.end_time}`).toLocaleTimeString('en-US',
                                            { hour: 'numeric', minute: '2-digit', hour12: true })
                                        : 'Select End Time'}
                                </p>
                            </div>
                        </div>
                        {errors.end_time && <p className="text-red-500 text-sm">{errors.end_time}</p>}
                    </div>
                </div>

                <Button type="submit" className='btn max-w-96 mx-auto mt-7 w-full !h-12'>Add Agenda</Button>
            </form>
        </div>
    )
}

export default AddAgenda;