import React from 'react';
import errorImage from '@/assets/error-page.svg';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Error404: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <Navbar isAuthenticated={false} />
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center space-y-8 px-4">
          <img
            src={errorImage}
            alt="404 Error"
            className="w-full max-w-md mx-auto"
          />
          <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-lg text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="pt-4">
            <Button
              onClick={() => navigate(-1)}
              className="bg-brand-primary hover:bg-brand-primary-dark cursor-pointer duration-300 text-white"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Error404;
