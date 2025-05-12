import GoBack from '@/components/GoBack';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserAvatar } from '@/constants';
import Template1 from "@/assets/templates/template1.png";
import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { beautifyDate, getRandomOTP } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AddEventType } from '@/types';

const AddEvent: React.FC = () => {

    const templates: string[] = [Template1, Template1, Template1, Template1, Template1];

    const [formData, setFormData] = useState<AddEventType>({
        title: "",
        image: null,
        description: "",
        event_start_date: "",
        event_end_date: "",
        event_date: "",
        start_time: "",
        start_minute_time: "",
        start_time_type: "",
        end_time: "",
        end_minute_time: "",
        end_time_type: "",
        status: 1,
        feedback: 1,
        event_otp: getRandomOTP(),
        view_agenda_by: 0,
        google_map_link: "",
        event_fee: "0",
        paid_event: 0
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSwitchChange = (checked: boolean, name: string) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: checked ? 1 : 0,
            event_fee: checked ? prevState.event_fee : "0"
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prevState => ({
            ...prevState,
            image: file
        }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, timeType: 'start' | 'end') => {
        const [hours, minutes] = e.target.value.split(':');
        const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
        const formattedHours = parseInt(hours) % 12 || 12;

        setFormData(prevState => ({
            ...prevState,
            [`${timeType}_time`]: formattedHours.toString(),
            [`${timeType}_minute_time`]: minutes,
            [`${timeType}_time_type`]: ampm
        }));
    };

    const handleSubmit = async () => {
        // Handle form submission
        console.log(formData);
    };

    return (
        <div className='relative w-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='max-w-[700px] mx-auto p-8 bg-brand-background'>
                {/* Event Name */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='title'>
                        Event Name <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="title"
                        name='title'
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange}
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Event Type, Image, and Choose Banner Image Button */}
                <div className='flex gap-7 mt-5 items-center'>
                    <div className='flex flex-col w-full gap-5'>
                        {/* Event Type */}
                        <div className="flex flex-col gap-2 w-full">
                            <Label className="font-semibold" htmlFor='paid_event'>
                                Event Type <span className="text-brand-secondary">*</span>
                            </Label>
                            <div className='input !h-12 min-w-full flex items-center text-base pl-4 !py-1.5'>
                                <div className='flex gap-4 items-center text-brand-dark-gray'>
                                    <Label htmlFor="paid_event" className='cursor-pointer'>Free</Label>

                                    <Switch
                                        id="paid_event"
                                        checked={formData.paid_event === 1}
                                        onCheckedChange={(checked) => handleSwitchChange(checked, 'paid_event')}
                                        className="data-[state=checked]:bg-brand-primary"
                                    />

                                    <Label htmlFor="paid_event" className='cursor-pointer'>Paid</Label>

                                </div>
                                {formData.paid_event === 1 && <div className='flex flex-1 border-l border-brand-dark-gray !ml-4'>
                                    <div className='relative w-full'>
                                        <Input
                                            id='event_fee'
                                            name='event_fee'
                                            type='number'
                                            value={formData.event_fee}
                                            placeholder='Event Fee'
                                            onChange={handleInputChange}
                                            className='input !h-11 focus-visible:!ring-0 focus-visible:!ring-offset-0 w-full text-base'
                                        />
                                    </div>
                                </div>}
                            </div>
                        </div>

                        {/* Banner Image */}
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="image">Banner <span className='text-brand-secondary'>*</span></Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                    {formData.image ? (formData.image as File).name : "No file Chosen"}
                                </p>
                                <Input
                                    id="image"
                                    name="image"
                                    type='file'
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
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
                        src={formData.image instanceof File ? URL.createObjectURL(formData.image) : UserAvatar}
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
                        <Slider defaultValue={[33]} className='cursor-pointer' max={100} step={1} />
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
                        value={formData.description}
                        onChange={handleInputChange}
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
                                    name='event_start_date'
                                    value={formData.event_start_date}
                                    onChange={handleInputChange}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center'>{beautifyDate(new Date(formData.event_start_date))}</p>
                            </div>

                            {/* For Time */}
                            <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                <Input
                                    type='time'
                                    name='start_time'
                                    value={`${formData.start_time}:${formData.start_minute_time}`}
                                    onChange={(e) => handleTimeChange(e, 'start')}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {`${formData.start_time}:${formData.start_minute_time} ${formData.start_time_type}`}
                                </p>
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
                                    name='event_end_date'
                                    value={formData.event_end_date}
                                    onChange={handleInputChange}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center'>{beautifyDate(new Date(formData.event_end_date))}</p>
                            </div>

                            {/* For Time */}
                            <div className='bg-brand-light h-full w-28 relative rounded-r-md'>
                                <Input
                                    type='time'
                                    name='end_time'
                                    value={`${formData.end_time}:${formData.end_minute_time}`}
                                    onChange={(e) => handleTimeChange(e, 'end')}
                                    className='w-full custom-input h-full absolute opacity-0'
                                />
                                <p className='h-full px-3 flex items-center text-nowrap'>
                                    {`${formData.end_time}:${formData.end_minute_time} ${formData.end_time_type}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className='flex flex-col gap-2 mt-5'>
                    <Label className='font-semibold' htmlFor='google_map_link'>
                        Location <span className="text-brand-secondary">*</span>
                    </Label>
                    <div className='relative'>
                        <Input
                            id='google_map_link'
                            name='google_map_link'
                            type='text'
                            value={formData.google_map_link}
                            onChange={handleInputChange}
                            placeholder='Enter Location'
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                </div>

                {/* Printers Count */}
                <div className='flex items-center justify-between gap-5 mt-5'>
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='printers_count'>
                            No. of Printers <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="printers_count"
                            name='printers_count'
                            type="number"
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>

                    {/* View Agenda By */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='view_agenda_by'>
                            View Agenda By <span className="text-brand-secondary">*</span>
                        </Label>
                        <div className='input !h-12 min-w-full flex items-center text-base px-4'>
                            <div className='flex gap-4 items-center text-brand-dark-gray'>
                                <Label htmlFor="view_agenda_by" className='cursor-pointer'>All</Label>

                                <Switch
                                    id="view_agenda_by"
                                    checked={formData.view_agenda_by === 1}
                                    onCheckedChange={(checked) => handleSwitchChange(checked, 'view_agenda_by')}
                                    className="data-[state=checked]:bg-brand-primary"
                                />

                                <Label htmlFor="view_agenda_by" className='cursor-pointer'>Checked In</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex mt-5 gap-2 flex-col'>
                    <Label className='font-semibold'>Event OTP</Label>
                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                        <Input
                            value={formData.event_otp}
                            onChange={handleInputChange}
                            name='event_otp'
                            className='input !h-full min-w-full absolute text-base z-10'
                        />
                        <Button
                            onClick={() => setFormData(prev => ({ ...prev, event_otp: getRandomOTP() }))}
                            className='btn-rounded !h-[40px] !rounded-[10px] z-20'
                        >
                            Generate
                        </Button>
                    </div>
                </div>
            </div>

            <Button onClick={handleSubmit}>Submit</Button>
        </div>
    )
}

export default AddEvent;