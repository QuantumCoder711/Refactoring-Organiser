import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheck, CircleX, Eye, EyeClosed } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';
import axios from 'axios';
import { domain } from '@/constants';
import useAuthStore from '@/store/authStore';

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            toast("Please fill in all fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast("New passwords do not match", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setIsLoading(true);
            const data = new FormData();
            data.append("old_password", formData.oldPassword);
            data.append("password", formData.newPassword);
            data.append("confirm_password", formData.confirmPassword);

            const res = await axios.post(`${domain}/api/changepassword`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.data.status === 200) {
                toast("Password changed successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                
                navigate('/profile');
                // setTimeout(() => {
                // }, 2000);
            } else {
                toast(res.data.message || "Something went wrong", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error: any) {
            toast(error.data?.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Wave />;
    }

    return (
        <div className='flex flex-1 h-full items-center justify-center p-4'>
            <div className='max-w-lg w-full rounded-[10px]'>
                <h1 className='text-2xl font-semibold text-center mb-6'>Change Password</h1>
                
                <div className='space-y-5 p-8 shadow-blur-lg rounded-2xl'>
                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold'>Current Password</Label>
                        <div className='relative'>
                            <Input
                                value={formData.oldPassword}
                                onChange={handleInputChange}
                                name="oldPassword"
                                type={showOldPassword ? 'text' : 'password'}
                                placeholder='Enter current password'
                                className='input !h-12 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'>
                                {showOldPassword ? 
                                    <Eye onClick={() => setShowOldPassword(!showOldPassword)} className='size-4' /> : 
                                    <EyeClosed onClick={() => setShowOldPassword(!showOldPassword)} className='size-4' />
                                }
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold'>New Password</Label>
                        <div className='relative'>
                            <Input
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                name="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder='Enter new password'
                                className='input !h-12 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'>
                                {showNewPassword ? 
                                    <Eye onClick={() => setShowNewPassword(!showNewPassword)} className='size-4' /> : 
                                    <EyeClosed onClick={() => setShowNewPassword(!showNewPassword)} className='size-4' />
                                }
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold'>Confirm New Password</Label>
                        <div className='relative'>
                            <Input
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Confirm new password'
                                className='input !h-12 !min-w-full relative !px-4 flex items-center justify-end'
                            />
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer'>
                                {showConfirmPassword ? 
                                    <Eye onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='size-4' /> : 
                                    <EyeClosed onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='size-4' />
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
    );
};

export default ChangePassword; 