import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const GoBack: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Button className='btn !bg-brand-background !text-black' onClick={() => navigate(-1)}><ChevronLeft />Back</Button>
    )
}

export default GoBack;
