import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CircleCheck, CircleX, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useEventStore from '@/store/eventStore';
import useAgendaStore from '@/store/agendaStore';
import Wave from '@/components/Wave';
import { toast } from 'sonner';
import { beautifyDate } from '@/lib/utils';
import { domain, token } from '@/constants';
import axios from 'axios';
import { AttendeeType } from '@/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FormData {
    title: string;
    description: string;
    tag_speakers: string[];
    event_date: string;
    position: string;
    start_time: string;
    start_time_type: string;
    end_time: string;
    end_time_type: string;
    event_id: number | undefined;
}

interface FormErrors {
    title?: string;
    description?: string;
    event_date?: string;
    position?: string;
    start_time?: string;
    end_time?: string;
    tag_speakers?: string;
}

const EditAgenda: React.FC = () => {
    const { slug, id } = useParams<{ slug: string; id: string }>();
    const navigate = useNavigate();
    const event = useEventStore(state => state.getEventBySlug(slug));
    const { loading, getAgendaById, updateAgenda } = useAgendaStore(state => state);
    const [speakers, setSpeakers] = useState<AttendeeType[]>([]);
    const [formData, setFormData] = useState<FormData>({
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
    const [errors, setErrors] = useState<FormErrors>({});

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

    useEffect(() => {
        const fetchAgenda = async () => {
            if (id) {
                try {
                    const agenda = await getAgendaById(id);
                    if (agenda) {
                        setFormData({
                            title: agenda.title,
                            description: agenda.description,
                            tag_speakers: agenda.tag_speakers ? agenda.tag_speakers.split(',') : [],
                            event_date: agenda.event_date,
                            position: agenda.position?.toString() || '',
                            start_time: `${agenda.start_time}:${agenda.start_minute_time || '00'}`,
                            start_time_type: agenda.start_time_type,
                            end_time: `${agenda.end_time}:${agenda.end_minute_time || '00'}`,
                            end_time_type: agenda.end_time_type,
                            event_id: agenda.event_id
                        });
                    }
                } catch (error) {
                    console.error('Error fetching agenda:', error);
                    toast.error("Failed to fetch agenda details", {
                        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CircleX className='size-5' />
                    });
                }
            }
        };

        fetchAgenda();
    }, [id, getAgendaById]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
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
            setErrors(prev => ({ ...prev, tag_speakers: undefined }));
        }
    };

    const handleRemoveSpeaker = (speakerId: string) => {
        setFormData(prevData => ({
            ...prevData,
            tag_speakers: prevData.tag_speakers.filter(id => id !== speakerId)
        }));
    };

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        // if (formData.tag_speakers.length === 0) {
        //     newErrors.tag_speakers = 'At least one speaker must be tagged';
        // }

        if (!formData.event_date) {
            newErrors.event_date = 'Event date is required';
        }

        if (!formData.position) {
            newErrors.position = 'Priority is required';
        }

        if (!formData.start_time) {
            newErrors.start_time = 'Start time is required';
        }

        if (!formData.end_time) {
            newErrors.end_time = 'End time is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Split time into hours and minutes
            const [startHour, startMinute] = formData.start_time.split(':');
            const [endHour, endMinute] = formData.end_time.split(':');

            const submissionData = {
                ...formData,
                start_time: startHour,
                start_minute_time: startMinute,
                end_time: endHour,
                end_minute_time: endMinute,
                tag_speakers: formData.tag_speakers.join(',')
            };

            const response = await updateAgenda(id!, submissionData);
            if (response.status === 200) {
                toast.success("Agenda updated successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                // Navigate back to agendas list

                navigate(`/all-agendas/${slug}`);
            } else {
                toast.error(response.message || "Failed to update agenda", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            console.error("Error updating agenda:", error);
            toast.error("Failed to update agenda", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    if (loading) {
        return <Wave />
    }

    return (
        <div className='w-full h-full'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <Link to={`/all-agendas/${slug}`}>
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
                        className={`input min-h-[100px] min-w-full text-base ${errors.description ? 'border-red-500' : ''}`}
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                {/* Tag Speakers & Speakers List */}
                <div className="flex gap-5 justify-between">
                    {/* Tagged Speakers */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold">
                            Tagged Speakers
                        </Label>
                        <div className={`bg-white min-h-12 p-2 rounded-md flex flex-wrap gap-2 ${errors.tag_speakers ? 'border border-red-500' : ''}`}>
                            {formData.tag_speakers.map((speakerId) => {
                                const speaker = speakers.find(s => s.id.toString() === speakerId);
                                return (
                                    <span key={speakerId} className="bg-brand-primary/20 capitalize px-2 py-1 rounded flex items-center">
                                        {speaker?.first_name || speaker?.last_name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSpeaker(speakerId)}
                                            className="ml-2 text-gray-500 hover:text-gray-700"
                                        >
                                            <X size={16} className='cursor-pointer'/>
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
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold' htmlFor='position'>
                            Priority <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="position"
                            name='position'
                            type="number"
                            className={`input !h-12 min-w-full text-base ${errors.position ? 'border-red-500' : ''}`}
                            value={formData.position}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.position && <p className="text-red-500 text-sm">{errors.position}</p>}
                    </div>
                </div>

                <div className='flex gap-5 justify-between'>
                    {/* Start Time */}
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
                                    onChange={handleInputChange}
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

                    {/* End Time */}
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
                                    onChange={handleInputChange}
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

                <Button type="submit" className='btn max-w-96 mx-auto mt-7 w-full !h-12'>Update Agenda</Button>
            </form>
        </div>
    )
}

export default EditAgenda;
