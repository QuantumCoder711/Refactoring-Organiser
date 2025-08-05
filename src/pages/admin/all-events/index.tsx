import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import useEventStore from '@/store/eventStore';
import { filterEvents, getImageUrl, isEventLive } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const AllEvents: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { events } = useEventStore(state => state);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const eventsPerPage = 10; // Adjust as needed

  const { upcomingEvents, pastEvents } = filterEvents(events);

  pastEvents.sort((a: any, b: any) => {
    return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
  });

  upcomingEvents.sort((a: any, b: any) => {
    return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
  });
  const filteredEvents = (activeTab === 'upcoming' ? upcomingEvents : pastEvents).filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const currentEvents = filteredEvents;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedEvents = currentEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  return (
    <div>
      {/* Tab and Pagination */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-5'>
          <Button
            className={`btn !text-black !bg-brand-background hover:bg-brand-dark-gray rounded-[10px] ${activeTab === 'upcoming' ? '!bg-brand-dark-gray !text-white' : ''}`}
            onClick={() => {
              setActiveTab('upcoming');
              setCurrentPage(1);
            }}>Upcoming Events</Button>
          <Button
            className={`btn !text-black !bg-brand-background hover:bg-brand-dark-gray rounded-[10px] ${activeTab === 'past' ? '!bg-brand-dark-gray !text-white' : ''}`}
            onClick={() => {
              setActiveTab('past');
              setCurrentPage(1);
            }}>Past Events</Button>
        </div>

        {/* Pagination */}
        <Pagination className='hidden lg:flex justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {/* Show first page */}
            {totalPages > 0 && (
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Show ellipsis if needed */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Show current page and adjacent pages */}
            {totalPages > 1 && currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="cursor-pointer"
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {totalPages > 1 && currentPage > 1 && currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  isActive={true}
                  className="cursor-pointer"
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
            )}

            {totalPages > 2 && currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="cursor-pointer"
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Show ellipsis if needed */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Show last page */}
            {totalPages > 1 && (
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>


      {/* Searchbar */}
      <div className="relative max-w-fit py-5 mx-auto">
        <Input
          type="text"
          placeholder="Search for events..."
          className="input !min-w-80 !text-base !bg-brand-background/80"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
        {searchTerm && (
          <X
            onClick={() => setSearchTerm('')}
            className="w-4 h-4 absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" />
        )}
      </div>

      {/* Upcoming Events */}
      {activeTab === 'upcoming' && <div className='mt-5 flex flex-wrap gap-6 justify-center'>

        {paginatedEvents.map((event) => (
          <EventCard
            slug={event.slug}
            title={event.title}
            location={event.city}
            date={event.event_start_date}
            image={getImageUrl(event.image)}
            imageAlt={event.title}
            isLive={isEventLive(event)}
            isUpcoming={true}
            isPast={false}
            id={event.id}
            uuid={event.uuid}
            total_attendees={event.total_attendee || 0}
            total_checkedin_speaker={event.total_checkedin_speaker}
            total_speaker={event.total_speaker || 0}
            total_sponsor={event.total_sponsor || 0}
            total_checkedin_sponsor={event.total_checkedin_sponsor}
            total_pending_delegate={event.total_pending_delegate}
            total_checked_in={event.total_checkedin}
          />
        ))}
      </div>}


      {/* Past Events */}
      {activeTab === 'past' && <div className='mt-5 flex flex-wrap gap-6 justify-center'>
        {paginatedEvents.map((event) => (
          <EventCard
            slug={event.slug}
            title={event.title}
            location={event.city}
            date={event.event_start_date}
            image={getImageUrl(event.image)}
            imageAlt={event.title}
            isLive={isEventLive(event)}
            isUpcoming={false}
            isPast={true}
            id={event.id}
            uuid={event.uuid}
            total_attendees={event.total_attendee || 0}
            total_checkedin_speaker={event.total_checkedin_speaker}
            total_speaker={event.total_speaker || 0}
            total_sponsor={event.total_sponsor || 0}
            total_checkedin_sponsor={event.total_checkedin_sponsor}
            total_pending_delegate={event.total_pending_delegate}
            total_checked_in={event.total_checkedin}
          />
        ))}
      </div>}
    </div>
  )
}

export default AllEvents;