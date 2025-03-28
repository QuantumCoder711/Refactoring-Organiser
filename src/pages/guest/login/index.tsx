import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { domain } from '@/constants';
import { toast } from 'sonner';
import { CircleCheckBig, CircleX } from 'lucide-react';

const Login: React.FC = () => {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${domain}/api/login`, { email, password }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const token = response.data.token;
      localStorage.setItem('klout-organiser-token', token);
      if(response.data.status === 200) {
        toast(response.data.message, {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheckBig className='size-5' />
        });
      } else {
        toast(response.data.message || "Login Failed", {
          className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className='size-5' />
        });
      }
    } catch (error) {
      toast("Something went wrong", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
    }
  }

  return (
    <div className='h-full w-full grid place-content-center'>
      <div className='w-80 h-[356px] text-center p-5 shadow-blur-lg rounded-lg'>
        <h1 className='text-2xl font-semibold text-center'>Login</h1>

        <form className='mt-8 flex flex-col gap-5 text-sm'>
          <div className='w-full max-w-64 mx-auto flex flex-col gap-2'>
            <Label>Email <span className="text-brand-secondary">*</span></Label>
            <Input
              type='email'
              placeholder='Enter your email'
              className='max-w-64 w-full h-[30px] focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:ring-offset-2 bg-white rounded-lg border-none'
              value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className='w-full max-w-64 mx-auto flex flex-col gap-2'>
            <Label>Password <span className="text-brand-secondary">*</span></Label>
            <Input
              type='password'
              placeholder='Enter your password'
              className='max-w-64 w-full h-[30px] focus-visible:ring-1 focus-visible:ring-brand-primary focus-visible:ring-offset-2 bg-white rounded-lg border-none'
              value={password}
              onChange={(e) => setPassword(e.target.value)} />
          </div>
        </form>

        <div className='max-w-64 w-full text-left px-3'>
          <Link to='#' className='text-brand-primary text-xs'>Forgot Password?</Link>
        </div>

        <Button className='w-64 btn !mt-5' onClick={handleLogin}>Login</Button>
        <p className='text-center mt-5 text-xs'>Don't have an account? <Link to='#' className='text-brand-primary'>Signup Here</Link></p>
      </div>
    </div>
  )
}

export default Login;
