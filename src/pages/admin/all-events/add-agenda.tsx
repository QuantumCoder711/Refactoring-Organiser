import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useEventStore from '@/store/eventStore';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { beautifyDate } from '@/lib/utils';
import { X } from 'lucide-react';
import useAgendaStore from '@/store/agendaStore';

const AddAgenda: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const event = useEventStore(state => state.getEventBySlug(slug));

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tagged_speakers: [] as string[],
        speakers_list: '',
        event_date: '',
        priority: '',
        start_time: '',
        start_time_type: '',
        end_time: '',
        end_time_type: '',
        event_id: event?.id,
        tag_speakers: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSpeakerSelect = (value: string) => {
        setFormData(prevData => ({
            ...prevData,
            tagged_speakers: [...prevData.tagged_speakers, value],
            speakers_list: value
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Here you can add logic to send the data to your backend or perform other actions
    };

    return (
        <div className='w-full h-full'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <GoBack />
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
                        className='input !h-12 min-w-full text-base'
                        value={formData.title}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='description'>
                        Description <span className="text-brand-secondary">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        name='description'
                        className='input !h-32 min-w-full text-base'
                        value={formData.description}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Tag Speakers & Speakers List */}
                <div className='flex gap-5 justify-between'>
                    {/* Tagged Speakers */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold">
                            Tagged Speakers <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className="bg-white min-h-12 p-2 rounded-md flex flex-wrap gap-2">
                            {formData.tagged_speakers.map((speaker, index) => (
                                <span key={index} className="bg-brand-primary/20 px-2 py-1 rounded flex items-center">
                                    {speaker}
                                    <button
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
                                {["Speaker 1", "Speaker 2", "Speaker 3"].filter(speaker => !formData.tagged_speakers.includes(speaker)).map((speaker) => (
                                    <SelectItem key={speaker} className='cursor-pointer' value={speaker}>{speaker}</SelectItem>
                                ))}
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
                            <div className='bg-brand-light h-full w-full relative rounded-md border-white'>
                                <Input
                                    type='date'
                                    name='event_date'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    value={formData.event_date}
                                    onChange={handleInputChange}
                                />
                                <p className='h-full px-3 flex items-center'>{formData.event_date ? beautifyDate(new Date(formData.event_date)) : 'Select Date'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='priority'>
                            Priority <span className="text-brand-secondary">*</span>
                        </Label>
                        <Select name="priority" onValueChange={(value) => handleInputChange({ target: { name: 'priority', value } } as React.ChangeEvent<HTMLSelectElement>)}>
                            <SelectTrigger className="!min-w-full cursor-pointer input !h-full">
                                <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(100)].map((_, i) => (
                                    <SelectItem key={i} className='cursor-pointer' value={`${i + 1}`}>{i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                            <div className='bg-brand-light h-full w-full relative rounded-md'>
                                <Input
                                    type='time'
                                    name='start_time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    value={formData.start_time}
                                    onChange={handleInputChange}
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {formData.start_time ?
                                        new Date(`2000-01-01T${formData.start_time}`).toLocaleTimeString('en-US',
                                            { hour: 'numeric', minute: '2-digit', hour12: true })
                                        : 'Select Start Time'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* For End Time */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='end_time'>
                            End Time <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            <div className='bg-brand-light h-full w-full relative rounded-md'>
                                <Input
                                    type='time'
                                    name='end_time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {formData.end_time ?
                                        new Date(`2000-01-01T${formData.end_time}`).toLocaleTimeString('en-US',
                                            { hour: 'numeric', minute: '2-digit', hour12: true })
                                        : 'Select End Time'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button type="submit" className='btn max-w-96 mx-auto mt-7 w-full !h-12'>Add Agenda</Button>
            </form>
        </div>
    )
}

export default AddAgenda;