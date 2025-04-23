import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CircleX } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/constants";
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Image } from "@radix-ui/react-avatar";
import { createImage } from "@/lib/utils";


const AddAttendee: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        website: '',
        linkedin_page_link: '',
        employee_size: '',
        company_turn_over: '',
        status: '',
        image: null as File | null,
        alternate_mobile_number: '',
        alternate_email: '',
        company_name: '',
        industry: '',
        job_title: '',
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target as HTMLInputElement;
        if (files) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.company_name) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(formData.email)) {
            toast("Please enter a valid email", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        console.log(formData);
    }

    return (
        <div className="">
            <div className="w-[690px] bg-brand-light-gray p-7 rounded-[10px] mx-auto shadow-blur">
                <Tabs defaultValue="single" className="mx-auto">
                    <TabsList className="bg-white p-0 max-w-[390px] mx-auto !max-h-9">
                        <TabsTrigger
                            value="single"
                            className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                        >
                            Add Attendee Details
                        </TabsTrigger>
                        <TabsTrigger
                            value="bulk"
                            className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
                        >
                            Bulk Upload
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="single" className="mt-5">
                        <form onSubmit={handleSubmit} className="w-[620px] mx-auto">
                            {/* Name Input */}
                            <div className="flex gap-3.5 w-full">
                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="first_name">First Name <span className="text-brand-secondary">*</span></Label>
                                    <Input
                                        id="first_name"
                                        name="first_name"
                                        type='text'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.first_name}
                                        onChange={handleInputChange}
                                        // required
                                    />
                                </div>

                                <div className='w-full mx-auto flex flex-col gap-2'>
                                    <Label className="font-semibold" htmlFor="last_name">Last Name <span className="text-brand-secondary">*</span></Label>
                                    <Input
                                        id="last_name"
                                        name="last_name"
                                        type='text'
                                        // placeholder='Enter your email'
                                        className='input !h-12 min-w-full text-base'
                                        value={formData.last_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3.5 grid-cols-2 mt-3.5 w-full">
                                <div className="flex flex-col gap-3.5 w-full">
                                    <div className="flex flex-col gap-2">
                                        <Label className="font-semibold" htmlFor="image">Profile Picture</Label>
                                        <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                            <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                            <p className="w-full text-nowrap overflow-hidden text-ellipsis">{formData.image ? formData.image.name : 'No file Chosen'}</p>

                                            <Input
                                                id="image"
                                                name="image"
                                                type='file'
                                                accept="image/*"
                                                className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                                // value={formData.email}
                                                onChange={handleFileChange}
                                                // required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label className="font-semibold" htmlFor="email">E-Mail <span className="text-brand-secondary">*</span></Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type='email'
                                            className='input !h-12 min-w-full text-base'
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            // required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label className="font-semibold" htmlFor="job_title">Job Title <span className="text-brand-secondary">*</span></Label>
                                        <Input
                                            id="job_title"
                                            name="job_title"
                                            type='text'
                                            className='input !h-12 min-w-full text-base'
                                            value={formData.job_title}
                                            onChange={handleInputChange}
                                            // required
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label className="font-semibold" htmlFor="company_name">Company Name <span className="text-brand-secondary">*</span></Label>
                                        <Input
                                            id="company_name"
                                            name="company_name"
                                            type='text'
                                            className='input !h-12 min-w-full text-base'
                                            value={formData.company_name}
                                            onChange={handleInputChange}
                                            // required
                                        />
                                    </div>
                                </div>
                                <div className="w-full mx-auto flex flex-col gap-2">
                                    <Label className="font-semibold">Select Image</Label>
                                    {/* <img src={formData.image ? URL.createObjectURL(formData.image) : UserAvatar} alt="" className="w-full h-full rounded-[10px] aspect-square object-cover object-center"/> */}
                                    <div className="w-full h-full">
                                        <AspectRatio className="aspect-video w-full h-full">
                                            <img src={createImage(formData.image)} alt="Attendee Image" className="rounded-md object-cover w-full h-full" />
                                        </AspectRatio>
                                    </div>

                                </div>
                            </div>

                            <Button type="submit">Submit</Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="bulk">
                        
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
};

export default AddAttendee;