import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import React, { useState } from 'react';
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
import { ChevronUp, ChevronDown } from "lucide-react";

const Profile: React.FC = () => {
    const [credits, setCredits] = useState(10);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { user } = useAuthStore(state => state);

    // Calculate total price based on credits (1 credit = ₹6)
    const totalPrice = credits * 6;

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

    // Handle upgrade
    const handleUpgrade = () => {
        // TODO: Implement upgrade logic here
        console.log(`Upgrading ${credits} credits for ₹${totalPrice}`);
        setIsDialogOpen(false);
    };

    // Handle cancel
    const handleCancel = () => {
        setCredits(10);
        setIsDialogOpen(false);
    };

    return (
        <div className='relative h-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <div className='w-lg rounded-[10px] bg-brand-background h-full mx-auto px-[72px] pt-9 pb-[30px]'>
                <div className='flex justify-between'>
                    <div>
                        <h3 className='font-bold'>Profile Picture</h3>
                        <img width={165} height={165} className='rounded-[10px] bg-brand-light-gray shadow-blur size-[165px] mt-2.5' src={user?.image ? getImageUrl(user?.image) : UserAvatar} alt={user?.first_name + ' ' + user?.last_name} />
                    </div>
                    <div>
                        <h3 className='font-bold'>Company Logo</h3>
                        <img width={165} height={165} className='rounded-[10px] bg-brand-light-gray object-contain shadow-blur size-[165px] mt-2.5' src={user?.company_logo ? getImageUrl(user?.company_logo) : UserAvatar} alt={user?.first_name + ' ' + user?.last_name} />
                    </div>
                </div>

                <div className='text-center space-y-2.5 mt-7'>
                    <h3 className='font-semibold'>{user?.first_name + ' ' + user?.last_name}</h3>
                    <p>{user?.designation_name}</p>
                    <p>{user?.company_name}</p>
                    <p className='text-brand-dark-gray'>{user?.email}</p>
                    <p className='text-brand-dark-gray'>{user?.mobile_number}</p>
                    <p className='text-brand-dark-gray'>{user?.address + " " + user?.pincode}</p>
                </div>

                {/* Credits */}
                <div className='p-3 rounded-md w-full flex justify-between bg-brand-primary/10'>
                    <p className='flex items-center gap-2'>
                        <img src={Coins} width={32} height={32} alt="Coins" className='inline-block' />
                        Credits: {user?.wallet_balance}
                    </p>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className='btn !font-normal !text-base'>Upgrade</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader className="text-center">
                                <DialogTitle className="text-2xl font-bold text-center">Upgrade Credits</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Credit rate */}
                                <div className="text-center">
                                    <p className="text-lg font-semibold">1 Credit = ₹6</p>
                                </div>

                                {/* Slider section */}
                                <div className="space-y-4">
                                    <p className="text-gray-600 font-medium">Select Credits Amount:</p>

                                    <div className="px-2">
                                        <Slider
                                            value={[credits]}
                                            onValueChange={handleSliderChange}
                                            min={10}
                                            max={1000}
                                            step={10}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span>₹60 (10 credits)</span>
                                            <span>₹6000 (1000 credits)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Credits input with increment/decrement */}
                                <div className="flex items-center gap-2">
                                    <label className="font-medium">Credits:</label>
                                    <div className="flex items-center border rounded-md">
                                        <Input
                                            type="number"
                                            value={credits}
                                            onChange={handleInputChange}
                                            min={10}
                                            max={1000}
                                            className="border-0 text-center w-20 focus-visible:ring-0"
                                        />
                                        <div className="flex flex-col border-l">
                                            <button
                                                onClick={incrementCredits}
                                                className="px-2 py-1 hover:bg-gray-100 border-b"
                                                type="button"
                                            >
                                                <ChevronUp className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={decrementCredits}
                                                className="px-2 py-1 hover:bg-gray-100"
                                                type="button"
                                            >
                                                <ChevronDown className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Total price */}
                                <div className="bg-gray-100 p-4 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-lg">Total Price:</span>
                                        <span className="font-bold text-xl text-blue-600">₹{totalPrice.toLocaleString()}/-</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white border-gray-400 hover:border-gray-500"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpgrade}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        Upgrade
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <Link to="/update-profile">
                    <Button className='btn !h-12 !text-base w-full mt-[30px]'>Edit Profile</Button>
                </Link>
            </div>
        </div>
    )
}

export default Profile;
