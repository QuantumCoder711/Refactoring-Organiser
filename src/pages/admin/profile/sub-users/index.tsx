import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuthStore from '@/store/authStore';
import { SubUserType } from '@/types';
import { Card, CardTitle } from '@/components/ui/card';
import AddSubuser from '@/pages/admin/profile/sub-users/add-subuser';
import { CircleCheck, CircleX, Shield, Trash } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from 'axios';
import { domain } from '@/constants';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import useEventStore from '@/store/eventStore';
import { filterEvents, getImageUrl } from '@/lib/utils';
import Wave from '@/components/Wave';

const SubUser = (subUser: SubUserType) => {
    const { token, getUserProfile, user } = useAuthStore(state => state);
    const { events } = useEventStore(state => state);
    const [loading, setLoading] = useState<boolean>(false);
    const { upcomingEvents } = filterEvents(events);

    const upcomingSortedEvents = upcomingEvents.sort((a: any, b: any) => {
        return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
    });

    const [selectedEvents, setSelectedEvents] = useState<number[]>(subUser.event_ids);

    const handleDelete = async () => {
        try {
            const response = await axios.post(`${domain}/api/delete-subuser/${subUser.id}`, {}, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            await getUserProfile(token || "");
            if (response.data.status === 200) {
                toast(response.data.message || "Subuser deleted successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            }
        } catch (error: any) {
            toast(error?.data?.message || "Something went wrong", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        }
    }

    const handleEventSelection = (eventId: number) => {
        setSelectedEvents(prev => {
            if (prev.includes(eventId)) {
                return prev.filter(id => id !== eventId);
            } else {
                return [...prev, eventId];
            }
        });
    }

    const handleSavePermissions = async () => { 
        try {
            setLoading(true);
            const response = await axios.post(`${domain}/api/subuser-event-permission/${user?.id}`, {
                event_ids: selectedEvents,
                sub_user_id: subUser.id
            }, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.data.status === 200) {
                toast(response.data.message || "Permissions saved successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            }
        } catch (error: any) {
            if (error.response?.status === 422 && error.response?.data?.errors?.sub_user_id) {
                toast(error.response.data.errors.sub_user_id[0] || "Invalid sub-user selected", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            } else {
                toast(error.response?.data?.message || "Failed to save permissions. Please try again.", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } finally {
            setLoading(false);
            setSelectedEvents([]);
        }
    }

    if(loading) {
        return <Wave />
    }

    return (
        <Card key={subUser.id} className="relative overflow-hidden transition-all hover:shadow-xl transform hover:-translate-y-1 duration-200 bg-gradient-to-br from-white to-gray-50">
            <div className="absolute right-4 top-4 z-10 flex gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="p-1.5 rounded-full cursor-pointer bg-white/80 hover:bg-brand-primary/10 text-brand-primary transition-colors">
                            <Shield className="w-4 h-4" />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold text-brand-primary">Event Permissions</DialogTitle>
                            <DialogDescription className="text-gray-600">
                                Select the events you want this user to have access to
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                            {upcomingSortedEvents?.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No upcoming events found
                                </div>
                            ) : upcomingSortedEvents?.map((event) => (
                                <label
                                    key={event.id}
                                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-brand-dark-gray hover:border-brand-primary/20"
                                    htmlFor={`event-${event.id}`}
                                >
                                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={getImageUrl(event.image)}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{event.title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <p className="text-sm text-gray-500">
                                                {new Date(event.event_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <Checkbox
                                        id={`event-${event.id}`}
                                        checked={selectedEvents.includes(event.id)}
                                        onCheckedChange={() => handleEventSelection(event.id)}
                                        className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                    />
                                </label>
                            ))}
                        </div>
                        <DialogFooter className="gap-2">
                            {/* <Button type="button" variant="outline">Cancel</Button> */}
                            <Button
                                type="button"
                                onClick={handleSavePermissions}
                                className="bg-brand-primary cursor-pointer duration-300 transition-all hover:bg-brand-primary-dark"
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="p-1.5 rounded-full cursor-pointer bg-white/80 hover:bg-red-100 text-red-600 transition-colors">
                            <Trash className="w-4 h-4" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl text-red-600">Delete Confirmation</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                                Are you sure you want to delete this subuser? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 cursor-pointer"
                            >
                                Delete User
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 grid place-items-center ring-2 ring-brand-primary/20 shadow-inner">
                        <span className="text-xl capitalize font-bold text-brand-primary drop-shadow-sm">
                            {subUser.name.split(' ').map((name) => name[0]).join('')}
                        </span>
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold capitalize text-gray-800 hover:text-brand-primary transition-colors">
                            {subUser.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {subUser.email}
                        </p>
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">
                            Role: <span className="text-brand-primary capitalize bg-brand-primary/10 px-2 py-1 rounded-full">{subUser.role}</span>
                        </p>
                        <p className="text-xs text-gray-400 italic">
                            Added on {new Date(subUser.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    )
}

const SubUsers: React.FC = () => {

    const subUsers = useAuthStore(state => state.user?.sub_users);

    return (
        <div className='h-full w-full'>
            <Tabs defaultValue="view-user" className="w-full h-full">
                <TabsList className='bg-brand-light mx-auto'>
                    <TabsTrigger value="view-user" className='cursor-pointer'>View Users</TabsTrigger>
                    <TabsTrigger value="add-user" className='cursor-pointer'>Add Users</TabsTrigger>
                </TabsList>

                <TabsContent value="view-user">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
                        {subUsers?.map((user) => (
                            <SubUser key={user.id} {...user} />
                        ))}
                        {subUsers?.length === 0 && <div className='h-full w-full text-gray-500'>No Subusers Found</div>}
                    </div>
                </TabsContent>

                <TabsContent value="add-user" className='h-full w-full'>
                    <AddSubuser />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default SubUsers;
