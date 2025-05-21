import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { googleMapsApiKey, domain, appDomain, UserAvatar } from '@/constants';
import Wave from '@/components/Wave';
import GoogleMap from '@/components/GoogleMap';
import { AgendaType, EventType } from '@/types';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, CircleX, IndianRupee, MapPin, UserRoundCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiType {
    created_at: string;
    id: number;
    name: string;
    parent_id: number;
    updated_at: string;
    uuid: string;
}

const ExploreViewEvent: React.FC = () => {

    const { slug } = useParams<{ slug: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<EventType | null>(null);
    const startTime = currentEvent?.event_date || "";
    const [agendaData, setAgendaData] = useState<AgendaType[]>([]);
    const [center, setCenter] = useState<{ lat: number; lng: number }>({
        lat: -3.745,  // Default latitude (you can change it to a default location)
        lng: -38.523, // Default longitude
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

    const modalRef = useRef<HTMLDialogElement>(null);

    const [formErrors, setFormErrors] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        email_id: '',
        company_name: '',
        custom_company_name: '',
    });

    const [userDetails, setUserDetails] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email_id: "",
        company: 0,
        company_name: "",
        acceptence: "1",
        industry: "Others",
    });

    const [open, setOpen] = useState(false);
    const [companies, setCompanies] = useState<ApiType[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [customCompanyName, setCustomCompanyName] = useState<string>('');

    const [userAccount, setUserAccount] = useState({
        first_name: '',
        last_name: '',
        email: '',
        mobile_number: '',
        company: '',
        company_name: '',
        step: '1'
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

        if (!userDetails.first_name.trim()) {
            errors.first_name = 'First name is required';
            isValid = false;
        }

        if (!userDetails.last_name.trim()) {
            errors.last_name = 'Last name is required';
            isValid = false;
        }

        if (!userDetails.phone_number.trim()) {
            errors.phone_number = 'Mobile number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(userDetails.phone_number)) {
            errors.phone_number = 'Please enter a valid 10-digit mobile number';
            isValid = false;
        }

        if (!userDetails.email_id.trim()) {
            errors.email_id = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(userDetails.email_id)) {
            errors.email_id = 'Please enter a valid email address';
            isValid = false;
        }

        if (!selectedCompany) {
            errors.company_name = 'Please select a company';
            isValid = false;
        }

        if (selectedCompany === 'Others' && !customCompanyName.trim()) {
            errors.custom_company_name = 'Please specify company name';
            isValid = false;
        }

        setFormErrors(errors);
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

    useEffect(() => {
        if (currentEvent) {
            axios.get(`${domain}/api/all-agendas/${currentEvent.id}`)
                .then((res) => {
                    if (res.data) {
                        // Sort the data in descending order to show the highest position at the top
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

    useEffect(() => {
        if (currentEvent) {
            axios.post(`${domain}/api/event_details_attendee_list/`, {
                event_uuid: currentEvent.uuid,
                phone_number: 9643314331
            })
                .then((res) => {
                    console.log("The data is", res.data.data.speakers);
                    setAllSpeakers(res.data.data.speakers);
                    setAllJury(res.data.data.jury);
                    setViewAgendaBy(res.data.data.view_agenda_by);
                })
                .catch((err) => {
                    console.log("The error is", err);
                });
        }
    }, [currentEvent]);

    // Handle Input Changes
    const handleChange = (e: any) => {
        const { name, value } = e.target;

        if (name === "company_name") {
            setSelectedCompany(value);
        }

        if (name === "custom_company_name") {
            setCustomCompanyName(value);
        }

        setUserDetails((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Clear error when user starts typing
        setFormErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    useEffect(() => {
        axios.get(`${domain}/api/companies`).then(res => setCompanies(res.data.data));
    }, []);

    useEffect(() => {
        // Extract coordinates from Google Maps link
        const extractCoordinates = (url: string | undefined) => {
            if (!url) return null;
            const regex = /https:\/\/maps\.app\.goo\.gl\/([a-zA-Z0-9]+)/;
            const match = url.match(regex);
            if (match) {
                const encodedUrl = decodeURIComponent(match[1]);
                const coordsRegex = /@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/;
                const coordsMatch = encodedUrl.match(coordsRegex);
                if (coordsMatch) {
                    const lat = parseFloat(coordsMatch[1]);
                    const lng = parseFloat(coordsMatch[2]);
                    return { lat, lng };
                }
            }
            return null;
        };

        if (currentEvent) {
            const coords = extractCoordinates(currentEvent?.google_map_link);
            if (coords) {
                setCenter(coords);
            }
        }
    }, [currentEvent]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserAccount(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCompanyChange = (value: string) => {
        setUserAccount(prev => ({
            ...prev,
            company: value,
            company_name: value === '439' ? '' : value
        }));
    };

    const handleCreateAccount = async () => {
        // Add your validation and submission logic here
        try {
            // Your API call logic
            toast.success('Account created successfully!');
            setOpen(false);
        } catch (error) {
            toast.error('Error creating account');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setIsLoading(true);
                // Form is valid, proceed with submission
                const companyId = companies?.find(company => company.name === selectedCompany);
                const newObj = {
                    ...userDetails,
                    company: companyId?.id,
                    company_name: selectedCompany === "Others" ? customCompanyName : selectedCompany,
                    event_uuid: currentEvent?.uuid,
                    paid_event: currentEvent?.paid_event,
                    event_fee: currentEvent?.event_fee
                };

                // Check if user is already registered for both paid and free events
                try {
                    const checkResponse = await axios.post(`${domain}/api/check-existing-attendee`, {
                        email_id: userDetails.email_id,
                        phone_number: userDetails.phone_number,
                        event_uuid: currentEvent?.uuid
                    });

                    if (checkResponse.data.data) {
                        // User is already registered
                        toast("Already Registered",{
                            className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                            icon: <CheckCircle className='size-5' />
                        });
                        return;
                    }

                    // If the event is paid, proceed with payment
                    if (currentEvent?.paid_event === 1) {
                        // Store registration data in localStorage
                        localStorage.setItem('pendingRegistrationData', JSON.stringify(newObj));

                        // Hit the payment API
                        const response = await (await axios.post(`${appDomain}/api/v1/payment/get-payment`, {
                            amount: Number(currentEvent?.event_fee),
                            product: {
                                title: currentEvent.title,
                                price: Number(currentEvent.event_fee)
                            },
                            firstname: userDetails.first_name,
                            email: userDetails.email_id,
                            mobile: userDetails.phone_number
                        })).data;
                        setForm(response);

                        // Store the event slug in localStorage for retrieval after payment
                        if (currentEvent?.slug) {
                            localStorage.setItem('pendingEventSlug', currentEvent.slug);
                        }
                    } else if (currentEvent?.paid_event === 0) {
                        // For free events
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
        }
    };

    useEffect(() => {

        const formData = document.getElementById("payment_post") as HTMLFormElement;
        if (formData) {
            formData.submit()
        }

    }, [form])

    // Check if event date has passed
    const isEventDatePassed = () => {
        if (!currentEvent?.event_start_date) return false;

        const eventDate = new Date(currentEvent.event_start_date);
        eventDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return eventDate < today;
    };

    if (isLoading) {
        return <div className='w-full h-screen flex justify-center items-center'>
            <Wave />
        </div>
    }

    return (
        <div className='w-full min-h-screen bg-brand-foreground text-black overflow-y-auto pb-12'>
            <div
                dangerouslySetInnerHTML={{ __html: form }}
                style={{ opacity: 0 }}
            />

            <div className='max-w-screen-lg flex flex-col-reverse md:flex-row gap-7 justify-center !mx-auto space-y-4 px-5'>
                {/* Left Div */}
                <div className='space-y-4'>
                    <span className='text-gray-700 text-sm'>By {currentEvent?.title}</span>

                    <h1 className='text-2xl font-semibold !mt-0 flex items-center gap-2'>{currentEvent?.title} {currentEvent?.paid_event === 1 && <span className='badge bg-brand-primary text-brand-text font-normal badge-sm'>Paid</span>}</h1>

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
                                    {/* < size={30} className='text-brand-gray' /> */}
                                    <UserRoundCheck size={30} className='text-brand-gray' />
                                </div>

                                <div className=''>
                                    <h4 className='!font-semibold flex items-center'>Pending Approval</h4>
                                    <p className='text-sm -mt-1'>Your registration requires approval from the host.</p>
                                </div>
                            </div>

                            <div className={`p-[10px] ${isEventDatePassed() ? 'blur-[2px]' : ''}`}>
                                <p className='text-sm'>Welcome! Register below to request event access.</p>
                                <Button onClick={() => setOpen(true)} className='w-full mt-[10px] !py-6 text-base hover:bg-brand-primary-dark cursor-pointer duration-300 bg-brand-primary rounded-lg text-white'>
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


                        {/* All Speakers */}
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-5 justify-between'>

                            {/* Single Speaker Deatils */}
                            {allSpeakers.length > 0 ? allSpeakers.map((speaker, index) => (
                                <div key={index} className='max-w-60 max-h-96 overflow-hidden text-ellipsis text-center'>
                                    <img
                                        src={speaker.image ? domain + "/" + speaker.image : UserAvatar}
                                        alt="Speaker"
                                        className='rounded-full mx-auto size-24'
                                    />
                                    <p className='font-semibold text-wrap'>{speaker.first_name + ' ' + speaker.last_name}</p>
                                    <p className='text-wrap text-sm'>{speaker.job_title}</p>
                                    <p className='text-sm font-bold text-wrap capitalize'>{speaker.company_name}</p>
                                </div>
                            )) : <p className='text-brand-gray mb-10 text-nowrap'>No speakers available</p>}
                        </div>
                    </div>


                    {/* Jury */}
                    {(allJury.length > 0) && <div className='mt-6'>
                        <h3 className='font-semibold text-lg'>Jury</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />


                        {/* All Juries */}
                        <div className='grid grid-cols-2 md:grid-cols-3 gap-5 justify-between'>

                            {/* Single Jury Deatils */}
                            {allJury.map((jury, index) => (
                                <div key={index} className='max-w-60 max-h-96 overflow-hidden text-ellipsis text-center'>
                                    <img
                                        src={jury.image ? domain + "/" + jury.image : UserAvatar}
                                        alt="Jury"
                                        className='rounded-full mx-auto size-24'
                                    />
                                    <p className='font-semibold text-wrap'>{jury.first_name + ' ' + jury.last_name}</p>
                                    <p className='text-wrap text-sm'>{jury.job_title}</p>
                                    <p className='text-sm font-bold text-wrap capitalize'>{jury.company_name}</p>
                                </div>
                            ))
                                //  : <p className='text-brand-gray mb-10 text-nowrap'>No jury available</p>
                            }
                        </div>
                    </div>}


                    {/* Agenda Details */}
                    {viewAgendaBy == 0 && <div className='mt-6'>
                        <h3 className='font-semibold text-lg'>Agenda Details</h3>
                        <hr className='border-t-2 border-white !my-[10px]' />


                        {/* Single Day Agenda Details */}
                        <div>
                            {/* <div className='p-2 bg-white rounded-lg font-semibold'>
                                Day 1 (Friday, 17th Jan 2025)
                            </div> */}

                            {/* All Rows Wrapper */}
                            <div>
                                {/* Single Row */}
                                {agendaData.length > 0 ? agendaData.map((agenda) => (
                                    <div key={agenda.id} className='!my-4'>
                                        <h5 className='font-semibold'>{agenda?.start_time}:{agenda?.start_minute_time}  {agenda?.start_time_type} - {agenda?.end_time}:{agenda?.end_minute_time} {agenda?.end_time_type}</h5>
                                        <p className='font-light'>{agenda.description}</p>

                                        {/* All Images */}
                                        <div className='flex gap-5 my-3'>
                                            <div className='grid grid-cols-2 gap-5'>
                                                {agenda.speakers.map((speaker) => (
                                                    <div key={speaker.id} className='flex gap-3 max-w-80 text-ellipsis overflow-hidden text-nowrap'>
                                                        <img src={`${domain}/${speaker.image}`} alt="user" className='size-14 rounded-full' />
                                                        <div className='space-y-1'>
                                                            <p className='font-semibold text-lg leading-none'>{speaker.first_name} {speaker.last_name}</p>
                                                            <p className='text-sm leading-none'>{speaker.company_name}</p>
                                                            <p className='text-xs leading-none'>{speaker.job_title}</p>
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
                                            value={userAccount.email}
                                            onChange={handleInputChange}
                                            name='email'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>

                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Mobile Number</Label>
                                    <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end'>
                                        <Input
                                            value={userAccount.mobile_number}
                                            onChange={handleInputChange}
                                            name='mobile_number'
                                            className='input !h-full min-w-full absolute right-0 text-base z-10'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className='flex gap-5 justify-between mt-5'>
                                <div className='flex gap-2 flex-col w-full'>
                                    <Label className='font-semibold'>Company Name</Label>
                                    <Select onValueChange={handleCompanyChange}>
                                        <SelectTrigger className="w-full bg-white !h-12 cursor-pointer">
                                            <SelectValue placeholder="Company Name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map((company: ApiType) => (
                                                <SelectItem
                                                    key={company.id}
                                                    value={company.id.toString()}
                                                    className='cursor-pointer'
                                                >
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {userAccount.company === '439' && (
                                        <div className='input !h-12 !min-w-full relative !p-1 flex items-center justify-end mt-2'>
                                            <Input
                                                value={userAccount.company_name}
                                                onChange={handleInputChange}
                                                name='company_name'
                                                type='text'
                                                placeholder="Enter custom company name"
                                                className='input !h-full min-w-full absolute right-0 text-base z-10'
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button onClick={handleCreateAccount} className='mt-5 btn mx-auto w-full'>Submit</Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ExploreViewEvent;
