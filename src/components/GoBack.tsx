import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const GoBack: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Button variant="outline" className='dark:bg-muted bg-muted outline-0 !text-foreground max-w-fit' onClick={() => navigate(-1)}><ChevronLeft />Back</Button>
    )
}

export default GoBack;