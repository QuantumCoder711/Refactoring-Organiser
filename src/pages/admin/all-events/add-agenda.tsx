import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useEventStore from '@/store/eventStore';
import React from 'react';
import { useParams } from 'react-router-dom';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { beautifyDate } from '@/lib/utils';

const AddAgenda: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const event = useEventStore(state => state.getEventBySlug(slug));

    return (
        <div className='w-full h-full'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-5'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>{event?.title}</h1>
                </div>
            </div>

            <div className='max-w-3xl flex flex-col gap-5 mt-8 p-8 mx-auto bg-brand-background rounded-[10px] w-full h-full'>
                {/* Agenda Name */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='agenda_name'>
                        Agenda Name <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="agenda_name"
                        name='agenda_name'
                        type="text"
                        className='input !h-12 min-w-full text-base'
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
                    />
                </div>

                {/* Tag Speakers & Speakers List */}
                <div className='flex gap-5 justify-between'>

                    {/* Speakers List */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='tagged_speakers'>
                            Tagged Speakers <span className="text-brand-secondary">*</span>
                        </Label>
                        <div
                            id="tagged_speakers"
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>

                    {/* Speakers List */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='tagged_speakers'>
                            Speakers List <span className="text-brand-secondary">*</span>
                        </Label>
                        <Select>
                            <SelectTrigger className="!min-w-full cursor-pointer input !h-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className='cursor-pointer' value="light">Light</SelectItem>
                                <SelectItem className='cursor-pointer' value="dark">Dark</SelectItem>
                                <SelectItem className='cursor-pointer' value="system">System</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* Event Date and Priority */}
                <div className='flex gap-5 justify-between'>
                    {/* Event Date */}
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold'>
                            Event Date <span className="text-brand-secondary">*</span>
                        </Label>

                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            {/* For Date */}
                            <div className='bg-brand-light h-full w-full relative rounded-md border-white'>
                                <Input
                                    type='date'
                                    name='event_start_date'
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center'>{beautifyDate(new Date())}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='tagged_speakers'>
                            Speakers List <span className="text-brand-secondary">*</span>
                        </Label>
                        <Select>
                            <SelectTrigger className="!min-w-full cursor-pointer input !h-full">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className='cursor-pointer' value="light">Light</SelectItem>
                                <SelectItem className='cursor-pointer' value="dark">Dark</SelectItem>
                                <SelectItem className='cursor-pointer' value="system">System</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {/* Start Time & End Time */}
                <div className='flex gap-5 justify-between'>
                    {/* For Start Time */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='tagged_speakers'>
                            Start Time <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            <div className='bg-brand-light h-full w-full relative rounded-md'>
                                <Input
                                    type='time'
                                    name='start_time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {`6:9:GB`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* For End Time */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='tagged_speakers'>
                            End Time <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            <div className='bg-brand-light h-full w-full relative rounded-md'>
                                <Input
                                    type='time'
                                    name='start_time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {`6:9:GB`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button className='btn max-w-96 mx-auto mt-7 w-full !h-12'>Add Agenda</Button>
            </div>
        </div>
    )
}

export default AddAgenda;