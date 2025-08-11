import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeClosed } from 'lucide-react';
import React, { useState } from 'react';

const AddSubuser: React.FC = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        console.log(formData);
    }

    return (
        <div className='w-full h-full'>
            <div className='max-w-lg w-full rounded-[10px]'>
                <h1 className='text-2xl font-semibold text-center mb-6'>Change Password</h1>

                <div className='space-y-5 p-8 shadow-blur-lg rounded-2xl'>
                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold' htmlFor='name'>Name</Label>
                        <div className='relative border rounded-lg'>
                            <Input
                                value={formData.name}
                                onChange={handleInputChange}
                                name="name"
                                placeholder='Full Name'
                                className='input !h-10 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold' htmlFor='email'>Email</Label>
                        <div className='relative border rounded-lg'>
                            <Input
                                value={formData.email}
                                onChange={handleInputChange}
                                name="email"
                                placeholder='Email'
                                className='input !h-10 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold' htmlFor='password'>Set Password</Label>
                        <div className='relative border rounded-lg'>
                            <Input
                                value={formData.password}
                                onChange={handleInputChange}
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Enter current password'
                                className='input !h-10 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'>
                                {showPassword ?
                                    <Eye onClick={() => setShowPassword(!showPassword)} className='size-4' /> :
                                    <EyeClosed onClick={() => setShowPassword(!showPassword)} className='size-4' />
                                }
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className='btn mx-auto w-full'>
                        Change Password
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddSubuser;
