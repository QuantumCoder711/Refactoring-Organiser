import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheck, CircleX, Eye, EyeClosed } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';
import axios from 'axios';
import { domain } from '@/constants';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.password || !formData.confirmPassword) {
            toast("Please fill in all fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast("Passwords do not match", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/reset-password`, {
                email,
                token,
                password: formData.password,
                confirm_password: formData.confirmPassword
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status == 200) {
                toast("Password reset successful", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
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
        <div className='h-full w-full grid place-content-center'>
            <div className='w-80 h-[356px] text-center p-5 shadow-blur-lg rounded-lg'>
                <h1 className='text-2xl font-semibold text-center'>Reset Password</h1>

                <form onSubmit={handleSubmit} className='mt-8 flex flex-col gap-5 text-sm'>
                    <div className='w-full max-w-64 mx-auto flex flex-col gap-2'>
                        <Label htmlFor="password">New Password <span className="text-brand-secondary">*</span></Label>
                        <div className='relative'>
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder='Enter new password'
                                className='input'
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                            {showPassword ? 
                                <Eye onClick={() => setShowPassword(!showPassword)} className='absolute size-4 right-2 top-1/2 -translate-y-1/2 cursor-pointer' /> : 
                                <EyeClosed onClick={() => setShowPassword(!showPassword)} className='absolute size-4 right-2 top-1/2 -translate-y-1/2 cursor-pointer' />
                            }
                        </div>
                    </div>

                    <div className='w-full max-w-64 mx-auto flex flex-col gap-2'>
                        <Label htmlFor="confirmPassword">Confirm Password <span className="text-brand-secondary">*</span></Label>
                        <div className='relative'>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder='Confirm new password'
                                className='input'
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                            {showConfirmPassword ? 
                                <Eye onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute size-4 right-2 top-1/2 -translate-y-1/2 cursor-pointer' /> : 
                                <EyeClosed onClick={() => setShowConfirmPassword(!showConfirmPassword)} className='absolute size-4 right-2 top-1/2 -translate-y-1/2 cursor-pointer' />
                            }
                        </div>
                    </div>
                </form>

                <Button
                    onClick={handleSubmit}
                    className='w-64 btn !mt-5 mx-auto'
                    disabled={isLoading}
                >
                    {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>

                <p className='text-center mt-5 text-xs'>
                    Remember your password? <Link to="/login" className='text-brand-primary'>Login Here</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword; 