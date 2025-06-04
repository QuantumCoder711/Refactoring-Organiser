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

const AllEvents: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { events } = useEventStore(state => state);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10; // Adjust as needed

  const { upcomingEvents, pastEvents } = filterEvents(events);
  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
  const totalPages = Math.ceil(currentEvents.length / eventsPerPage);

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
        <Pagination className='mt-[26px] flex justify-end'>
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

      {/* Upcoming Events */}
      {activeTab === 'upcoming' && <div className='mt-5 flex flex-wrap gap-6'>

        {paginatedEvents.map((event) => (
          <EventCard
            key={event.uuid}
            title={event.title}
            location={event.event_venue_address_2}
            date={event.event_date}
            image={getImageUrl(event.image)}
            imageAlt={event.title}
            isLive={isEventLive(event)}
            slug={event.slug}
            id={event.id}
            uuid={event.uuid}
            total_attendees={event.total_attendees || 0}
            total_checkedin_speaker={event.total_checkedin_speaker}
            total_checkedin_sponsor={event.total_checkedin_sponsor}
            total_pending_delegate={event.total_pending_delegate}
          />
        ))}
      </div>}


      {/* Past Events */}
      {activeTab === 'past' && <div className='mt-5 flex flex-wrap gap-6'>
        {paginatedEvents.map((event) => (
          <EventCard
            key={event.uuid}
            title={event.title}
            location={event.event_venue_address_2}
            date={event.event_date}
            image={getImageUrl(event.image)}
            imageAlt={event.title}
            slug={event.slug}
            id={event.id}
            uuid={event.uuid}
            total_attendees={event.total_attendees || 0}
            total_checkedin_speaker={event.total_checkedin_speaker}
            total_checkedin_sponsor={event.total_checkedin_sponsor}
            total_pending_delegate={event.total_pending_delegate}
          />
        ))}
      </div>}
    </div>
  )
}

export default AllEvents;
