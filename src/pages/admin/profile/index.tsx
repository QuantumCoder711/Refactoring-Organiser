import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { appDomain, UserAvatar } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Coins from "@/assets/coins.svg";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, CircleX } from "lucide-react";
import axios from 'axios';
import { toast } from 'sonner';
import Wave from '@/components/Wave';

const Profile: React.FC = () => {
    const [credits, setCredits] = useState(10);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const formContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentFormHtml, setPaymentFormHtml] = useState<string>('');

    const { user, token, getUserProfile } = useAuthStore(state => state);

    // Listen for profile update events
    useEffect(() => {
        const handleProfileUpdate = () => {
            if (token) {
                getUserProfile(token);
            }
        };

        window.addEventListener('userProfileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('userProfileUpdated', handleProfileUpdate);
        };
    }, [token, getUserProfile]);

    // Calculate total price based on credits (1 credit = ₹8)
    const totalPrice = credits * 8;

    // Handle slider change
    const handleSliderChange = (value: number[]) => {
        setCredits(value[0]);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 10;
        const clampedValue = Math.min(Math.max(value, 10), 1000);
        setCredits(clampedValue);
    };

    // Handle increment/decrement
    const incrementCredits = () => {
        setCredits(prev => Math.min(prev + 10, 1000));
    };

    const decrementCredits = () => {
        setCredits(prev => Math.max(prev - 10, 10));
    };

    useEffect(() => {
        if (paymentFormHtml) {
            // Create a temporary div to parse the HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = paymentFormHtml;

            // Find the form element
            const form = tempDiv.querySelector('form');
            if (form) {
                // Create a new form element in the DOM
                const newForm = document.createElement('form');
                newForm.id = form.id;
                newForm.name = form.name;
                newForm.method = form.method;
                newForm.action = form.action;

                // Copy all input fields
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    const newInput = document.createElement('input');
                    newInput.type = input.type;
                    newInput.name = input.name;
                    newInput.value = input.value;
                    newInput.hidden = true;
                    newForm.appendChild(newInput);
                });

                // Append the form to the body
                document.body.appendChild(newForm);

                // Submit the form
                setTimeout(() => {
                    newForm.submit();
                }, 100);
            }
        }
    }, [paymentFormHtml]);

    // Handle upgrade
    const handleUpgrade = async () => {
        try {
            setIsLoading(true);

            // Call your API to process the credit purchase
            const response = await axios.post(
                `${appDomain}/api/v1/payment/wallet-topup`,
                {
                    amount: totalPrice,
                    credits,
                    firstname: user?.first_name,
                    email: user?.email,
                    mobile: user?.mobile_number,
                    uuid: user?.uuid,
                    token
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log("Payment response:", response.data);

            // If the response contains HTML form data
            if (response.data) {
                setPaymentFormHtml(response.data);
            } else {
                setIsLoading(false);
                toast("Failed to initiate payment. Please try again later.", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            console.error("Error initiating payment:", error);
            setIsLoading(false);
            toast("Failed to initiate payment. Please try again later.", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setCredits(10);
        setIsDialogOpen(false);
    };

    if (isLoading) {
        return <Wave />
    }

    return (
        <div className='relative h-full sm:px-6 lg:px-8 py-4'>
            <div className='absolute top-4 left-4 sm:top-6 sm:left-6'>
                <GoBack />
            </div>

            <div className='w-full max-w-lg mx-auto rounded-[10px] bg-muted h-fit px-4 sm:px-6 lg:px-[72px] pt-8 sm:pt-9 pb-6 sm:pb-[30px] mt-12 sm:mt-0'>
                {/* Profile Images Section */}
                <div className='flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8'>
                    <div className='text-center sm:text-left w-1/2 min-w-40 max-w-60 sm:max-w-1/2'>
                        <h3 className='font-bold text-sm sm:text-base'>Profile Picture</h3>
                        <img 
                            className='rounded-[10px] bg-brand-light-gray shadow-blur w-full aspect-square object-cover mt-2.5 mx-auto sm:mx-0' 
                            src={user?.image ? getImageUrl(user?.image) : UserAvatar} 
                            alt={user?.first_name + ' ' + user?.last_name} 
                        />
                    </div>
                    <div className='text-center sm:text-left w-1/2 min-w-40 max-w-60 sm:max-w-1/2'>
                        <h3 className='font-bold text-sm sm:text-base'>Company Logo</h3>
                        <img 
                            className='rounded-[10px] bg-brand-light-gray object-contain shadow-blur w-full aspect-square mt-2.5 mx-auto sm:mx-0' 
                            src={user?.company_logo ? getImageUrl(user?.company_logo) : UserAvatar} 
                            alt={user?.first_name + ' ' + user?.last_name} 
                        />
                    </div>
                </div>

                {/* User Info Section */}
                <div className='text-center space-y-2 sm:space-y-2.5 mt-6 sm:mt-7'>
                    <h3 className='font-semibold text-lg sm:text-xl'>{user?.first_name + ' ' + user?.last_name}</h3>
                    <p className='text-sm sm:text-base'>{user?.designation_name}</p>
                    <p className='text-sm sm:text-base'>{user?.company_name}</p>
                    <p className='text-brand-dark-gray text-sm sm:text-base'>{user?.email}</p>
                    <p className='text-brand-dark-gray text-sm sm:text-base'>{user?.mobile_number}</p>
                    <p className='text-brand-dark-gray text-sm sm:text-base break-words'>
                        {user?.address + " " + user?.pincode}
                    </p>
                </div>

                {/* Credits Section */}
                <div hidden={user?.feature_permission?.wallet === 0} className='p-3 rounded-md w-full flex flex-col sm:flex-row justify-between items-center gap-3 bg-brand-primary/10 mt-6 sm:mt-8'>
                    <p className='flex items-center gap-2 text-sm sm:text-base'>
                        <img src={Coins} width={28} height={28} alt="Coins" className='inline-block' />
                        Credits: {user?.wallet_balance}
                    </p>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className='btn !font-normal !text-sm sm:!text-base w-full sm:w-auto'>
                                Upgrade
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md max-w-[95vw] mx-2">
                            <DialogHeader className="text-center">
                                <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
                                    Upgrade Credits
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
                                {/* Credit rate */}
                                <div className="text-center">
                                    <p className="text-base sm:text-lg font-semibold">1 Credit = ₹8</p>
                                </div>

                                {/* Slider section */}
                                <div className="space-y-3 sm:space-y-4">
                                    <p className="text-foreground font-medium text-sm sm:text-base">Select Credits Amount:</p>

                                    <div className="px-2">
                                        <Slider
                                            value={[credits]}
                                            onValueChange={handleSliderChange}
                                            min={10}
                                            max={1000}
                                            step={10}
                                            className="w-full bg-muted"
                                        />
                                        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-2">
                                            <span>₹80 (10 credits)</span>
                                            <span>₹8000 (1000 credits)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Credits input with increment/decrement */}
                                <div className="flex items-center gap-2">
                                    <label className="font-medium text-sm sm:text-base">Credits:</label>
                                    <div className="flex items-center border rounded-md overflow-hidden">
                                        <Input
                                            type="number"
                                            value={credits}
                                            onChange={handleInputChange}
                                            min={10}
                                            max={1000}
                                            className="border-0 text-center w-16 sm:w-20 focus-visible:ring-0 text-sm sm:text-base"
                                        />
                                        <div className="flex flex-col border-l">
                                            <button
                                                onClick={incrementCredits}
                                                className="px-2 py-1 hover:bg-accent border-b"
                                                type="button"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={decrementCredits}
                                                className="px-2 py-1 hover:bg-accent"
                                                type="button"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Total price */}
                                <div className="bg-muted p-3 sm:p-4 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-base sm:text-lg">Total Price:</span>
                                        <span className="font-bold text-lg sm:text-xl text-primary">
                                            ₹{totalPrice.toLocaleString()}/-
                                        </span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="text-sm sm:text-base"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpgrade}
                                        className="text-sm sm:text-base"
                                    >
                                        Upgrade
                                    </Button>
                                </div>

                                {/* Hidden div to render the payment form */}
                                <div ref={formContainerRef} style={{ display: 'none' }}></div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Edit Profile Button */}
                <Link to="/update-profile" className="block w-full">
                    <Button className='btn !h-10 sm:!h-12 !text-sm sm:!text-base w-full mt-6 sm:mt-[30px]'>
                        Edit Profile
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export default Profile;