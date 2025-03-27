import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const Login: React.FC = () => {

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    console.log(email, password);
  }

  return (
    <div className='h-full w-full grid place-content-center'>
      <div className='w-96 p-5 shadow-blur rounded-lg'>
        <h1 className='text-2xl font-semibold text-center'>Login</h1>

        <form className='mt-8'>
          <div className='flex flex-col gap-2'>
            <Label>Email</Label>
            <Input type='email' placeholder='Enter your email' value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Password</Label>
            <Input type='password' placeholder='Enter your password' value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </form>

        <Button className='w-full mt-4 btn' onClick={handleLogin}>Login</Button>
      </div>
    </div>
  )
}

export default Login;
