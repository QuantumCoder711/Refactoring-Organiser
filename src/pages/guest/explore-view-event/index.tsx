import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { googleMapsApiKey, domain, appDomain, UserAvatar } from '@/constants';
import Wave from '@/components/Wave';
import GoogleMap from '@/components/GoogleMap';
import { AgendaType, EventType } from '@/types';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, CircleX, IndianRupee, MapPin, UserRoundCheck, ChevronDown, Check } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import useExtrasStore from '@/store/extrasStore';

// Custom Combo Box Component for company names with filtering and creation
const CustomComboBox = React.memo(({
    label,
    value,
    onValueChange,
    placeholder,
    options,
    required = false
}: {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { id: number; name: string }[];
    required?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSearchTerm(newValue);
        setIsOpen(true);
        onValueChange(newValue);
    };

    // Handle option selection
    const handleOptionSelect = (option: { id: number; name: string }) => {
        setInputValue(option.name);
        setSearchTerm('');
        setIsOpen(false);
        onValueChange(option.name);
        inputRef.current?.blur();
    };

    // Handle creating new option
    const handleCreateNew = () => {
        setInputValue(searchTerm);
        setIsOpen(false);
        onValueChange(searchTerm);
        inputRef.current?.blur();
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update input value when value prop changes
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div className="flex gap-2 flex-col w-full" ref={dropdownRef}>
            <Label className="font-semibold">
                {label} {required && <span className="text-brand-secondary">*</span>}
            </Label>
            <div className="relative">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        className="w-full bg-white !h-12 text-base pr-10"
                    />
                    <ChevronDown
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 size-4 opacity-50 transition-transform cursor-pointer ${isOpen ? 'rotate-180' : ''}`}
                        onClick={() => {
                            setIsOpen(!isOpen);
                            inputRef.current?.focus();
                        }}
                    />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between text-sm"
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <span>{option.name}</span>
                                    {inputValue === option.name && (
                                        <Check className="size-4 text-brand-secondary" />
                                    )}
                                </div>
                            ))
                        ) : searchTerm ? (
                            <div
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-brand-secondary text-sm font-medium"
                                onClick={handleCreateNew}
                            >
                                Create "{searchTerm}"
                            </div>
                        ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                No companies found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});

const ExploreViewEvent: React.FC = () => {
    let { slug } = useParams<{ slug: string }>();
    const urlSlug = slug?.split("_");
    const slugParts = slug?.split("_");
    slug = slugParts?.[0];
    const [isLoading, setIsLoading] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
    const startTime = currentEvent?.event_date || "";
    const [agendaData, setAgendaData] = useState<AgendaType[]>([]);
    const [center, setCenter] = useState<{ lat: number; lng: number }>({
        lat: -3.745,
        lng: -38.523,
    });

    const [allSpeakers, setAllSpeakers] = useState<any[]>([]);
    const [allJury, setAllJury] = useState<any[]>([]);
    const [viewAgendaBy, setViewAgendaBy] = useState<number>(0);

    const [form, setForm] = useState({
        amount: 0,
        product: {
            title: '',
            price: 0,
        },
        firstname: '',
        email: '',
        mobile: ''
    });

    const [open, setOpen] = useState(false);
    const { companies, getCompanies } = useExtrasStore(state => state);

    const [userAccount, setUserAccount] = useState({
        first_name: '',
        last_name: '',
        email_id: '',
        phone_number: '',
        company_name: '',
        acceptance: '1',
        industry: 'Others'
    });

    const validateForm = () => {
        let isValid = true;
        const errors = {
            first_name: '',
            last_name: '',
            phone_number: '',
            email_id: '',
            company_name: '',
            custom_company_name: ''
        };

        if (!userAccount.first_name.trim()) {
            errors.first_name = 'First name is required';
            isValid = false;
        }

        if (!userAccount.last_name.trim()) {
            errors.last_name = 'Last name is required';
            isValid = false;
        }

        if (!userAccount.phone_number.trim()) {
            errors.phone_number = 'Mobile number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(userAccount.phone_number)) {
            errors.phone_number = 'Please enter a valid 10-digit mobile number';
            isValid = false;
        }

        if (!userAccount.email_id.trim()) {
            errors.email_id = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(userAccount.email_id)) {
            errors.email_id = 'Please enter a valid email address';
            isValid = false;
        }

        if (!userAccount.company_name.trim()) {
            errors.company_name = 'Please select a company';
            isValid = false;
        }

        return isValid;
    };

    useEffect(() => {
        if (slug) {
            try {
                setIsLoading(true);
                axios.get(`${domain}/api/all_events`)
                    .then((res: any) => {
                        setCurrentEvent(res.data.data.find((event: any) => event.slug === slug));
                    })
                    .catch((err: any) => {
                        console.log(err);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [slug]);

    useEffect(() => {
        getCompanies(userAccount.company_name);
    }, [userAccount.company_name])

    useEffect(() => {
        if (currentEvent) {
            axios.get(`${domain}/api/all-agendas/${currentEvent.id}`)
                .then((res) => {
                    if (res.data) {
                        const sortedData = res.data.data.sort((a: AgendaType, b: AgendaType) => a.position - b.position);
                        setAgendaData(sortedData);

                        extractCoordinates(currentEvent?.event_venue_address_1).then((coords) => {
                            if (coords) {
                                setCenter(coords);
                            }
                        });
                    }
                });
        }
    }, [currentEvent]);

    // Express interest API call - run once when the slug (string) becomes available
    useEffect(() => {
        if (urlSlug && slug) {
            const customs = urlSlug.slice(1);
            axios.get(`${domain}/api/express-interest/${customs.join("_")}`).then(res => {
                if (res.data.message) {
                    toast(res.data.message, {
                        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CheckCircle className='size-5' />
                    });
                }
            });
        }
    }, [slug]);

    useEffect(() => {
        if (currentEvent) {
            axios.post(`${domain}/api/event_details_attendee_list/`, {
                event_uuid: currentEvent.uuid,
                phone_number: 9643314331
            })
                .then((res) => {
                    setAllSpeakers(res.data.data.speakers);
                    setAllJury(res.data.data.jury);
                    setViewAgendaBy(res.data.data.view_agenda_by);
                })
                .catch((err) => {
                    console.log("The error is", err);
                });
        }
    }, [currentEvent]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserAccount(prev => ({
            ...prev,
            [name]: value
        }));
    };



    const handleCreateAccount = async () => {
        if (!validateForm()) return;

        try {
            setIsLoading(true);
            const newObj = {
                ...userAccount,
                event_uuid: currentEvent?.uuid,
                paid_event: currentEvent?.paid_event,
                event_fee: currentEvent?.event_fee
            };

            // Check if user is already registered
            try {
                const checkResponse = await axios.post(`${domain}/api/check-existing-attendee`, {
                    email_id: userAccount.email_id,
                    phone_number: userAccount.phone_number,
                    event_uuid: currentEvent?.uuid
                });

                if (checkResponse.data.data) {
                    toast("Already Registered", {
                        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                        icon: <CheckCircle className='size-5' />
                    });
                    setOpen(false);
                    return;
                }

                // Handle paid event
                if (currentEvent?.paid_event === 1) {
                    localStorage.setItem('pendingRegistrationData', JSON.stringify(newObj));

                    const response = await axios.post(`${appDomain}/api/v1/payment/get-payment`, {
                        amount: Number(currentEvent?.event_fee),
                        product: {
                            title: currentEvent.title,
                            price: Number(currentEvent.event_fee)
                        },
                        firstname: userAccount.first_name,
                        email: userAccount.email_id,
                        mobile: userAccount.phone_number
                    });
                    setForm(response.data);

                    if (currentEvent?.slug) {
                        localStorage.setItem('pendingEventSlug', currentEvent.slug);
                    }
                } else {
                    // Handle free event
                    const response = await axios.post(`${domain}/api/request_event_invitation`, {
                        ...newObj
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.data.status === 200) {
                        toast("Registration Successful", {
                            className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <CheckCircle className='size-5' />
                        });
                    } else {
                        toast("Registration Failed", {
                            className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <CircleX className='size-5' />
                        });
                    }
                }
                setOpen(false);
            } catch (error) {
                console.error("Error checking existing attendee:", error);
                toast("Error checking existing attendee", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast("An error occurred during registration", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const formData = document.getElementById("payment_post") as HTMLFormElement;
        if (formData) {
            formData.submit();
        }
    }, [form]);

    const isEventDatePassed = () => {
        if (!currentEvent?.event_start_date) return false;

        const eventDate = new Date(currentEvent.event_start_date);
        eventDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return eventDate < today;
    };

    // Extract coordinates from Google Maps link
    const extractCoordinates = async (address: string | undefined) => {
        if (!address) return;

        try {
            // Create a script element for Google Maps API
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            // Wait for script to load before making the geocoding request
            await new Promise(resolve => script.onload = resolve);

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                return { lat, lng };
            }

            return;
        } catch (error) {
            console.error('Error getting coordinates:', error);
            return;
        }
    };

    if (isLoading) {
        return <div className='w-full h-screen flex justify-center items-center'>
            <Wave />
        </div>
    }

    return (
        <div className='w-full min-h-screen bg-brand-foreground text-black overflow-y-auto pb-12'>
            <div
                dangerouslySetInnerHTML={{ __html: form as unknown as string }}
                style={{ opacity: 0 }}
            />

            <div className='max-w-screen-lg flex flex-col-reverse md:flex-row gap-7 justify-center !mx-auto space-y-4 px-5'>
                {/* Left Div */}
                <div className='space-y-4'>
                    <span className='text-gray-700 text-sm'>By {currentEvent?.title}</span>

                    <h1 className='text-2xl font-semibold !mt-0 flex items-center gap-2'>{currentEvent?.title} {currentEvent?.paid_event === 1 && <span className='inline-block ml-2 text-white bg-brand-primary text-brand-text font-normal px-2 py-0.5 rounded-full text-xs'>
                        Paid
                    </span>}</h1>

                    {/* Row for Start Date */}
                    <div className='flex gap-2'>
                        <div className='rounded-md grid place-content-center size-10 bg-white'>
                            <p className='uppercase text-orange-500 font-semibold text-xs text-center'>
                                {startTime ? new Date(startTime).toLocaleString('en-US', { weekday: 'short' }).toUpperCase() : ''}
                            </p>
                            <p className='text-2xl leading-none font-semibold text-brand-gray'>
                                {startTime ? new Date(startTime).getDate() : ''}
                            </p>
                        </div>
                        <div>
                            <h4 className='font-semibold'>{formatDateTime(startTime)}</h4>
                            <p className='text-sm text-brand-gray'>{currentEvent?.start_time}:{currentEvent?.start_minute_time}  {currentEvent?.start_time_type} - {currentEvent?.end_time}:{currentEvent?.end_minute_time} {currentEvent?.end_time_type}</p>
                        </div>
                    </div>

                    {/* Row for Location */}
                    <div className='flex gap-2'>
                        <a href={currentEvent?.google_map_link} className='flex gap-2'>
                            <div className='rounded-md grid place-content-center size-10 bg-white'>
                                <MapPin size={30} className='text-brand-gray' />
                            </div>

                            <div>
                                <h4 className='font-semibold flex items-center'>{currentEvent?.event_venue_name} <ArrowRight size={20} className='-rotate-45' /></h4>
                                <p className='text-sm text-brand-gray'>{currentEvent?.city}, {currentEvent?.pincode}</p>
                            </div>
                        </a>
                    </div>

                    {/* Row for Event Fee */}
                    {currentEvent?.paid_event === 1 && <div className='flex gap-2'>
                        <div className='flex gap-2'>
                            <div className='rounded-md grid place-content-center size-10 bg-white'>
                                <IndianRupee size={30} className='text-brand-gray' />
                            </div>

                            <div>
                                <h4 className='font-semibold flex items-center'>Event Fee</h4>
                                <p className='text-sm text-brand-primary font-bold'>{currentEvent?.event_fee} /-</p>
                            </div>
                        </div>
                    </div>}

                    {/* Row for Registration */}
                    <div className='border border-white rounded-[10px]'>
                        <p className='text-sm p-[10px]'>
                            {isEventDatePassed() ?
                                'Registration Closed' :
                                'Registration'
                            }
                        </p>

                        <div className={`rounded-b-[10px] bg-white ${isEventDatePassed() ? 'opacity-50' : ''}`}>
                            <div className={`flex gap-2 p-[10px] border-b ${isEventDatePassed() ? 'blur-[2px]' : ''}`}>
                                <div className='rounded-md grid place-content-center size-10 bg-white'>
                                    <UserRoundCheck size={30} className='text-brand-gray' />
                                </div>

                                <div className=''>
                                    <h4 className='!font-semibold flex items-center'>Pending Approval</h4>
                                    <p className='text-sm -mt-1'>Your registration requires approval from the host.</p>
                                </div>
                            </div>

                            <div className={`p-[10px] ${isEventDatePassed() ? 'blur-[2px]' : ''}`}>
                                <p className='text-sm'>Welcome! Register below to request event access.</p>
                                <Button disabled={isEventDatePassed()} onClick={() => setOpen(true)} className='w-full mt-[10px] !py-6 text-base hover:bg-brand-primary-dark cursor-pointer duration-300 bg-brand-primary rounded-lg text-white'>
                                    Get an Invite
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className='mt-6'>
                        <h3 className='font-semibold text-lg'>Event Details</h3>
                        <hr className='border-t-2 border-white my-[10px]' />
                        <p className='text-brand-gray'>{currentEvent?.description}</p>
                    </div>

                    {/* Speakers */}
                    <div className='mt-6'>
                        <h3 className='font-semibold text-lg'>Speakers</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-5 justify-between'>
                            {allSpeakers.length > 0 ? allSpeakers.map((speaker, index) => (
                                <div key={index} className='max-w-60 max-h-96 overflow-hidden text-ellipsis text-center'>
                                    <img
                                        src={speaker.image ? domain + "/" + speaker.image : UserAvatar}
                                        alt="Speaker"
                                        className='rounded-full mx-auto size-24'
                                    />
                                    <p className='font-semibold text-wrap capitalize'>{speaker.first_name + ' ' + speaker.last_name}</p>
                                    <p className='text-wrap text-sm capitalize'>{speaker.job_title}</p>
                                    <p className='text-sm font-bold text-wrap capitalize'>{speaker.company_name}</p>
                                </div>
                            )) : <p className='text-brand-gray mb-10 text-nowrap'>No speakers available</p>}
                        </div>
                    </div>

                    {/* Jury */}
                    {(allJury.length > 0) && <div className='mt-6'>
                        <h3 className='font-semibold text-lg'>Jury</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-5 justify-between'>
                            {allJury.map((jury, index) => (
                                <div key={index} className='max-w-60 max-h-96 overflow-hidden text-ellipsis text-center'>
                                    <img
                                        src={jury.image ? domain + "/" + jury.image : UserAvatar}
                                        alt="Jury"
                                        className='rounded-full mx-auto size-24'
                                    />
                                    <p className='font-semibold text-wrap capitalize'>{jury.first_name + ' ' + jury.last_name}</p>
                                    <p className='text-wrap text-sm capitalize'>{jury.job_title}</p>
                                    <p className='text-sm font-bold text-wrap capitalize'>{jury.company_name}</p>
                                </div>
                            ))}
                        </div>
                    </div>}

                    {/* Agenda Details */}
                    {viewAgendaBy == 0 && <div className='mt-6'>
                        <h3 className='font-semibold text-lg'>Agenda Details</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />
                        <div>
                            <div>
                                {agendaData.length > 0 ? agendaData.map((agenda) => (
                                    <div key={agenda.id} className='!my-4'>
                                        <h5 className='font-semibold'>{agenda?.start_time}:{agenda?.start_minute_time}  {agenda?.start_time_type} - {agenda?.end_time}:{agenda?.end_minute_time} {agenda?.end_time_type}</h5>
                                        <p className='font-light'>{agenda.description}</p>
                                        <div className='flex gap-5 my-3'>
                                            <div className='grid grid-cols-2 gap-5'>
                                                {agenda.speakers.map((speaker) => (
                                                    <div key={speaker.id} className='flex gap-3 max-w-80 text-ellipsis overflow-hidden text-nowrap'>
                                                        <img src={`${domain}/${speaker.image}`} alt="user" className='size-14 rounded-full' />
                                                        <div className='space-y-1'>
                                                            <p className='font-semibold text-lg leading-none capitalize'>{speaker.first_name} {speaker.last_name}</p>
                                                            <p className='text-sm leading-none capitalize'>{speaker.company_name}</p>
                                                            <p className='text-xs leading-none capitalize'>{speaker.job_title}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className='text-brand-gray mb-10'>No agenda available</p>}
                            </div>
                        </div>
                    </div>}

                    <div className='mt-10 md:hidden md:mt-[5.8rem]'>
                        <h3 className='font-semibold text-lg'>Location</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />
                        <p className='text-brand-gray'><strong className='text-black'>{currentEvent?.event_venue_name}</strong> <br />
                            {currentEvent?.event_venue_address_2}</p>
                        <div className='rounded-lg w-full h-full mt-[10px] p-2 overflow-hidden md:w-[300px] md:h-[300px]'>
                            <GoogleMap latitude={center.lat} longitude={center.lng} isLoaded={true} zoom={18} />
                        </div>
                    </div>
                </div>

                {/* Right Div */}
                <div className='max-w-full mx-auto md:max-w-[300px]'>
                    <img src={domain + "/" + currentEvent?.image} alt="Background Image" className='rounded-lg w-60 mx-auto md:w-full' />

                    <div className='mt-10 hidden md:block md:mt-[5.8rem]'>
                        <h3 className='font-semibold text-lg'>Location</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />
                        <p className='text-brand-gray'><strong className='text-black'>{currentEvent?.event_venue_name}</strong> <br />
                            {currentEvent?.event_venue_address_2}</p>
                        <div className='rounded-lg w-full h-full mt-[10px] p-2 overflow-hidden md:w-[300px] md:h-[300px]'>
                            <GoogleMap latitude={center.lat} longitude={center.lng} isLoaded={true} zoom={18} />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='bg-brand-light'>
                    <DialogHeader>
                        <DialogTitle className='text-center text-2xl'>Get an Invite</DialogTitle>

                        <div>
                            {/* First Name & Last Name */}
                            <div className='flex gap-5 justify-between'>
                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>First Name</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.first_name}
                                            onChange={handleInputChange}
                                            name='first_name'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex mt-5 gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Last Name</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.last_name}
                                            onChange={handleInputChange}
                                            name='last_name'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email & Mobile Number */}
                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Email</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.email_id}
                                            onChange={handleInputChange}
                                            name='email_id'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Mobile Number</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.phone_number}
                                            onChange={handleInputChange}
                                            name='phone_number'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className='flex gap-5 justify-between mt-5'>
                                <CustomComboBox
                                    label="Company Name"
                                    value={userAccount.company_name}
                                    onValueChange={(value: string) => setUserAccount(prev => ({ ...prev, company_name: value }))}
                                    placeholder="Type or select company"
                                    options={companies.map((company, index) => ({ id: index + 1, name: company.company }))}
                                    required
                                />
                            </div>

                            <Button onClick={handleCreateAccount} className='mt-5 btn mx-auto w-full'>Submit</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExploreViewEvent;
