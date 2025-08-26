import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { domain } from '@/constants';
import Wave from '@/components/Wave';
import { Calendar, ChevronDown, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Helmet } from 'react-helmet';

const ExploreAllEvents: React.FC = () => {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("upcoming");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
  const [pastCurrentPage, setPastCurrentPage] = useState(1);
  const eventsPerPage = 10;

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${domain}/api/all_events`)
      .then((res: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filteredEvents = res.data.data;
        
        const upcomingEvents = filteredEvents.filter((event: any) => {
          const eventDate = new Date(event.event_start_date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        }).sort((a: any, b: any) => {
          // Sort by increasing date (ascending order)
          return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
        });

        const pastEvents = filteredEvents.filter((event: any) => {
          const eventDate = new Date(event.event_start_date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        }).sort((a: any, b: any) => {
          return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
        });

        // Extract unique cities from events and convert to lowercase
        const uniqueCities: any[] = Array.from(new Set(filteredEvents.map((event: any) => {
          return event?.city?.toLowerCase();
        })));

        setCities(uniqueCities);
        setAllEvents(upcomingEvents);
        setPastEvents(pastEvents);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(event.target.value);
    // Reset appropriate page counter based on selected type
    if (event.target.value === "upcoming") {
      setUpcomingCurrentPage(1);
    } else {
      setPastCurrentPage(1);
    }
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = event.target.value;
    setSelectedCity(newCity);
    setUpcomingCurrentPage(1);
    setPastCurrentPage(1);
  };

  const filterEventsByCity = (events: any[]) => {
    if (selectedCity === "all") return events;
    return events.filter(event => {
      return event?.city?.toLowerCase() === selectedCity.replace(/-/g, ' ');
    });
  };

  // Get current events for pagination
  const getCurrentEvents = () => {
    const filteredEvents = filterEventsByCity(selectedType === "upcoming" ? allEvents : pastEvents);
    const currentPage = selectedType === "upcoming" ? upcomingCurrentPage : pastCurrentPage;
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  };

  const totalPages = Math.ceil(
    filterEventsByCity(selectedType === "upcoming" ? allEvents : pastEvents).length / eventsPerPage
  );

  const handlePageChange = (pageNum: number) => {
    if (selectedType === "upcoming") {
      setUpcomingCurrentPage(pageNum);
    } else {
      setPastCurrentPage(pageNum);
    }
    // Add smooth scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCurrentPage = () => {
    return selectedType === "upcoming" ? upcomingCurrentPage : pastCurrentPage;
  };

  if (isLoading) {
    return <div className='w-full h-screen flex justify-center items-center'>
      <Wave />
    </div>
  }

  return (
    <React.Fragment>
    <Helmet>
        <title>Discover & Attend Top Business Events in India | Klout Club</title>
        <meta name="title" content="Discover & Attend Top Business Events in India | Klout Club" />
        <meta name="description" content="Explore exclusive corporate events, business summits, networking meetups, and industry conferences in India with Klout Club. Find top business summits, connect with professionals, and enhance your event experience." />
      </Helmet>
    <div className='w-full min-h-screen bg-brand-foreground text-black overflow-y-scroll'>

      {/* All events div */}
      <div className='max-w-screen-lg mx-auto p-5'>
        <div className='space-y-5'>
          <h1 className='text-2xl font-semibold leading-none'>All Events</h1>
          <p className='leading-none'>Explore popular events near you, browse by category, or check out some of the great community calendars.</p>
        </div>

        <div className='mt-10'>
          <div className="mb-5 flex gap-4">
            <div className="relative">
              <select
                className="px-4 py-2 pr-10 border max-w-40 w-full border-gray-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none"
                value={selectedType}
                onChange={handleSelectChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="px-4 py-2 pr-10 border capitalize border-gray-300 max-w-40 w-full rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary appearance-none"
                value={selectedCity.replace(/-/g, ' ')}
                onChange={handleCityChange}
              >
                <option value="all">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city} className='capitalize'>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
            {getCurrentEvents().map((event, index) => (
              <Link to={`/events/${event.slug}`} key={index}>
                <div className='flex gap-3 max-h-24'>
                  <img src={domain + "/" + event.image} alt="background" className='w-24 h-24 rounded-md object-center object-cover' />
                  <div className='space-y-2 overflow-hidden'>
                    <p className='text-sm text-brand-gray !leading-none truncate'>by {event?.company_name}</p>
                    <h1 className='text-xl font-semibold leading-none truncate'>
                      {event.title}
                      {event.paid_event === 1 && (
                        <span className='inline-block ml-2 text-white bg-brand-primary text-brand-text font-normal px-2 py-0.5 rounded-full text-xs'>
                          Paid
                        </span>
                      )}
                    </h1>
                    <div className='flex gap-2 items-center'>
                      <Calendar className='w-4 h-4 flex-shrink-0' />
                      <p className='text-sm font-light text-brand-gray !leading-none truncate'>
                        {formatDateTime(event.event_start_date)} | {event.start_time}:{event.start_minute_time} {event.start_time_type} - {event.end_time}:{event.end_minute_time} {event.end_time_type}
                      </p>
                    </div>
                    <div className='flex gap-2 items-center'>
                      <MapPin className='w-4 h-4 text-brand-gray flex-shrink-0' />
                      <p className='text-sm font-light text-brand-gray !leading-none truncate'>{event.event_venue_name}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 my-10">
            <button
              onClick={() => handlePageChange(getCurrentPage() - 1)}
              disabled={getCurrentPage() === 1}
              className={`px-4 py-2 rounded-md ${getCurrentPage() === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-brand-primary/90'}`}
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded text-sm ${getCurrentPage() === pageNum ? 'bg-brand-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(getCurrentPage() + 1)}
              disabled={getCurrentPage() === totalPages}
              className={`px-4 py-2 rounded-md ${getCurrentPage() === totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-brand-primary text-white hover:bg-brand-primary/90'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}

export default ExploreAllEvents;