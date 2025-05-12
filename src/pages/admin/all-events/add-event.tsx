import GoBack from '@/components/GoBack';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserAvatar } from '@/constants';
import Template1 from "@/assets/templates/template1.png";
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { beautifyDate, beautifyTime } from '@/lib/utils';
import { MapPin } from 'lucide-react';

const AddEvent: React.FC = () => {

    const templates: string[] = [Template1, Template1, Template1, Template1, Template1];
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [selectedStartTime, setSelectedStartTime] = useState<string>(new Date().getTime().toString());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [selectedEndTime, setSelectedEndTime] = useState<string>(new Date().getTime().toString());

    return (
        <div className='relative w-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='border-2 border-red-500 max-w-[700px] mx-auto p-8 bg-brand-background'>
                {/* Event Name */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='event_name'>
                        Event Name <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="event_name"
                        name='event_name'
                        type="text"
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Event Type, Image, and Choose Banner Image Button */}
                <div className='flex gap-7 mt-5 items-center'>
                    <div className='flex flex-col w-full gap-5'>
                        {/* Event Type */}
                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor='event_type'>
                                Event Type <span className="text-brand-secondary">*</span>
                            </Label>
                            <div className='input !h-12 min-w-full flex items-center text-base px-4'>
                                <div className='flex gap-4 items-center text-brand-dark-gray'>
                                    <Label htmlFor="event_type_switch" className='cursor-pointer'>Free</Label>

                                    <Switch
                                        id="event_type_switch"
                                        className="data-[state=checked]:bg-brand-primary"
                                    />

                                    <Label htmlFor="event_type_switch" className='cursor-pointer'>Paid</Label>
                                </div>
                            </div>
                        </div>

                        {/* Banner Image */}
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="image">Profile Picture</Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">No file Chosen</p>
                                <Input
                                    id="image"
                                    name="image"
                                    type='file'
                                    accept="image/*"
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                // onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <p className='font-semibold text-center -my-4'>Or</p>

                        {/* Choose Banner Image Button */}
                        <button className='btn !h-12 !w-full !rounded-[10px] !font-semibold !text-base'>Create Event Banner</button>
                    </div>

                    <img
                        height={237}
                        width={237}
                        src={UserAvatar}
                        className='max-h-[237px] min-w-[237px] bg-brand-light-gray rounded-[10px]' />
                </div>

                {/* Templates Images */}
                <div className='flex justify-between mt-5'>
                    {templates.map((image, index) => (
                        <img key={index} src={image} alt="template" width={100} height={100} className='bg-brand-light-gray rounded-[10px] cursor-pointer' />
                    ))}
                </div>

                {/* Text Size and Color */}
                <div className='flex justify-between items-center mt-[26px] gap-9'>
                    <div className='flex gap-[18px] items-center flex-1'>
                        <Label className='font-semibold text-nowrap'>Text Size: </Label>
                        <Slider defaultValue={[33]} max={100} step={1} />
                    </div>
                    <div className='w-fit flex gap-[18px]'>
                        <Label className='font-semibold text-nowrap'>Select Text Color: </Label>
                        <Input type='color' className='w-[75px] h-6 p-0 outline-0 border-0' />
                    </div>
                </div>

                {/* Description Box */}
                <div className='flex flex-col gap-2 mt-5'>
                    <Label className="font-semibold" htmlFor='description'>
                        Description <span className="text-brand-secondary">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        name='description'
                        className='input min-w-full !h-32 text-base'
                    />
                </div>

                {/* Start Time & End Time */}
                <div className='flex gap-5 w-full mt-5'>
                    {/* Start Time */}
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold'>
                            Start Time <span className="text-brand-secondary">*</span>
                        </Label>

                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            {/* For Date */}
                            <div className='bg-brand-light h-full w-full relative rounded-l-md border-white border-r'>
                                <Input
                                    type='date'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    onChange={(e) => setSelectedStartDate(new Date(e.target.value))}
                                />
                                <p className='h-full px-3 flex items-center'>{beautifyDate(selectedStartDate)}</p>
                            </div>

                            {/* For Time */}
                            <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                <Input
                                    type='time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    onChange={(e) => setSelectedStartTime(e.target.value)}
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>{beautifyTime(selectedStartTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* End Time */}
                    <div className='flex flex-col gap-2 w-full'>
                        <Label className='font-semibold'>
                            End Time <span className="text-brand-secondary">*</span>
                        </Label>

                        <div className='w-full rounded-[10px] relative flex h-12 bg-white p-1'>
                            {/* For Date */}
                            <div className='bg-brand-light h-full w-full relative rounded-l-md border-white border-r'>
                                <Input
                                    type='date'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    onChange={(e) => setSelectedEndDate(new Date(e.target.value))}
                                />
                                <p className='h-full px-3 flex items-center'>{beautifyDate(selectedEndDate)}</p>
                            </div>

                            {/* For Time */}
                            <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                <Input
                                    type='time'
                                    className='w-full custom-input h-full absolute opacity-0'
                                    onChange={(e) => setSelectedEndTime(e.target.value)}
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>{beautifyTime(selectedEndTime)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className='flex flex-col gap-2 mt-5'>
                    <Label className='font-semibold'>
                        Location <span className="text-brand-secondary">*</span>
                    </Label>
                    <div className='relative'>
                        <Input
                            type='text'
                            placeholder='Enter Location'
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEvent;