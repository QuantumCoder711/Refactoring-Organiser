import GoBack from '@/components/GoBack';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/constants';
import { getImageUrl } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import React from 'react';

const Profile: React.FC = () => {

    const { user } = useAuthStore(state => state);

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
                        <img width={165} height={165} className='rounded-[10px] bg-brand-light-gray object-contain shadow-blur size-[165px] mt-2.5' src={user?.company_logo ? getImageUrl(user?.image) : UserAvatar} alt={user?.first_name + ' ' + user?.last_name} />
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
                <Button className='btn !h-12 !text-base w-full mt-[30px]'>Edit Profile</Button>
            </div>
        </div>
    )
}

export default Profile;
