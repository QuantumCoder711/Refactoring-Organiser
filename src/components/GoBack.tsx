import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const GoBack: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Button className='btn dark:bg-muted bg-muted !text-foreground max-w-fit' onClick={() => navigate(-1)}><ChevronLeft />Back</Button>
    )
}

export default GoBack;