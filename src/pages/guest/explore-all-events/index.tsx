import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { domain } from '@/constants';
import Wave from '@/components/Wave';
import { Calendar, ChevronDown, MapPin } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

const ExploreAllEvents: React.FC = () => {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string>("upcoming");
  const [selectedCity, setSelectedCity] = useState<string>(city?.toLowerCase().replace(/ /g, '-') || "all");
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

        // Filter out event with id 443
        const fetchedEvents = res.data.data;

        const filteredEvents = fetchedEvents.filter((event: any) => event.id !== 443);

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
          return event.city.toLowerCase();
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
    navigate(`/events/${newCity.replace(/ /g, '-')}`);
  };

  const filterEventsByCity = (events: any[]) => {
    if (selectedCity === "all") return events;
    return events.filter(event => {
      return event.city.toLowerCase() === selectedCity.replace(/-/g, ' ');
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
              <Link to={`/events/explore/${event.slug}`} key={index}>
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
  );
}

export default ExploreAllEvents;













































// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Link, useParams, useNavigate } from 'react-router-dom';
// import { domain } from '@/constants';
// import Wave from '@/components/Wave';
// import { Calendar, ChevronDown, MapPin, Search, ChevronLeft, ChevronRight, BookOpen, Share2, Clock } from 'lucide-react';
// import { beautifyDate, formatDateTime } from '@/lib/utils';

// const ExploreAllEvents: React.FC = () => {
//   const { city } = useParams<{ city: string }>();
//   const navigate = useNavigate();
//   const [allEvents, setAllEvents] = useState<any[]>([]);
//   const [pastEvents, setPastEvents] = useState<any[]>([]);
//   const [selectedType, setSelectedType] = useState<string>("upcoming");
//   const [selectedCity, setSelectedCity] = useState<string>(city?.toLowerCase().replace(/ /g, '-') || "all");
//   const [cities, setCities] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
//   const [pastCurrentPage, setPastCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState("");
//   const eventsPerPage = 6;

//   useEffect(() => {
//     setIsLoading(true);
//     axios.get(`${domain}/api/all_events`)
//       .then((res: any) => {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         // Filter out event with id 443
//         const fetchedEvents = res.data.data;

//         const filteredEvents = fetchedEvents.filter((event: any) => event.id !== 443);

//         const upcomingEvents = filteredEvents.filter((event: any) => {
//           const eventDate = new Date(event.event_start_date);
//           eventDate.setHours(0, 0, 0, 0);
//           return eventDate >= today;
//         }).sort((a: any, b: any) => {
//           // Sort by increasing date (ascending order)
//           return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
//         });

//         const pastEvents = filteredEvents.filter((event: any) => {
//           const eventDate = new Date(event.event_start_date);
//           eventDate.setHours(0, 0, 0, 0);
//           return eventDate < today;
//         }).sort((a: any, b: any) => {
//           return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
//         });

//         // Extract unique cities from events and convert to lowercase
//         const uniqueCities: any[] = Array.from(new Set(filteredEvents.map((event: any) => {
//           return event.city.toLowerCase();
//         })));

//         setCities(uniqueCities);
//         setAllEvents(upcomingEvents);
//         setPastEvents(pastEvents);
//       })
//       .catch((err: any) => {
//         console.log(err);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }, []);

//   const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedType(event.target.value);
//     // Reset appropriate page counter based on selected type
//     if (event.target.value === "upcoming") {
//       setUpcomingCurrentPage(1);
//     } else {
//       setPastCurrentPage(1);
//     }
//   };

//   const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const newCity = event.target.value;
//     setSelectedCity(newCity);
//     setUpcomingCurrentPage(1);
//     setPastCurrentPage(1);
//     navigate(`/events/${newCity.replace(/ /g, '-')}`);
//   };

//   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(event.target.value);
//     setUpcomingCurrentPage(1);
//     setPastCurrentPage(1);
//   };

//   const filterEventsByCity = (events: any[]) => {
//     let filtered = [...events];
    
//     // Filter by city
//     if (selectedCity !== "all") {
//       filtered = filtered.filter(event => 
//         event.city.toLowerCase() === selectedCity.replace(/-/g, ' ')
//       );
//     }
    
//     // Filter by search query
//     if (searchQuery.trim() !== '') {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(event => 
//         event.title.toLowerCase().includes(query) ||
//         event.company_name?.toLowerCase().includes(query) ||
//         event.event_venue_name?.toLowerCase().includes(query)
//       );
//     }
    
//     return filtered;
//   };

//   // Get current events for pagination
//   const getCurrentEvents = () => {
//     const filteredEvents = filterEventsByCity(selectedType === "upcoming" ? allEvents : pastEvents);
//     const currentPage = selectedType === "upcoming" ? upcomingCurrentPage : pastCurrentPage;
//     const indexOfLastEvent = currentPage * eventsPerPage;
//     const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
//     return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
//   };

//   const totalPages = Math.ceil(
//     filterEventsByCity(selectedType === "upcoming" ? allEvents : pastEvents).length / eventsPerPage
//   );

//   const handlePageChange = (pageNum: number) => {
//     if (selectedType === "upcoming") {
//       setUpcomingCurrentPage(pageNum);
//     } else {
//       setPastCurrentPage(pageNum);
//     }
//     // Smooth scroll to top
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const getCurrentPage = () => {
//     return selectedType === "upcoming" ? upcomingCurrentPage : pastCurrentPage;
//   };

//   // Function to render pagination
//   const renderPagination = () => {
//     const maxPageButtons = 5;
//     let pageButtons = [];
    
//     if (totalPages <= maxPageButtons) {
//       // Show all pages if total is less than max buttons
//       pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1);
//     } else {
//       // Calculate which buttons to show
//       const currentPage = getCurrentPage();
      
//       // Always include first and last page
//       let middleButtons = [];
      
//       if (currentPage <= 3) {
//         // Near the start
//         middleButtons = [1, 2, 3, 4, '...', totalPages];
//       } else if (currentPage >= totalPages - 2) {
//         // Near the end
//         middleButtons = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
//       } else {
//         // Somewhere in the middle
//         middleButtons = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
//       }
      
//       pageButtons = middleButtons;
//     }
    
//     return (
//       <div className="flex items-center justify-center mt-10">
//         <button
//           onClick={() => handlePageChange(getCurrentPage() - 1)}
//           disabled={getCurrentPage() === 1}
//           className={`flex items-center gap-1 px-4 py-2 rounded-lg ${getCurrentPage() === 1 
//             ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
//             : 'bg-white text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/5'}`}
//         >
//           <ChevronLeft className="w-4 h-4" />
//           <span>Previous</span>
//         </button>
        
//         <div className="flex items-center mx-2">
//           {pageButtons.map((page, index) => (
//             <React.Fragment key={index}>
//               {page === '...' ? (
//                 <span className="px-2">...</span>
//               ) : (
//                 <button
//                   onClick={() => typeof page === 'number' && handlePageChange(page)}
//                   className={`w-9 h-9 mx-1 rounded-full text-sm font-medium ${
//                     getCurrentPage() === page 
//                       ? 'bg-brand-primary text-white' 
//                       : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
//                   }`}
//                 >
//                   {page}
//                 </button>
//               )}
//             </React.Fragment>
//           ))}
//         </div>
        
//         <button
//           onClick={() => handlePageChange(getCurrentPage() + 1)}
//           disabled={getCurrentPage() === totalPages}
//           className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
//             getCurrentPage() === totalPages 
//               ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
//               : 'bg-white text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/5'
//           }`}
//         >
//           <span>Next</span>
//           <ChevronRight className="w-4 h-4" />
//         </button>
//       </div>
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className='w-full h-screen flex justify-center items-center bg-white'>
//         <Wave />
//       </div>
//     );
//   }

//   return (
//     <div className='min-h-screen bg-gradient-to-b from-white to-gray-50'>
//       {/* Hero section */}
//       <div className="bg-gradient-to-r from-brand-primary to-brand-primary/80 text-white">
//         <div className="max-w-screen-xl mx-auto px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
//           <div className="max-w-3xl">
//             <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
//               Discover Amazing Events
//             </h1>
//             <p className="mt-6 text-xl leading-8">
//               Explore popular events near you, browse by category, or check out upcoming community gatherings.
//             </p>
            
//             {/* Search bar */}
//             <div className="mt-8 max-w-md relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search events by name, organizer, or venue..."
//                 value={searchQuery}
//                 onChange={handleSearchChange}
//                 className="block w-full rounded-full border-0 py-3 pl-10 pr-4 text-gray-900 bg-white/90 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-white sm:text-sm sm:leading-6"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className='max-w-screen-xl mx-auto px-4 py-12 sm:px-6 lg:px-8'>
//         {/* Filter controls */}
//         <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//             <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
//               <BookOpen className="h-6 w-6 text-brand-primary" />
//               {selectedType === "upcoming" ? "Upcoming Events" : "Past Events"}
//             </h2>
            
//             <div className="flex flex-wrap gap-3">
//               <div className="relative min-w-[180px]">
//                 <select
//                   className="appearance-none w-full px-4 py-2.5 pr-8 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
//                   value={selectedType}
//                   onChange={handleSelectChange}
//                 >
//                   <option value="upcoming">Upcoming Events</option>
//                   <option value="past">Past Events</option>
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
//               </div>

//               <div className="relative min-w-[180px]">
//                 <select
//                   className="appearance-none w-full px-4 py-2.5 pr-8 capitalize border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
//                   value={selectedCity.replace(/-/g, ' ')}
//                   onChange={handleCityChange}
//                 >
//                   <option value="all">All Cities</option>
//                   {cities.map((city, index) => (
//                     <option key={index} value={city} className='capitalize'>{city}</option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
//               </div>
//             </div>
//           </div>
          
//           {/* Results count */}
//           <div className="mt-6 pt-6 border-t border-gray-100">
//             <div className="flex justify-between items-center">
//               <p className="text-sm text-gray-500">
//                 Showing {filterEventsByCity(selectedType === "upcoming" ? allEvents : pastEvents).length} events
//               </p>
//               <div className="text-sm text-gray-500">
//                 Page {getCurrentPage()} of {totalPages || 1}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Events grid */}
//         {getCurrentEvents().length === 0 ? (
//           <div className="text-center py-16 bg-white rounded-xl shadow-sm">
//             <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
//               <Calendar className="h-8 w-8 text-gray-400" />
//             </div>
//             <h3 className="mt-2 text-lg font-semibold text-gray-900">No events found</h3>
//             <p className="mt-1 text-gray-500">Try changing your search or filter options.</p>
//           </div>
//         ) : (
//           <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
//             {getCurrentEvents().map((event, index) => (
//               <Link to={`/events/${event.slug}`} key={index} className="group block h-full">
//                 <div className='h-full bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 border border-gray-100 hover:border-brand-primary/30 flex flex-col'>
//                   <div className="relative">
//                     <img 
//                       src={domain + "/" + event.image} 
//                       alt={event.title}
//                       className="w-full h-48 object-cover object-center transition duration-500 group-hover:scale-105"
//                       onError={(e) => {
//                         (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/2563eb/ffffff?text=Event';
//                       }}
//                     />
//                     {event.paid_event === 1 && (
//                       <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
//                         Paid Event
//                       </div>
//                     )}
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-4 px-4">
//                       <p className="text-white text-sm font-medium flex items-center">
//                         <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
//                         {formatDateTime(event.event_start_date)}
//                       </p>
//                     </div>
//                   </div>
                  
//                   <div className="p-5 flex-1 flex flex-col">
//                     <p className='text-sm text-brand-primary font-medium mb-2 truncate'>{event?.company_name}</p>
//                     <h3 className='text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors'>
//                       {event.title}
//                     </h3>
//                     <div className='flex-1'></div>
//                     <div className="mt-4 pt-4 border-t border-gray-100">
//                       <div className='flex gap-2 items-center'>
//                         <MapPin className='w-4 h-4 text-gray-400 flex-shrink-0' />
//                         <p className='text-sm text-gray-600 truncate'>{event.event_venue_name || 'Venue not specified'}</p>
//                       </div>
//                       <div className='flex gap-2 items-center mt-2'>
//                         <Clock className='w-4 h-4 text-gray-400 flex-shrink-0' />
//                         <p className='text-sm text-gray-600 truncate'>
//                           {event.start_time}:{event.start_minute_time} {event.start_time_type} - {event.end_time}:{event.end_minute_time} {event.end_time_type}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && renderPagination()}
//       </div>
//     </div>
//   );
// };

// export default ExploreAllEvents;