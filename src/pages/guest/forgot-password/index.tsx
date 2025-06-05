import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Wave from '@/components/Wave';
import axios from 'axios';
import { domain } from '@/constants';

const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');

    const handleSubmit = async () => {
        if (!email) {
            toast("Please enter your email", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        try {
            setIsLoading(true);
            const res = await axios.post(`${domain}/api/forgot-password`, {
                email
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.data.status === "200") {
                toast("Password reset link sent to your email", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
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
        <div className='min-h-screen flex items-center justify-center p-4'>
            <div className='max-w-[400px] w-full rounded-[10px]'>
                <h1 className='text-2xl font-semibold text-center mb-6'>Forgot Password</h1>
                
                <div className='space-y-5'>
                    <div className='flex flex-col gap-2'>
                        <Label className='font-semibold'>Email</Label>
                        <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type='email'
                                placeholder='Enter your email'
                                className='input !h-full min-w-full absolute right-0 text-base z-10'
                            />
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className='btn mx-auto w-full'>
                        Send Reset Link
                    </Button>

                    <p className="text-center text-sm">
                        Remember your password? <Link to="/organiser/login" className='text-brand-primary'>Login Here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 