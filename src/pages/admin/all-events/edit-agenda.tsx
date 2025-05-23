import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useEventStore from '@/store/eventStore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { beautifyDate } from '@/lib/utils';
import { CircleCheck, CircleX, X } from 'lucide-react';
import useAgendaStore from '@/store/agendaStore';
import { domain, token } from '@/constants';
import axios from 'axios';
import { AgendaType, AttendeeType } from '@/types';
import { toast } from 'sonner';
import Wave from '@/components/Wave';

const EditAgenda: React.FC = () => {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [speakers, setSpeakers] = useState<AttendeeType[]>([]);
    // const { getAgendaByUuid, updateAgenda } = useAgendaStore();
    const [agenda, setAgenda] = useState<AgendaType | null>(null);
    const [event, setEvent] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tagged_speakers: [] as string[],
        speakers_list: '',
        event_date: '',
        priority: '',
        start_time: '',
        start_time_type: 'AM',
        end_time: '',
        end_time_type: 'AM',
        event_id: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch events first if not already loaded
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Get token from localStorage
                const tokenData = localStorage.getItem("klout-organiser-storage");
                const authToken = tokenData ? JSON.parse(tokenData).state.token : null;

                if (authToken && useEventStore.getState().events.length === 0) {
                    await useEventStore.getState().getAllEvents(authToken);
                    console.log("Events loaded successfully");
                }
            } catch (error) {
                console.error("Error loading events:", error);
            }
        };

        fetchEvents();
    }, []);

    // Fetch agenda data
    useEffect(() => {
        if (uuid) {
            const fetchAgenda = async () => {
                try {
                    console.log("Fetching agenda with UUID:", uuid);

                    // Direct API call to debug
                    const response = await axios.get(`${domain}/api/agendas/${uuid}`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        }
                    });

                    console.log("API Response:", response.data);

                    // Log the full response structure for debugging
                    console.log("Full API response structure:", JSON.stringify(response.data, null, 2));

                    // Check different possible response structures
                    let agendaData;
                    if (response.data && response.data.status === 200 && response.data.data) {
                        // Standard response structure
                        console.log("Using standard response structure");
                        agendaData = response.data.data;
                    } else if (response.data && response.data.uuid) {
                        // Direct data structure
                        console.log("Using direct data structure");
                        agendaData = response.data;
                    } else if (response.data && typeof response.data === 'object') {
                        // Try to use the response directly
                        console.log("Using response directly");
                        agendaData = response.data;
                    } else {
                        console.error("Unexpected API response structure:", response.data);
                        toast.error("Failed to parse agenda data");
                        setLoading(false);
                        return;
                    }

                    console.log("Parsed agenda data:", agendaData);
                    setAgenda(agendaData);

                    // Get event details
                    const events = useEventStore.getState().events;
                    console.log("Available events:", events);

                    const eventData = events.find(e => e.id === agendaData.event_id);
                    console.log("Found event:", eventData);

                    setEvent(eventData || { title: "Event" });

                    // Parse tagged speakers from string to array
                    // Check for different possible field names
                    const tagSpeakersField = agendaData.tag_speakers || agendaData.tagged_speakers || '';
                    console.log("Tag speakers field:", tagSpeakersField);

                    const taggedSpeakersArray = tagSpeakersField ?
                        (typeof tagSpeakersField === 'string' ? tagSpeakersField.split(',') : []) : [];

                    console.log("Tagged speakers array:", taggedSpeakersArray);

                    // Set form data with all possible field mappings
                    const formDataToSet = {
                        title: agendaData.title || '',
                        description: agendaData.description || '',
                        tagged_speakers: taggedSpeakersArray,
                        speakers_list: '',
                        event_date: agendaData.event_date || '',
                        priority: (agendaData.position || agendaData.priority)?.toString() || '',
                        start_time: agendaData.start_time || '',
                        start_time_type: agendaData.start_time_type || 'AM',
                        end_time: agendaData.end_time || '',
                        end_time_type: agendaData.end_time_type || 'AM',
                        event_id: agendaData.event_id
                    };

                    console.log("Setting form data:", formDataToSet);
                    setFormData(formDataToSet);

                    console.log("Form data set:", {
                        title: agendaData.title || '',
                        description: agendaData.description || '',
                        tagged_speakers: taggedSpeakersArray,
                        event_date: agendaData.event_date || '',
                        priority: (agendaData.position || agendaData.priority)?.toString() || '',
                        start_time: agendaData.start_time || '',
                        end_time: agendaData.end_time || '',
                    });

                    // Fetch speakers for this event
                    if (agendaData.event_id) {
                        fetchSpeakers(agendaData.event_id);
                    }
                } catch (error) {
                    console.error("Error fetching agenda:", error);
                    toast.error("Failed to fetch agenda details");
                    navigate(-1);
                } finally {
                    setLoading(false);
                }
            };

            fetchAgenda();
        } else {
            setLoading(false);
        }
    }, [uuid, navigate]);

    const fetchSpeakers = (eventId: number) => {
        axios.post(`${domain}/api/speaker-attendee/${eventId}`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(res => {
            setSpeakers(res.data.data);
        }).catch(error => {
            console.error("Error fetching speakers:", error);
            toast.error("Failed to fetch speakers");
        });
    };

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

    const handleSpeakerSelect = (value: string) => {
        setFormData(prevData => ({
            ...prevData,
            tagged_speakers: [...prevData.tagged_speakers, value],
            speakers_list: value
        }));
        // Clear error when user selects a speaker
        if (errors.tagged_speakers) {
            setErrors(prev => ({ ...prev, tagged_speakers: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Agenda Name is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (formData.tagged_speakers.length === 0) newErrors.tagged_speakers = "At least one speaker must be tagged";
        if (!formData.event_date) newErrors.event_date = "Event Date is required";
        if (!formData.priority) newErrors.priority = "Priority is required";
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
            const submissionData = {
                ...formData,
                tagged_speakers: formData.tagged_speakers.join(','),
                start_time_type: formData.start_time_type || 'AM',
                end_time_type: formData.end_time_type || 'AM'
            };

            console.log("Submitting data:", submissionData);

            // Create FormData object for multipart/form-data
            const formDataObj = new FormData();

            // Add all fields to the FormData object
            Object.entries(submissionData).forEach(([key, value]) => {
                formDataObj.append(key, value as string);
            });

            // Add _method: PUT for Laravel API
            formDataObj.append('_method', 'PUT');

            console.log("Form data being sent:", Object.fromEntries(formDataObj.entries()));

            // Direct API call to ensure it works
            const response = await axios.post(`${domain}/api/agendas/${uuid}`,
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            console.log("Update response:", response.data);

            if (response.data && response.data.status === 200) {
                toast.success("Agenda updated successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                // Navigate back
                navigate(-1);
            } else {
                toast.error(response.data?.message || "Failed to update agenda", {
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
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title} - Edit Agenda</h1>
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
                            Tagged Speakers <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className={`bg-white min-h-12 p-2 rounded-md flex flex-wrap gap-2 ${errors.tagged_speakers ? 'border border-red-500' : ''}`}>
                            {formData.tagged_speakers.map((speaker, index) => (
                                <span key={index} className="bg-brand-primary/20 px-2 py-1 rounded flex items-center">
                                    {speaker}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prevData => ({
                                                ...prevData,
                                                tagged_speakers: prevData.tagged_speakers.filter((_, i) => i !== index)
                                            }));
                                        }}
                                        className="ml-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        {errors.tagged_speakers && <p className="text-red-500 text-sm">{errors.tagged_speakers}</p>}
                    </div>

                    {/* Speakers List */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='speakers_list'>
                            Speakers List <span className="text-brand-secondary">*</span>
                        </Label>
                        <Select name="speakers_list" onValueChange={handleSpeakerSelect}>
                            <SelectTrigger className="!min-w-full cursor-pointer input !max-h-12 !h-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {speakers
                                    .filter(speaker => !formData.tagged_speakers.includes(speaker.first_name || speaker.last_name))
                                    .map((speaker) => (
                                        <SelectItem key={speaker.id} className='cursor-pointer' value={speaker.first_name || speaker.last_name}>
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
                        <Label className="font-semibold" htmlFor='priority'>
                            Priority <span className="text-brand-secondary">*</span>
                        </Label>
                        <Select
                            name="priority"
                            value={formData.priority}
                            onValueChange={(value) => handleInputChange({ target: { name: 'priority', value } } as React.ChangeEvent<HTMLSelectElement>)}
                            required
                        >
                            <SelectTrigger className={`!min-w-full cursor-pointer input !h-full ${errors.priority ? 'border-red-500' : ''}`}>
                                <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(100)].map((_, i) => (
                                    <SelectItem key={i} className='cursor-pointer' value={`${i + 1}`}>{i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}
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
