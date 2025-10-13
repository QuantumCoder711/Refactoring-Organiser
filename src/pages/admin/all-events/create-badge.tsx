import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useEventStore from '@/store/eventStore';
import { AttendeeType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, Image as ImageIcon, X } from 'lucide-react';
import PrintBadge from '@/components/PrintBadge';
import axios from 'axios';
import { domain, token } from '@/constants';
import { toast } from 'sonner';
import DefaultBanner from "@/assets/default-banner-image.jpg";
import { getImageUrl } from '@/lib/utils';
import GoBackButton from '@/components/GoBack';

interface StatusColors {
    background: string;
    text: string;
}

interface StatusColorMap {
    [key: string]: StatusColors;
}

interface BadgeCustomization {
    backgroundColor: string;
    textColor: string;
    statusColors: StatusColorMap;
    image: string | null | undefined;
}

const STATUS_OPTIONS = [
    { value: 'delegate', label: 'Delegate' },
    { value: 'speaker', label: 'Speaker' },
    { value: 'sponsor', label: 'Sponsor' },
    { value: 'panelist', label: 'Panelist' },
];

const CreateBadge: React.FC = () => {
    const { slug } = useParams();
    const event = useEventStore((state) => state.getEventBySlug(slug));
    const [customization, setCustomization] = useState<BadgeCustomization>({
        backgroundColor: "var(--background)",
        textColor: "var(--foreground)",
        statusColors: {
            delegate: { background: event?.delegate_tag_color || '#0071E3', text: event?.delegate_text_color || '#ffffff' },
            speaker: { background: event?.speaker_tag_color || '#0071E3', text: event?.speaker_text_color || '#ffffff' },
            sponsor: { background: event?.sponsor_tag_color || '#0071E3', text: event?.sponsor_text_color || '#ffffff' },
            panelist: { background: event?.panelist_tag_color || '#0071E3', text: event?.panelist_text_color || '#ffffff' },
        },
        image: event?.badge_banner ? event.badge_banner : DefaultBanner,
    });
    const [selectedStatus, setSelectedStatus] = useState<string>('delegate');
    const [name, setName] = useState('John Doe');
    const [company, setCompany] = useState('Google');
    const [jobTitle, setJobTitle] = useState('Senior Developer');


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomization(prev => ({
                    ...prev,
                    image: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setCustomization(prev => ({
            ...prev,
            image: DefaultBanner
        }));
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
    };

    const handleStatusColorChange = (status: string, field: 'background' | 'text', value: string) => {
        setCustomization(prev => ({
            ...prev,
            statusColors: {
                ...prev.statusColors,
                [status]: {
                    ...prev.statusColors[status],
                    [field]: value
                }
            }
        }));
    };

    const handleSubmit = async () => {
        const data = new FormData();
        data.append('_method', 'PUT');

        if (
            customization.image &&
            typeof customization.image === 'string' &&
            (customization.image.startsWith('data:') || customization.image === DefaultBanner)
        ) {
            // User uploaded a new image or selected the default banner
            let imageUrl = customization.image;
            if (customization.image === DefaultBanner) {
                // If it's the imported default, fetch it as a blob
                imageUrl = DefaultBanner;
            }
            const matches = imageUrl.match(/^data:(.+);base64/);
            let mimeType = 'image/png';
            let fileExt = 'png';
            if (matches) {
                mimeType = matches[1];
                fileExt = mimeType.split('/')[1] || 'png';
            } else if (imageUrl === DefaultBanner) {
                // Try to infer from the file extension
                const extMatch = DefaultBanner.match(/\.([a-zA-Z0-9]+)$/);
                fileExt = extMatch ? extMatch[1] : 'jpg';
                mimeType = `image/${fileExt}`;
            }
            const fileName = `badge_banner.${fileExt}`;
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();
            const file = new File([blob], fileName, { type: mimeType });
            data.append('badge_banner', file, fileName);
        }

        data.append('speaker_tag_color', customization.statusColors.speaker.background);
        data.append('speaker_text_color', customization.statusColors.speaker.text);
        data.append('delegate_tag_color', customization.statusColors.delegate.background);
        data.append('delegate_text_color', customization.statusColors.delegate.text);
        data.append('sponsor_tag_color', customization.statusColors.sponsor.background);
        data.append('sponsor_text_color', customization.statusColors.sponsor.text);
        data.append('panelist_tag_color', customization.statusColors.panelist.background);
        data.append('panelist_text_color', customization.statusColors.panelist.text);

        const apiResponse = await axios.post(`${domain}/api/update-badge/${event?.id}`, data, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data"  // Changed to multipart/form-data for file uploads
            }
        });

        if (apiResponse.data.status === 200) {
            toast(apiResponse.data.message, {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className="size-5" />
            });
            // Update the event in the event store as well
            if (event) {
                useEventStore.setState((state) => ({
                    events: state.events.map(e =>
                        e.id === event.id
                            ? {
                                ...e,
                                badge_banner: customization.image || DefaultBanner,
                                speaker_tag_color: customization.statusColors.speaker.background,
                                speaker_text_color: customization.statusColors.speaker.text,
                                delegate_tag_color: customization.statusColors.delegate.background,
                                delegate_text_color: customization.statusColors.delegate.text,
                                sponsor_tag_color: customization.statusColors.sponsor.background,
                                sponsor_text_color: customization.statusColors.sponsor.text,
                                panelist_tag_color: customization.statusColors.panelist.background,
                                panelist_text_color: customization.statusColors.panelist.text,
                            }
                            : e
                    )
                }));
            }
        }

    };

    // Create a dummy attendee with the current customization
    const dummyAttendee: AttendeeType = {
        id: 1,
        uuid: 'dummy-uuid',
        user_id: 1,
        event_id: 1,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' '),
        email_id: 'john.doe@example.com',
        phone_number: '1234567890',
        country_code: "91",
        website: 'https://example.com',
        linkedin_page_link: 'https://linkedin.com/in/johndoe',
        employee_size: '1-10',
        company_turn_over: 'Less than $1M',
        status: selectedStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image: null,
        virtual_business_card: null,
        profile_completed: 1,
        alternate_mobile_number: '',
        alternate_email: null,
        company_name: company,
        industry: 'Technology',
        job_title: jobTitle,
        event_invitation: 1,
        user_invitation_request: 0,
        check_in: 0,
        check_in_second: null,
        check_in_third: null,
        check_in_forth: null,
        check_in_fifth: null,
        check_in_time: null,
        check_in_second_time: null,
        check_in_third_time: null,
        check_in_forth_time: null,
        check_in_fifth_time: null,
        not_invited: 0,
        award_winner: 0,
        break_out_room_and_time: [],
        title: `${name.split(' ')[0]} ${name.split(' ').slice(1).join(' ')}`
    };

    return (
        <div className='w-full px-4'>
            <div className='max-w-6xl mx-auto'>
                <div className='flex items-center mb-6 gap-2'>
                    {/* <Button variant="ghost" size="sm" className='mr-2 cursor-pointer bg-brand-primary hover:bg-brand-primary-dark text-white duration-300' onClick={() => navigate(-1)}>
                        <ChevronLeft className='w-4 h-4 mr-1' /> Back
                    </Button> */}
                    <GoBackButton />
                    <h1 className='text-2xl font-bold'>{event?.title}</h1>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Preview Section */}
                    <div className='lg:col-span-1'>
                        <Card className='sticky top-8'>
                            <CardHeader>
                                <CardTitle>Badge Preview</CardTitle>
                            </CardHeader>
                            <CardContent className='flex justify-center'>
                                <div className='w-full'>
                                    <PrintBadge
                                        attendee={dummyAttendee}
                                        image={customization.image || null}
                                        print={false}
                                        statusBackground={customization.statusColors[selectedStatus]?.background || "var(--primary)"}
                                        statusTextColor={customization.statusColors[selectedStatus]?.text || "var(--primary-text)"}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Customization Controls */}
                    <div className='lg:col-span-2 space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Badge Information</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='name'>Name</Label>
                                        <Input
                                            id='name'
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter name"
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='company'>Company</Label>
                                        <Input
                                            id='company'
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            placeholder="Enter company"
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='jobTitle'>Job Title</Label>
                                        <Input
                                            id='jobTitle'
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="Enter job title"
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Status</Label>
                                        <div className='flex flex-wrap gap-2'>
                                            {STATUS_OPTIONS.map((option) => (
                                                <Button
                                                    key={option.value}
                                                    variant={selectedStatus === option.value ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleStatusChange(option.value)}
                                                >
                                                    {option.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Customize Appearance</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='space-y-6 w-full'>
                                    <div className='space-y-4'>
                                        <div className='space-y-2 relative'>
                                            <div className='flex justify-between items-center'>
                                                <Label>Background Image</Label>
                                                {customization.image && customization.image !== DefaultBanner && (
                                                    <div className='relative z-10'>
                                                        <Button
                                                            type='button'
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveImage();
                                                            }}
                                                            className='text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer duration-300'
                                                        >
                                                            <X className='w-4 h-4' />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex items-center flex-col gap-2'>
                                                <label className='flex-1 w-full'>
                                                    <div className='flex items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 overflow-hidden'>
                                                        <img
                                                            src={
                                                                customization.image
                                                                    ? (typeof customization.image === 'string' &&
                                                                        (customization.image.startsWith('data:') ||
                                                                            customization.image.startsWith('/') ||
                                                                            customization.image.startsWith('http')))
                                                                        ? customization.image
                                                                        : getImageUrl(customization.image)
                                                                    : DefaultBanner
                                                            }
                                                            alt="Badge background"
                                                            className='h-full w-full object-cover rounded-md'
                                                        />
                                                        {(!customization.image || customization.image === DefaultBanner) && (
                                                            <div className='absolute inset-0 flex items-center justify-center'>
                                                                <div className='text-center p-4 bg-white bg-opacity-90 rounded-lg'>
                                                                    <ImageIcon className='w-6 h-6 mx-auto mb-1 text-gray-600' />
                                                                    <p className='text-sm text-gray-700'>Click to upload</p>
                                                                    <p className='text-xs text-gray-500'>PNG, JPG, JPEG (max 2MB)</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {customization.image && customization.image !== DefaultBanner && (
                                                            <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 transition-opacity pointer-events-none'>
                                                                <div className='text-center p-4 bg-white bg-opacity-90 rounded-lg pointer-events-auto'>
                                                                    <ImageIcon className='w-6 h-6 mx-auto mb-1 text-gray-600' />
                                                                    <p className='text-sm text-gray-700'>Change image</p>
                                                                    <p className='text-xs text-gray-500'>PNG, JPG, JPEG (max 2MB)</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className='hidden'
                                                            accept='image/*'
                                                            onChange={handleImageUpload}
                                                        />
                                                    </div>
                                                </label>

                                            </div>
                                        </div>

                                        <div className='space-y-4'>
                                            <Label>Status Bar Colors</Label>
                                            <div className='space-y-4 p-4 border rounded-lg'>
                                                <div className='space-y-2'>
                                                    <Label className='text-sm'>Selected Status: <span className='capitalize font-medium'>{selectedStatus}</span></Label>
                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div className='space-y-1'>
                                                            <Label className='text-xs'>Background</Label>
                                                            <div className='flex items-center gap-2'>
                                                                <input
                                                                    type="color"
                                                                    value={customization.statusColors[selectedStatus]?.background || '#000000'}
                                                                    onChange={(e) => handleStatusColorChange(selectedStatus, 'background', e.target.value)}
                                                                    className='w-10 h-8 p-1 border rounded cursor-pointer'
                                                                />
                                                                <Input
                                                                    value={customization.statusColors[selectedStatus]?.background || '#000000'}
                                                                    onChange={(e) => handleStatusColorChange(selectedStatus, 'background', e.target.value)}
                                                                    className='flex-1 text-sm h-8'
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className='space-y-1'>
                                                            <Label className='text-xs'>Text Color</Label>
                                                            <div className='flex items-center gap-2'>
                                                                <input
                                                                    type="color"
                                                                    value={customization.statusColors[selectedStatus]?.text || '#ffffff'}
                                                                    onChange={(e) => handleStatusColorChange(selectedStatus, 'text', e.target.value)}
                                                                    className='w-10 h-8 p-1 border rounded cursor-pointer'
                                                                />
                                                                <Input
                                                                    value={customization.statusColors[selectedStatus]?.text || '#ffffff'}
                                                                    onChange={(e) => handleStatusColorChange(selectedStatus, 'text', e.target.value)}
                                                                    className='flex-1 text-sm h-8'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className='flex justify-end gap-3 pt-4'>
                            <Button onClick={handleSubmit} className='cursor-pointer bg-brand-primary hover:bg-brand-primary-dark text-white duration-300'>Save Template</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBadge;











































































// import React, { useState } from 'react';
// import { useParams } from 'react-router-dom';
// import useEventStore from '@/store/eventStore';
// import { AttendeeType } from '@/types';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { CircleCheck, Image as ImageIcon, X } from 'lucide-react';
// import PrintBadge from '@/components/PrintBadge';
// import axios from 'axios';
// import { domain, token } from '@/constants';
// import { toast } from 'sonner';
// import DefaultBanner from "@/assets/default-banner-image.jpg";
// import { getImageUrl } from '@/lib/utils';
// import GoBackButton from '@/components/GoBack';

// interface StatusColors {
//     background: string;
//     text: string;
// }

// interface StatusColorMap {
//     [key: string]: StatusColors;
// }

// interface BadgeCustomization {
//     backgroundColor: string;
//     textColor: string;
//     statusColors: StatusColorMap;
//     image: string | null | undefined;
// }

// const STATUS_OPTIONS = [
//     { value: 'delegate', label: 'Delegate' },
//     { value: 'speaker', label: 'Speaker' },
//     { value: 'sponsor', label: 'Sponsor' },
//     { value: 'panelist', label: 'Panelist' },
// ];

// // Add the getImageSource function
// const getImageSource = (image: string | null | undefined) => {
//     if (!image) return DefaultBanner;
    
//     if (typeof image === 'string') {
//         if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) {
//             return image;
//         }
//         return getImageUrl(image);
//     }
    
//     return DefaultBanner;
// };

// const CreateBadge: React.FC = () => {
//     const { slug } = useParams();
//     const event = useEventStore((state) => state.getEventBySlug(slug));
//     const [customization, setCustomization] = useState<BadgeCustomization>({
//         backgroundColor: "var(--background)",
//         textColor: "var(--foreground)",
//         statusColors: {
//             delegate: { background: event?.delegate_tag_color || '#0071E3', text: event?.delegate_text_color || '#ffffff' },
//             speaker: { background: event?.speaker_tag_color || '#0071E3', text: event?.speaker_text_color || '#ffffff' },
//             sponsor: { background: event?.sponsor_tag_color || '#0071E3', text: event?.sponsor_text_color || '#ffffff' },
//             panelist: { background: event?.panelist_tag_color || '#0071E3', text: event?.panelist_text_color || '#ffffff' },
//         },
//         image: event?.badge_banner ? event.badge_banner : DefaultBanner,
//     });
//     const [selectedStatus, setSelectedStatus] = useState<string>('delegate');
//     const [name, setName] = useState('John Doe');
//     const [company, setCompany] = useState('Google');
//     const [jobTitle, setJobTitle] = useState('Senior Developer');

//     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setCustomization(prev => ({
//                     ...prev,
//                     image: reader.result as string
//                 }));
//             };
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleRemoveImage = () => {
//         setCustomization(prev => ({
//             ...prev,
//             image: DefaultBanner
//         }));
//     };

//     const handleStatusChange = (status: string) => {
//         setSelectedStatus(status);
//     };

//     const handleStatusColorChange = (status: string, field: 'background' | 'text', value: string) => {
//         setCustomization(prev => ({
//             ...prev,
//             statusColors: {
//                 ...prev.statusColors,
//                 [status]: {
//                     ...prev.statusColors[status],
//                     [field]: value
//                 }
//             }
//         }));
//     };

//     const handleSubmit = async () => {
//         const data = new FormData();
//         data.append('_method', 'PUT');

//         if (
//             customization.image &&
//             typeof customization.image === 'string' &&
//             (customization.image.startsWith('data:') || customization.image === DefaultBanner)
//         ) {
//             // User uploaded a new image or selected the default banner
//             let imageUrl = customization.image;
//             if (customization.image === DefaultBanner) {
//                 // If it's the imported default, fetch it as a blob
//                 imageUrl = DefaultBanner;
//             }
//             const matches = imageUrl.match(/^data:(.+);base64/);
//             let mimeType = 'image/png';
//             let fileExt = 'png';
//             if (matches) {
//                 mimeType = matches[1];
//                 fileExt = mimeType.split('/')[1] || 'png';
//             } else if (imageUrl === DefaultBanner) {
//                 // Try to infer from the file extension
//                 const extMatch = DefaultBanner.match(/\.([a-zA-Z0-9]+)$/);
//                 fileExt = extMatch ? extMatch[1] : 'jpg';
//                 mimeType = `image/${fileExt}`;
//             }
//             const fileName = `badge_banner.${fileExt}`;
//             const imageResponse = await fetch(imageUrl);
//             const blob = await imageResponse.blob();
//             const file = new File([blob], fileName, { type: mimeType });
//             data.append('badge_banner', file, fileName);
//         }

//         data.append('speaker_tag_color', customization.statusColors.speaker.background);
//         data.append('speaker_text_color', customization.statusColors.speaker.text);
//         data.append('delegate_tag_color', customization.statusColors.delegate.background);
//         data.append('delegate_text_color', customization.statusColors.delegate.text);
//         data.append('sponsor_tag_color', customization.statusColors.sponsor.background);
//         data.append('sponsor_text_color', customization.statusColors.sponsor.text);
//         data.append('panelist_tag_color', customization.statusColors.panelist.background);
//         data.append('panelist_text_color', customization.statusColors.panelist.text);

//         const apiResponse = await axios.post(`${domain}/api/update-badge/${event?.id}`, data, {
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//                 "Content-Type": "multipart/form-data"  // Changed to multipart/form-data for file uploads
//             }
//         });

//         if (apiResponse.data.status === 200) {
//             toast(apiResponse.data.message, {
//                 className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
//                 icon: <CircleCheck className="size-5" />
//             });
//             // Update the event in the event store as well
//             if (event) {
//                 useEventStore.setState((state) => ({
//                     events: state.events.map(e =>
//                         e.id === event.id
//                             ? {
//                                 ...e,
//                                 badge_banner: customization.image || DefaultBanner,
//                                 speaker_tag_color: customization.statusColors.speaker.background,
//                                 speaker_text_color: customization.statusColors.speaker.text,
//                                 delegate_tag_color: customization.statusColors.delegate.background,
//                                 delegate_text_color: customization.statusColors.delegate.text,
//                                 sponsor_tag_color: customization.statusColors.sponsor.background,
//                                 sponsor_text_color: customization.statusColors.sponsor.text,
//                                 panelist_tag_color: customization.statusColors.panelist.background,
//                                 panelist_text_color: customization.statusColors.panelist.text,
//                             }
//                             : e
//                     )
//                 }));
//             }
//         }
//     };

//     // Create a dummy attendee with the current customization
//     const dummyAttendee: AttendeeType = {
//         id: 1,
//         uuid: 'dummy-uuid',
//         user_id: 1,
//         event_id: 1,
//         first_name: name.split(' ')[0],
//         last_name: name.split(' ').slice(1).join(' '),
//         email_id: 'john.doe@example.com',
//         phone_number: '1234567890',
//         country_code: "91",
//         website: 'https://example.com',
//         linkedin_page_link: 'https://linkedin.com/in/johndoe',
//         employee_size: '1-10',
//         company_turn_over: 'Less than $1M',
//         status: selectedStatus,
//         created_at: new Date().toISOString(),
//         updated_at: new Date().toISOString(),
//         image: null,
//         virtual_business_card: null,
//         profile_completed: 1,
//         alternate_mobile_number: '',
//         alternate_email: null,
//         company_name: company,
//         industry: 'Technology',
//         job_title: jobTitle,
//         event_invitation: 1,
//         user_invitation_request: 0,
//         check_in: 0,
//         check_in_second: null,
//         check_in_third: null,
//         check_in_forth: null,
//         check_in_fifth: null,
//         check_in_time: null,
//         check_in_second_time: null,
//         check_in_third_time: null,
//         check_in_forth_time: null,
//         check_in_fifth_time: null,
//         not_invited: 0,
//         award_winner: 0,
//         break_out_room_and_time: [],
//         title: `${name.split(' ')[0]} ${name.split(' ').slice(1).join(' ')}`
//     };

//     return (
//         <div className='w-full px-4'>
//             <div className='max-w-6xl mx-auto'>
//                 <div className='flex items-center mb-6 gap-2'>
//                     <GoBackButton />
//                     <h1 className='text-2xl font-bold'>{event?.title}</h1>
//                 </div>

//                 <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
//                     {/* Preview Section */}
//                     <div className='lg:col-span-1'>
//                         <Card className='sticky top-8'>
//                             <CardHeader>
//                                 <CardTitle>Badge Preview</CardTitle>
//                             </CardHeader>
//                             <CardContent className='flex justify-center'>
//                                 <div className='w-full'>
//                                     <PrintBadge
//                                         attendee={dummyAttendee}
//                                         image={customization.image || null}
//                                         print={false}
//                                         statusBackground={customization.statusColors[selectedStatus]?.background || "var(--primary)"}
//                                         statusTextColor={customization.statusColors[selectedStatus]?.text || "var(--primary-text)"}
//                                     />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* Customization Controls */}
//                     <div className='lg:col-span-2 space-y-6'>
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Badge Information</CardTitle>
//                             </CardHeader>
//                             <CardContent className='space-y-4'>
//                                 <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                                     <div className='space-y-2'>
//                                         <Label htmlFor='name'>Name</Label>
//                                         <Input
//                                             id='name'
//                                             value={name}
//                                             onChange={(e) => setName(e.target.value)}
//                                             placeholder="Enter name"
//                                         />
//                                     </div>
//                                     <div className='space-y-2'>
//                                         <Label htmlFor='company'>Company</Label>
//                                         <Input
//                                             id='company'
//                                             value={company}
//                                             onChange={(e) => setCompany(e.target.value)}
//                                             placeholder="Enter company"
//                                         />
//                                     </div>
//                                     <div className='space-y-2'>
//                                         <Label htmlFor='jobTitle'>Job Title</Label>
//                                         <Input
//                                             id='jobTitle'
//                                             value={jobTitle}
//                                             onChange={(e) => setJobTitle(e.target.value)}
//                                             placeholder="Enter job title"
//                                         />
//                                     </div>
//                                     <div className='space-y-2'>
//                                         <Label>Status</Label>
//                                         <div className='flex flex-wrap gap-2'>
//                                             {STATUS_OPTIONS.map((option) => (
//                                                 <Button
//                                                     key={option.value}
//                                                     variant={selectedStatus === option.value ? 'default' : 'outline'}
//                                                     size="sm"
//                                                     onClick={() => handleStatusChange(option.value)}
//                                                 >
//                                                     {option.label}
//                                                 </Button>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Customize Appearance</CardTitle>
//                             </CardHeader>
//                             <CardContent className='space-y-6'>
//                                 <div className='space-y-6 w-full'>
//                                     <div className='space-y-4'>
//                                         <div className='space-y-2 relative'>
//                                             <div className='flex justify-between items-center'>
//                                                 <Label>Background Image</Label>
//                                                 {customization.image && customization.image !== DefaultBanner && (
//                                                     <div className='relative z-10'>
//                                                         <Button
//                                                             type='button'
//                                                             variant='ghost'
//                                                             size='sm'
//                                                             onClick={(e) => {
//                                                                 e.stopPropagation();
//                                                                 handleRemoveImage();
//                                                             }}
//                                                             className='text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 cursor-pointer duration-300'
//                                                         >
//                                                             <X className='w-4 h-4' />
//                                                             Remove
//                                                         </Button>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className='flex items-center flex-col gap-2'>
//                                                 <label className='flex-1 w-full'>
//                                                     <div className='flex items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 overflow-hidden'>
//                                                         {/* Updated image display logic */}
//                                                         <img
//                                                             src={getImageSource(customization.image)}
//                                                             alt="Badge background"
//                                                             className='h-full w-full object-cover rounded-md'
//                                                             onError={(e) => {
//                                                                 // Fallback if image fails to load
//                                                                 e.currentTarget.src = DefaultBanner;
//                                                             }}
//                                                         />
//                                                         {(!customization.image || customization.image === DefaultBanner) && (
//                                                             <div className='absolute inset-0 flex items-center justify-center'>
//                                                                 <div className='text-center p-4 bg-white bg-opacity-90 rounded-lg'>
//                                                                     <ImageIcon className='w-6 h-6 mx-auto mb-1 text-gray-600' />
//                                                                     <p className='text-sm text-gray-700'>Click to upload</p>
//                                                                     <p className='text-xs text-gray-500'>PNG, JPG, JPEG (max 2MB)</p>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                         {customization.image && customization.image !== DefaultBanner && (
//                                                             <div className='absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 transition-opacity pointer-events-none'>
//                                                                 <div className='text-center p-4 bg-white bg-opacity-90 rounded-lg pointer-events-auto'>
//                                                                     <ImageIcon className='w-6 h-6 mx-auto mb-1 text-gray-600' />
//                                                                     <p className='text-sm text-gray-700'>Change image</p>
//                                                                     <p className='text-xs text-gray-500'>PNG, JPG, JPEG (max 2MB)</p>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                         <input
//                                                             type="file"
//                                                             className='hidden'
//                                                             accept='image/*'
//                                                             onChange={handleImageUpload}
//                                                         />
//                                                     </div>
//                                                 </label>
//                                             </div>
//                                         </div>

//                                         <div className='space-y-4'>
//                                             <Label>Status Bar Colors</Label>
//                                             <div className='space-y-4 p-4 border rounded-lg'>
//                                                 <div className='space-y-2'>
//                                                     <Label className='text-sm'>Selected Status: <span className='capitalize font-medium'>{selectedStatus}</span></Label>
//                                                     <div className='grid grid-cols-2 gap-4'>
//                                                         <div className='space-y-1'>
//                                                             <Label className='text-xs'>Background</Label>
//                                                             <div className='flex items-center gap-2'>
//                                                                 <input
//                                                                     type="color"
//                                                                     value={customization.statusColors[selectedStatus]?.background || '#000000'}
//                                                                     onChange={(e) => handleStatusColorChange(selectedStatus, 'background', e.target.value)}
//                                                                     className='w-10 h-8 p-1 border rounded cursor-pointer'
//                                                                 />
//                                                                 <Input
//                                                                     value={customization.statusColors[selectedStatus]?.background || '#000000'}
//                                                                     onChange={(e) => handleStatusColorChange(selectedStatus, 'background', e.target.value)}
//                                                                     className='flex-1 text-sm h-8'
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                         <div className='space-y-1'>
//                                                             <Label className='text-xs'>Text Color</Label>
//                                                             <div className='flex items-center gap-2'>
//                                                                 <input
//                                                                     type="color"
//                                                                     value={customization.statusColors[selectedStatus]?.text || '#ffffff'}
//                                                                     onChange={(e) => handleStatusColorChange(selectedStatus, 'text', e.target.value)}
//                                                                     className='w-10 h-8 p-1 border rounded cursor-pointer'
//                                                                 />
//                                                                 <Input
//                                                                     value={customization.statusColors[selectedStatus]?.text || '#ffffff'}
//                                                                     onChange={(e) => handleStatusColorChange(selectedStatus, 'text', e.target.value)}
//                                                                     className='flex-1 text-sm h-8'
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <div className='flex justify-end gap-3 pt-4'>
//                             <Button onClick={handleSubmit} className='cursor-pointer bg-brand-primary hover:bg-brand-primary-dark text-white duration-300'>Save Template</Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreateBadge;