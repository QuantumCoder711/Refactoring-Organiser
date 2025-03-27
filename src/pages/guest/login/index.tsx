import React, { useState } from 'react';

const Login:React.FC = () => {

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
              
            </form>
        </div>
    </div>
  )
}

export default Login;
