import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { domain } from '@/constants';
import axios from 'axios';
import { CircleCheck, CircleX, Eye, EyeClosed } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import Wave from '@/components/Wave';

const AddSubuser: React.FC = () => {
    const { user, token, getUserProfile } = useAuthStore(state => state);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast("Please fill in all fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${domain}/api/register-subuser/${user?.uuid}`, formData, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            await getUserProfile(token || "");

            if (response.data.status === 201) {
                toast(response.data.message || "Subuser added successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            }

        } catch (error: any) {
            if (error.response.data.status === 422) {
                toast(error.response.data.message || "Email already exists", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
                return;
            }
            toast(error?.data?.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setFormData({
                name: '',
                email: '',
                password: ''
            });
            setLoading(false);
        }
    }

    if (loading) {
        return <Wave />;
    }

    return (
        <div className='w-full h-full'>
            <div className='max-w-lg w-full bg-muted mt-10 mx-auto rounded-[10px]'>
                <div className='space-y-5 p-8 shadow-blur-lg rounded-2xl'>
                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold' htmlFor='name'>Name</Label>
                        <div className='relative border rounded-lg'>
                            <Input
                                value={formData.name}
                                onChange={handleInputChange}
                                name="name"
                                placeholder='Full Name'
                                className='input !h-12 !min-w-full relative !px-4 flex items-center justify-end'
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
                                className='input !h-12 !min-w-full relative !px-4 flex items-center justify-end'
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
                                className='input !h-12 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'>
                                {showPassword ?
                                    <Eye onClick={() => setShowPassword(!showPassword)} className='size-4' /> :
                                    <EyeClosed onClick={() => setShowPassword(!showPassword)} className='size-4' />
                                }
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className='btn h-12 mx-auto w-full'>
                        Add User
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddSubuser;
