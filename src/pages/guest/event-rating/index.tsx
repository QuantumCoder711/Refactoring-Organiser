import { EventType } from '@/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Star, CircleX, CircleCheck } from 'lucide-react';
import Wave from '@/components/Wave';
import { getImageUrl } from '@/lib/utils';
import { appDomain, domain } from '@/constants';
import { toast } from 'sonner';

interface RatingQuestion {
    key: keyof typeof initialUserRating;
    text: string;
}

const initialUserRating = {
    avgOverallEventExperience: 0,
    avgSpeakerOrPenalistQuality: 0,
    avgOrganisationAndTimeManagement: 0,
    avgVenueAndOngroundManagemant: 0,
    avgOpportunityForNetworking: 0,
    avgEventCommunication: 0,
    avgRelevanceTopicDiscuss: 0
};

const ratingQuestions: RatingQuestion[] = [
    { key: 'avgOverallEventExperience', text: 'How was your Overall event experience?' },
    { key: 'avgSpeakerOrPenalistQuality', text: 'Quality of speakers/panelists' },
    { key: 'avgRelevanceTopicDiscuss', text: 'Relevance of topics discussed' },
    { key: 'avgOrganisationAndTimeManagement', text: 'Event organisation & time management' },
    { key: 'avgVenueAndOngroundManagemant', text: 'Venue and on-ground arrangements' },
    { key: 'avgOpportunityForNetworking', text: 'Opportunities for networking' },
    { key: 'avgEventCommunication', text: 'Event communication (emails, reminders, etc.)' }
];

const EventRating: React.FC = () => {
    const [searchParams] = useSearchParams();
    const eventUuid = searchParams.get('eventuuid');
    const mobileNumber = searchParams.get('mobileNumber');
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(true);
    const [hoveredRating, setHoveredRating] = useState(0);

    const [userRating, setUserRating] = useState({
        avgOverallEventExperience: 0,
        avgSpeakerOrPenalistQuality: 0,
        avgOrganisationAndTimeManagement: 0,
        avgVenueAndOngroundManagemant: 0,
        avgOpportunityForNetworking: 0,
        avgEventCommunication: 0,
        avgRelevanceTopicDiscuss: 0
    });
    const [averageExistingRating, setAverageExistingRating] = useState<number>(0);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${domain}/api/all_events`);
                const foundEvent = res.data.data.find((e: EventType) => e.uuid === eventUuid);
                setEvent(foundEvent);
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (eventUuid) {
            fetchEvent();
        }
    }, [eventUuid, mobileNumber]);

    useEffect(() => {
        if (!event) return;
        axios.post(`${appDomain}/api/organiser/v1/event-rating/show-event-rating`, {
            eventUuid: event.uuid,
            userId: event.user_id
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            if (res.data.status) {
                const ratingData = res.data.data;
                const total = ratingData.avgOverallEventExperience + ratingData.avgSpeakerOrPenalistQuality + ratingData.avgOrganisationAndTimeManagement + ratingData.avgVenueAndOngroundManagemant + ratingData.avgOpportunityForNetworking + ratingData.avgEventCommunication + ratingData.avgRelevanceTopicDiscuss;
                const avg = (total / 7).toFixed(1);
                setAverageExistingRating(Number(avg));
                console.log('Average Existing Rating:', avg);
            }
        });
    }, [event]);

    const handleRatingChange = (key: keyof typeof userRating, value: number) => {
        setUserRating(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmitRating = async () => {
        // Check if all ratings are provided
        const hasAllRatings = Object.values(userRating).every(rating => rating > 0);

        if (!hasAllRatings) {
            toast("Please provide ratings for all questions", {
                className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleX className='size-5' />
            });
            return;
        }

        // If all ratings are provided, proceed with API call
        console.log('User Rating Submission:', userRating);
        setShowRatingModal(false);

        const response = await axios.post(`${appDomain}/api/organiser/v1/event-rating/create-event-rating`, {
            eventUuid: event?.uuid,
            userId: event?.user_id,
            mobileNumber: Number(mobileNumber),
            overallEventExperience: userRating.avgOverallEventExperience,
            speakerOrPenalistQuality: userRating.avgSpeakerOrPenalistQuality,
            organisationAndTimeManagement: userRating.avgOrganisationAndTimeManagement,
            venueAndOngroundManagemant: userRating.avgVenueAndOngroundManagemant,
            opportunityForNetworking: userRating.avgOpportunityForNetworking,
            eventCommunication: userRating.avgEventCommunication,
            relevanceTopicDiscuss: userRating.avgRelevanceTopicDiscuss
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.data.status) {
            toast("Thanks for your feedback!", {
                className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                icon: <CircleCheck className='size-5' />
            });
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (timeString: string, timeType: string) => {
        if (!timeString || !timeType) return '';
        return `${timeString} ${timeType}`;
    };

    if (loading) return <Wave />;

    if (!event) {
        return (
            <div className="min-h-screen bg-brand-background flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-brand-dark-gray text-lg mb-2">Event not found</div>
                    <div className="text-brand-dark-gray/70 text-sm">The event you're looking for doesn't exist or has been removed.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-background py-4 sm:py-8 px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <p className="text-base sm:text-lg text-brand-dark-gray">Share your experience and help us improve</p>
                </div>

                {/* Event Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
                    {/* Event Image */}
                    <div className="relative h-48 sm:h-60 md:h-80 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
                        {event.image ? (
                            <img
                                src={getImageUrl(event.image)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Calendar size={48} className="text-brand-primary/30 sm:size-16" />
                            </div>
                        )}

                        {/* Event Status Badge */}
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-brand-primary">
                                Completed
                            </span>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <div className="space-y-6">
                            {/* Event Title and Description */}
                            <div className="space-y-4">
                                <h2 className="text-xl sm:text-2xl font-bold text-brand-dark leading-tight">{event.title}</h2>
                                <p className="text-brand-dark-gray leading-relaxed text-sm sm:text-base line-clamp-3">
                                    {event.description}
                                </p>
                                
                                {/* Rating Display */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`${i < Math.round(averageExistingRating || 0)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-brand-light-gray fill-brand-light-gray'}
                                                ${i > 0 ? 'ml-0.5 sm:ml-1' : ''}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-brand-dark font-medium text-sm sm:text-base">
                                        {averageExistingRating}
                                    </span>
                                    <span className="text-xs text-brand-dark-gray">
                                        (based on attendee ratings)
                                    </span>
                                </div>
                            </div>

                            {/* Quick Rating Section */}
                            {mobileNumber && (
                                <div className="space-y-4 my-6 sm:my-8">
                                    <div className="text-center">
                                        <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-3 sm:mb-4">
                                            How was your experience?
                                        </h3>

                                        {/* Star Rating */}
                                        <div
                                            className="flex justify-center gap-1 sm:gap-2 mb-4 sm:mb-6"
                                            onMouseLeave={() => setHoveredRating(0)}
                                        >
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => {
                                                        setUserRating(prev => ({
                                                            ...prev,
                                                            avgOverallEventExperience: star
                                                        }));
                                                        setShowRatingModal(true);
                                                    }}
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    className="p-1 sm:p-2 hover:scale-110 transition-transform"
                                                >
                                                    <Star
                                                        size={32}
                                                        className={`${star <= (hoveredRating || userRating.avgOverallEventExperience)
                                                            ? 'text-yellow-400'
                                                            : 'text-brand-light-gray'
                                                            } transition-colors cursor-pointer`}
                                                        fill="currentColor"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Event Details Grid */}
                            <div className="flex flex-col w-full gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 p-3 sm:p-4 bg-brand-background rounded-lg sm:rounded-xl">
                                    <Calendar className="text-brand-primary min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-brand-dark text-sm sm:text-base">Date</div>
                                        <div className="text-xs sm:text-sm text-brand-dark-gray truncate">
                                            {formatDate(event.event_date)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 sm:p-4 bg-brand-background rounded-lg sm:rounded-xl">
                                    <Clock className="text-brand-primary min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-brand-dark text-sm sm:text-base">Time</div>
                                        <div className="text-xs sm:text-sm text-brand-dark-gray">
                                            {formatTime(event.start_time, event.start_time_type)} - {formatTime(event.end_time, event.end_time_type)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 sm:p-4 bg-brand-background rounded-lg sm:rounded-xl">
                                    <MapPin className="text-brand-primary min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-brand-dark text-sm sm:text-base">Venue</div>
                                        <div className="text-xs sm:text-sm text-brand-dark-gray truncate">
                                            {event.event_venue_name}
                                        </div>
                                        <div className="text-xs text-brand-dark-gray/70 mt-0.5 sm:mt-1 truncate">
                                            {event.event_venue_address_1}, {event.city}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 sm:p-4 bg-brand-background rounded-lg sm:rounded-xl">
                                    <Users className="text-brand-primary min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-brand-dark text-sm sm:text-base">Attendees</div>
                                        <div className="text-xs sm:text-sm text-brand-dark-gray">
                                            {event.total_attendee} registered • {event.total_checkedin} checked in
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {(showRatingModal && mobileNumber) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl sm:text-2xl font-bold text-brand-dark mb-4 sm:mb-6 text-center line-clamp-2">
                            {event.title}
                        </h2>

                        <div className="space-y-4 sm:space-y-6">
                            {ratingQuestions.map((question, index) => (
                                <div key={question.key} className="space-y-2 sm:space-y-3">
                                    <p className="text-brand-dark font-medium text-sm sm:text-base">
                                        {index + 1}. {question.text}
                                        <span className="text-red-500 ml-1">*</span>
                                    </p>
                                    <div className="flex gap-1 sm:gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => handleRatingChange(question.key, star)}
                                                className="p-0.5 sm:p-1 hover:scale-110 transition-transform"
                                            >
                                                <Star
                                                    size={20}
                                                    className={`${star <= (userRating[question.key as keyof typeof userRating] || 0)
                                                        ? 'text-yellow-400'
                                                        : 'text-brand-light-gray'
                                                        } transition-colors cursor-pointer`}
                                                    fill="currentColor"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4 flex-col sm:flex-row">
                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="flex-1 cursor-pointer py-2 sm:py-3 px-4 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/5 transition-colors text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitRating}
                                className="flex-1 cursor-pointer py-2 sm:py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors text-sm sm:text-base"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRating;