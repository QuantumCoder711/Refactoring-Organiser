import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { domain } from '@/constants';
import Wave from '@/components/Wave';
import { Calendar, Globe, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ExploreAllEvents: React.FC = () => {
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("upcoming");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<string>("all");
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
          return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
        });

        const pastEvents = filteredEvents.filter((event: any) => {
          const eventDate = new Date(event.event_start_date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < today;
        }).sort((a: any, b: any) => {
          return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
        });

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

  const handleSelectChange = (value: string) => {
    setSelectedType(value);
    if (value === "upcoming") {
      setUpcomingCurrentPage(1);
    } else {
      setPastCurrentPage(1);
    }
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setUpcomingCurrentPage(1);
    setPastCurrentPage(1);
  };

  const filterEvents = (events: any[]) => {
    let filtered = [...events];

    if (selectedCity !== "all") {
      filtered = filtered.filter(event =>
        event?.city?.toLowerCase() === selectedCity.replace(/-/g, ' ')
      );
    }

    if (selectedMode !== "all") {
      const modeValue = parseInt(selectedMode);
      filtered = filtered.filter(event => event.event_mode === modeValue);
    }

    return filtered;
  };

  const getCurrentEvents = () => {
    const filteredEvents = filterEvents(selectedType === "upcoming" ? allEvents : pastEvents);
    const currentPage = selectedType === "upcoming" ? upcomingCurrentPage : pastCurrentPage;
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  };

  const totalPages = Math.ceil(
    filterEvents(selectedType === "upcoming" ? allEvents : pastEvents).length / eventsPerPage
  );

  const handlePageChange = (pageNum: number) => {
    if (selectedType === "upcoming") {
      setUpcomingCurrentPage(pageNum);
    } else {
      setPastCurrentPage(pageNum);
    }
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
      <div className='w-full min-h-screen'>
        {/* All events div */}
        <div className='max-w-screen-lg mx-auto px-4 sm:px-6 lg:p-5'>
          <div className='space-y-3 sm:space-y-5 py-4 sm:py-6'>
            <h1 className='text-xl sm:text-2xl font-semibold leading-tight'>All Events</h1>
            <p className='text-sm sm:text-base leading-relaxed text-accent-foreground'>
              Explore popular events near you, browse by category, or check out some of the great community calendars.
            </p>
          </div>

          <div className='mt-6 sm:mt-10'>
            {/* Filters - Responsive Stack */}
            <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Select value={selectedType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-10 cursor-pointer">
                    <SelectValue placeholder="Event Sort By" />
                  </SelectTrigger>
                  <SelectContent className='bg-background/50'>
                    <SelectGroup>
                      <SelectItem value="upcoming" className='cursor-pointer'>Upcoming</SelectItem>
                      <SelectItem value="past" className='cursor-pointer'>Past</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-0">
                <Select
                  value={selectedMode}
                  onValueChange={(value) => {
                    if (value === "1") {
                      setSelectedCity("all");
                    }
                    setSelectedMode(value);
                    setUpcomingCurrentPage(1);
                    setPastCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-10 cursor-pointer">
                    <SelectValue placeholder="Select Event Mode" />
                  </SelectTrigger>
                  <SelectContent className='bg-background/50'>
                    <SelectGroup>
                      <SelectItem value="all" className='cursor-pointer'>All</SelectItem>
                      <SelectItem value="0" className='cursor-pointer'>Offline</SelectItem>
                      <SelectItem value="1" className='cursor-pointer'>Online</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-0">
                <Select
                  value={selectedCity.replace(/-/g, ' ')}
                  onValueChange={handleCityChange}
                  disabled={selectedMode === '1'}
                >
                  <SelectTrigger className="w-full h-10 cursor-pointer">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className='bg-background/50'>
                    <SelectGroup>
                      <SelectItem value="all" className='cursor-pointer capitalize'>All Cities</SelectItem>
                      {cities.map((city, index) => (
                        <SelectItem key={index} value={city} className='cursor-pointer capitalize'>{city}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Events Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
              {getCurrentEvents().map((event, index) => (
                <Link to={`/events/${event.slug}`} key={index} className="group">
                  <div className='flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-muted hover transition-all duration-200 group-hover:shadow-md'>
                    <img 
                      src={domain + "/" + event.image} 
                      alt="event" 
                      className='w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover flex-shrink-0' 
                    />
                    <div className='flex-1 min-w-0 space-y-1 sm:space-y-2'>
                      <p className='text-xs sm:text-sm text-gray-500 leading-none truncate'>
                        by {event?.company_name}
                      </p>
                      <h1 className='text-base sm:text-lg font-semibold leading-tight flex items-center gap-2 truncate'>
                        <span className="truncate">{event.title}</span>
                        {event.paid_event === 1 && (
                          <Badge className='rounded-full text-xs flex-shrink-0'>Paid</Badge>
                        )}
                      </h1>
                      <div className='flex gap-2 items-center'>
                        <Calendar className='w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-accent-foreground' />
                        <p className='text-xs sm:text-sm font-light text-accent-foreground leading-none truncate'>
                          {formatDateTime(event.event_start_date)} | {event.start_time}:{event.start_minute_time} {event.start_time_type} - {event.end_time}:{event.end_minute_time} {event.end_time_type}
                        </p>
                      </div>
                      <div hidden={event.event_mode == 1} className='flex gap-2 items-center'>
                        <MapPin className='w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground flex-shrink-0' />
                        <p className='text-xs sm:text-sm font-light text-accent-foreground leading-none truncate'>
                          {event.event_venue_name}
                        </p>
                      </div>
                      <div hidden={event.event_mode == 0} className='flex gap-2 items-center'>
                        <Globe className='w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground flex-shrink-0' />
                        <p className='text-xs sm:text-sm font-light text-accent-foreground leading-none truncate'>Online</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination - Responsive */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 my-8 sm:my-10">
              <Button
                onClick={() => handlePageChange(getCurrentPage() - 1)}
                disabled={getCurrentPage() === 1}
                variant="outline"
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2 mb-3 sm:mb-0">
                {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(pageNum => (
                  <Button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    size="sm"
                    variant={getCurrentPage() === pageNum ? "default" : "outline"}
                    className="w-8 h-8 sm:w-10 sm:h-10 p-0 text-xs sm:text-sm"
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => handlePageChange(getCurrentPage() + 1)}
                disabled={getCurrentPage() === totalPages}
                variant="outline"
                className="w-full sm:w-auto order-3"
              >
                Next
              </Button>
            </div>

            {/* No Events Message */}
            {getCurrentEvents().length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedCity("all");
                    setSelectedMode("all");
                    setSelectedType("upcoming");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ExploreAllEvents;