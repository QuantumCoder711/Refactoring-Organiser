import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { domain } from '@/constants';

const PaymentStatus: React.FC = () => {
    const { status, id } = useParams<{ status: string, id: string }>();
    const [eventSlug, setEventSlug] = useState<string>('');

    useEffect(() => {
        // Get the event slug from localStorage
        const slug = localStorage.getItem('pendingEventSlug');
        if (slug) {
            setEventSlug(slug);
        }
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    const getStatusIcon = () => {
        if (status?.toLowerCase() === 'success') {
            return <CheckCircle className="w-20 h-20 text-green-500 mb-4" />;
        } else if (status?.toLowerCase() === 'failed') {
            return <XCircle className="w-20 h-20 text-red-500 mb-4" />;
        } else {
            return <AlertCircle className="w-20 h-20 text-yellow-500 mb-4" />;
        }
    };

    const getStatusColor = () => {
        if (status?.toLowerCase() === 'success') {
            return 'text-green-600';
        } else if (status?.toLowerCase() === 'failed') {
            return 'text-red-600';
        } else {
            return 'text-yellow-600';
        }
    };

    const getStatusMessage = () => {
        if (status?.toLowerCase() === 'success') {
            return 'Your payment was successful!';
        } else if (status?.toLowerCase() === 'failed') {
            return 'Your payment was unsuccessful.';
        } else {
            return 'Payment status is pending.';
        }
    };

    useEffect(() => {
        const pendingRegistrationData = localStorage.getItem('pendingRegistrationData');
        if (pendingRegistrationData && status?.toLowerCase() === 'success') {
            const newObj = JSON.parse(pendingRegistrationData);

            axios.post(`${domain}/api/request_event_invitation`, {
                ...newObj
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            })
                .then(response => {
                    console.log('Registration successful:', response.data);
                    // Clear the stored data after successful registration
                    localStorage.removeItem('pendingRegistrationData');
                    localStorage.removeItem('pendingEventSlug');
                })
                .catch(error => {
                    console.error('Registration error:', error);
                });
        }
    }, [status]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    {getStatusIcon()}

                    <h1 className="text-3xl font-bold mb-2">Payment Status</h1>

                    <div className={`text-xl font-semibold mb-4 ${getStatusColor()}`}>
                        {status?.toUpperCase()}
                    </div>

                    <p className="text-gray-700 mb-6">{getStatusMessage()}</p>

                    {status === "success" && <p className="text-gray-700 mb-4 font-medium bg-green-50 p-3 rounded-lg border border-green-100">
                        <span className="text-green-600">✓</span> You've successfully registered for this event!
                    </p>}

                    {id && status === "success" && (
                        <div className="bg-gray-50 p-3 rounded-lg w-full mb-6">
                            <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                            <p className="text-gray-800 font-medium break-all">{id}</p>
                        </div>
                    )}

                    <div className="flex gap-4 w-full">
                        <Link
                            to={eventSlug ? `/explore-events/event/${eventSlug}` : '/'}
                            className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-center transition-colors"
                        >
                            Go Back
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;