import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/constants';
import React from 'react';

const UpdateProfile: React.FC = () => {
    return (
        <div className='w-full h-full relative'>

            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='max-w-[700px] mx-auto rounded-[10px] p-8 bg-brand-background flex flex-col gap-5'>

                {/* Name */}
                <div className='flex gap-5 justify-between'>
                    {/* First Name */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='first_name'>
                            First Name <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="first_name"
                            name='first_name'
                            type="text"
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                    {/* Last Name */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='last_name'>
                            Last Name <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="last_name"
                            name='last_name'
                            type="text"
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='email'>
                        Email <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="email"
                        name='email'
                        type="email"
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='mobile_number'>
                        Phone No. <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="mobile_number"
                        name='mobile_number'
                        type="text"
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='company'>
                        Company <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="company"
                        name='company'
                        type="text"
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Designation */}
                <div className="flex flex-col gap-2 w-full">
                    <Label className="font-semibold" htmlFor='designation'>
                        Designation <span className="text-brand-secondary">*</span>
                    </Label>
                    <Input
                        id="designation"
                        name='designation'
                        type="text"
                        className='input !h-12 min-w-full text-base'
                    />
                </div>

                {/* Address & Pincode */}
                <div className='flex gap-5 justify-between'>
                    {/* Address */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='address'>
                            Address <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="address"
                            name='address'
                            type="text"
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col gap-2 w-full">
                        <Label className="font-semibold" htmlFor='pincode'>
                            Pincode <span className="text-brand-secondary">*</span>
                        </Label>
                        <Input
                            id="pincode"
                            name='pincode'
                            type="text"
                            className='input !h-12 min-w-full text-base'
                        />
                    </div>
                </div>

                {/* Company Logo & Profile Picture */}
                <div className='flex gap-5 justify-between'>
                    {/* Company Image */}
                    <div className='flex gap-5 flex-col w-full'>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="comany_logo">Company Logo <span className='text-brand-secondary'>*</span></Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                    {"No file Chosen"}
                                </p>
                                <Input
                                    id="company_logo"
                                    name="company_logo"
                                    type='file'
                                    accept="image/*"
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                />
                            </div>
                        </div>

                        <img src={UserAvatar} alt="User Avatar" width={150} height={150} className='rounded-md' />
                    </div>

                    {/* Profile Picture */}
                    <div className='flex gap-5 flex-col w-full'>
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold" htmlFor="image">Profile Picture <span className='text-brand-secondary'>*</span></Label>
                            <div className="input relative overflow-hidden !h-12 min-w-full text-base cursor-pointer flex items-center justify-between p-2 gap-4">
                                <span className="w-full bg-brand-background px-2 h-[34px] rounded-md text-base font-normal flex items-center">Choose File</span>
                                <p className="w-full text-nowrap overflow-hidden text-ellipsis">
                                    {"No file Chosen"}
                                </p>
                                <Input
                                    id="image"
                                    name="image"
                                    type='file'
                                    accept="image/*"
                                    className='input absolute left-0 top-0 opacity-0 !h-12 min-w-full text-base cursor-pointer'
                                />
                            </div>
                        </div>

                        <img src={UserAvatar} alt="User Avatar" width={150} height={150} className='rounded-md' />
                    </div>


                </div>

                <div className='flex gap-5 justify-center mt-12'>
                    <Button className='btn !h-12 !text-base w-44'>Save</Button>
                    <Button className='btn !bg-brand-dark-gray !h-12 !text-base w-44'>Cancel</Button>
                </div>
            </div>
        </div>
    )
}

export default UpdateProfile;