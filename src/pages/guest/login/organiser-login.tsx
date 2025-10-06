import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CircleCheckBig, CircleX, Eye, EyeClosed } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const OrganiserLogin: React.FC = () => {

    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            toast("Please fill in all required fields", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await login(formData.email, formData.password);

            if (response.status === 200) {
                toast(response.message, {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheckBig className='size-5' />
                });

                navigate('/dashboard');
            } else {
                toast(response.message || "Login Failed", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";

            toast(errorMessage, {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='w-80 h-[356px] mx-auto text-center p-5 shadow-blur-lg rounded-lg'>
            <h1 className='text-2xl font-semibold text-center'>Login</h1>

            <form onSubmit={handleLogin} className='mt-8 flex flex-col gap-5 text-sm'>
                <div className='w-full max-w-64 mx-auto flex flex-col gap-2'>
                    <Label htmlFor="email">Email <span className="text-secondary">*</span></Label>
                    <Input
                        id="email"
                        name="email"
                        type='email'
                        placeholder='Enter your email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className='w-full max-w-64 mx-auto flex flex-col gap-2'>
                    <Label htmlFor="password">Password <span className="text-secondary">*</span></Label>
                    <div className='relative'>
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder='Enter your password'
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        {showPassword ? <Eye onClick={() => setShowPassword(!showPassword)} className='absolute size-4 right-2 top-1/2 -translate-y-1/2 cursor-pointer' /> : <EyeClosed onClick={() => setShowPassword(!showPassword)} className='absolute size-4 right-2 top-1/2 -translate-y-1/2 cursor-pointer' />}
                    </div>
                </div>
            </form>
            <div className='max-w-64 w-full text-left px-3'>
                <Link to='/organiser/forgot-password' className='text-primary text-xs'>Forgot Password?</Link>
            </div>

            <Button
                onClick={handleLogin}
                className='w-64 btn !mt-5 mx-auto'
                disabled={isLoading}
            >
                {isLoading ? 'Logging in...' : 'Login'}
            </Button>

            <p className='text-center mt-5 text-xs'>
                Don't have an account? <Link to='/organiser/signup' className='text-primary'>Signup Here</Link>
            </p>
        </div>
    )
}

export default OrganiserLogin;
