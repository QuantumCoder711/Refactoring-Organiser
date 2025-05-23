import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { additionalDomain, domain, photoBucketUrl } from '@/constants';
import axios from 'axios';
import { toast } from 'sonner';
import { FileUp, FileText, CircleX, CheckCircle, CircleCheck } from 'lucide-react';
import GoBack from '@/components/GoBack';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { FileUp, FileText } from 'lucide-react';
=======
>>>>>>> main
import { UserAvatar } from '@/constants';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import useAuthStore from '@/store/authStore';
import useEventStore from '@/store/eventStore';

<<<<<<< HEAD
const AiPhotos: React.FC = () => {
    const [,setFiles] = useState<File[]>([]);
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const imagesPerPage = 15;
    const totalImages = 100; // Replace with actual total number of images
    const totalPages = Math.ceil(totalImages / imagesPerPage);
=======
// Constants
const CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks
const API_ENDPOINT = additionalDomain + '/api/v1/faces/uploadChunk';
const PHOTOS_ENDPOINT = additionalDomain + '/api/v1/faces/all-photos';
const CHECK_ENDPOINT = additionalDomain + '/api/v1/faces/check';
>>>>>>> main

// Types
interface Photo {
  imageUrl: string;
  // Add other photo properties as needed
}

const AiPhotos: React.FC = () => {
  // URL and config parameters
  const { slug } = useParams<{ slug: string }>();
  
  // Redux
  const { user } = useAuthStore(state => state);
  const event = useEventStore(state => state.getEventBySlug(slug));
  
  // User and event identifiers
  const eventUuid = event?.uuid;
  const userId = user?.id;
  
  // File handling states
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [imagesAlreadyUploaded, setImagesAlreadyUploaded] = useState<boolean>(false);
  
  // Photos and pagination states
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const imagesPerPage = 15;
  
  // Calculate pagination values
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = photos.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(photos.length / imagesPerPage);
  
  // Secret button visibility state
  const [showButton, setShowButton] = useState<boolean>(false);
  const sequenceRef = useRef<string>("");
  
  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setUploadProgress(0); // Reset progress when new file is selected
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
    },
    multiple: false,
  });
  
  // Handle page navigation
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Check upload status when tab changes
    checkUploadStatus();
    
    // Load photos when switching to photos tab
    if (value === "photos") {
      fetchPhotos();
    }
  };
  
  // Secret sequence detection for admin button
  useEffect(() => {
    const handleButtonDisplay = (event: KeyboardEvent) => {
      sequenceRef.current += event.key.toLowerCase();
      
      // Keep only the last 6 characters
      if (sequenceRef.current.length > 6) {
        sequenceRef.current = sequenceRef.current.slice(-6);
      }
      
      // Check for reveal/hide sequences
      if (sequenceRef.current === "reveal") {
        setShowButton(true);
        sequenceRef.current = "";
      }
      
      if (sequenceRef.current === "hide") {
        setShowButton(false);
        sequenceRef.current = "";
      }
    };
    
    window.addEventListener("keydown", handleButtonDisplay);
    return () => window.removeEventListener("keydown", handleButtonDisplay);
  }, []);
  
  // Function to fetch photos
  const fetchPhotos = async () => {
    if (!eventUuid || !userId) return;
    
    try {
      const response = await axios.post(PHOTOS_ENDPOINT, { eventUuid, userId }, {
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.data.status) {
        const allPhotos = response.data.data.map((item: any) => ({
          imageUrl: item.imageUrl
        }));
        setPhotos(allPhotos);
      }
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  };
  
  // Load photos when component mounts
  useEffect(() => {
    if (activeTab === "photos") {
      fetchPhotos();
    }
  }, [activeTab, eventUuid, userId]);
  
  // Check upload status
  const checkUploadStatus = async () => {
    if (!eventUuid || !userId) return;
    
    try {
      const response = await axios.post(CHECK_ENDPOINT, { eventUuid, userId }, {
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.data.status) {
        const { completedStep } = response.data.data;
        
        if (completedStep === 2) {
          setImagesAlreadyUploaded(true);
          setProcessing(false);
        } else if (completedStep === 1) {
          setImagesAlreadyUploaded(true);
          setProcessing(true);
        } else {
          setImagesAlreadyUploaded(false);
          setProcessing(false);
        }
      }
    } catch (err) {
      console.error("Error checking upload status:", err);
    }
  };
  
  // Check status on initial load and tab changes
  useEffect(() => {
    checkUploadStatus();
  }, [eventUuid, userId]);
  
  // Upload file in chunks
  const handleUpload = async () => {
    if (!file) {
      toast("Please drop a file first.", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
      return;
    }
    
    if (!userId || !eventUuid) {
      toast("Missing user ID or event information.", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
      return;
    }
    
    setLoading(true);
    
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let completedStep = 0;
    
    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const blob = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('zipChunk', blob, file.name);
        formData.append('userId', String(userId));
        formData.append('eventUuid', eventUuid);
        formData.append('isLastChunk', chunkIndex === totalChunks - 1 ? "true" : "false");
        
        try {
          const response = await axios.post(API_ENDPOINT, formData, {
            onUploadProgress: (progressEvent) => {
              // This only tracks progress of the current chunk
              // We calculate overall progress based on completed chunks
              const chunkProgress = (progressEvent.loaded / (progressEvent.total || 1)) || 0;
              const overallProgress = Math.round(((chunkIndex + chunkProgress) / totalChunks) * 100);
              setUploadProgress(overallProgress);
            }
          });
          
          const result = response.data;
          
          if (result.completedStep) {
            completedStep = result.completedStep;
          }
          
          // Update progress one more time to ensure UI is accurate
          setUploadProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
          
        } catch (error) {
          toast("Upload failed. Please try again.", {
            className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
            icon: <CircleX className="size-5" />
          });
          setLoading(false);
          return;
        }
      }
      
      // Upload completed successfully
      setLoading(false);
      
      if (completedStep) {
        toast("File uploaded successfully. Your images are processing.", {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className="size-5" />
        });

        setUploadProgress(0);
        // You might want to refresh upload status
        if (completedStep === 1) {
          setImagesAlreadyUploaded(true);
          setProcessing(true);
        } else if (completedStep === 2) {
          setImagesAlreadyUploaded(true);
          setProcessing(false);
        }
      } else {
        toast("Upload completed but processing status is unknown. Please check back later.", {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className="size-5" />
        });
      }
      
    } catch (err) {
      console.error('Error in upload process:', err);
      setLoading(false);
      
      toast("Upload failed. Please try again.", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
    }
  };
  
  // Download attendee profile images
  const handleDownload = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${domain}/api/get-event-attendee-numbers`,
        { event_uuid: event?.uuid },
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob',
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'profile_images.zip');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setLoading(false);
      
      toast("Download successful", {
        className: "!bg-green-700 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CheckCircle className="size-5" />
      });
      
    } catch (err) {
      setLoading(false);
      
      toast("Download failed. Please try again.", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
    }
  };
  
  return (
    <div className='relative w-full h-full'>
      <div className='absolute top-0 left-0'>
        <GoBack />
      </div>

      <div className='max-w-3xl bg-brand-background mx-auto rounded-[10px] p-7'>
        <Tabs 
          defaultValue="upload" 
          className="mx-auto"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="bg-white p-0 max-w-[390px] mx-auto !max-h-9">
            <TabsTrigger
              value="upload"
              className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
            >
              Upload Files
            </TabsTrigger>
            <TabsTrigger
              value="photos"
              className="max-h-9 px-4 h-full font-medium text-xl !py-0 cursor-pointer data-[state=active]:text-white data-[state=active]:bg-brand-dark-gray"
            >
              Photos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-5">
            {processing ? (
              <div className="p-5 bg-yellow-50 border border-yellow-300 rounded-lg text-center">
                <h3 className="text-xl font-medium text-yellow-800 mb-2">Processing Images</h3>
                <p className="text-yellow-800">Your images are currently being processed. This may take some time.</p>
                <p className="text-yellow-700 mt-2 text-sm">You can check the "Photos" tab to see when your processed images are available.</p>
              </div>
            ) : (
              <>
                <h3 className='font-semibold'>Event Zip Files<span className='text-brand-secondary'>*</span></h3>
                <div 
                  {...getRootProps()} 
                  className={`border group duration-300 hover:border-brand-primary border-brand-light-gray shadow-blur rounded-lg bg-white p-6 cursor-pointer transition-colors ${
                    isDragActive ? 'border-brand-secondary bg-brand-secondary/10' : 'border-gray-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <FileUp width={24} className="group-hover:stroke-brand-primary duration-300" />
                    {isDragActive ? (
                      <p className="text-brand-secondary font-medium">Drop the file here...</p>
                    ) : (
                      <>
                        <p className="text-lg"><span className="text-brand-primary font-semibold">Click Here</span> to Upload your File or Drag</p>
                        <p className="">Supported file: <span className="font-semibold">.zip (Max 6GB)</span></p>
                      </>
                    )}
                    {file && (
                      <div className="mt-4 flex items-center gap-2 p-2 bg-gray-100 rounded-md w-full">
                        <FileText className="size-5 text-brand-secondary" />
                        <span className="text-sm font-medium truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                {uploadProgress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div 
                      className="bg-brand-secondary h-2 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-gray-600 mt-1 text-right">{uploadProgress}% uploaded</p>
                  </div>
                )}

                <div className='w-full flex justify-center mt-9'>
                  <Button
                    className='w-36 bg-brand-secondary text-white cursor-pointer hover:bg-brand-secondary'
                    onClick={handleUpload}
                    disabled={loading || !file}
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="photos">
            <div className='grid grid-cols-3 grid-rows-5 gap-4 mt-5'>
              {/* Display actual photos from the server */}
              {currentImages.length > 0 && (
                currentImages.map((photo, index) => (
                  <img 
                    key={index} 
                    src={`${photoBucketUrl}/${photo.imageUrl}`} 
                    alt={`Event photo ${indexOfFirstImage + index + 1}`} 
                    className='rounded-[10px] w-full aspect-square object-cover'
                  />
                ))
              )}
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
          </TabsContent>
        </Tabs>
        
        {/* Admin Section (Hidden by default) */}
        {showButton && (
          <div className="mt-8 p-4 border border-brand-light-gray rounded-lg bg-white">
            <h3 className="text-xl font-semibold mb-4 text-brand-dark-gray">Admin Actions</h3>
            <Button
              onClick={handleDownload}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-medium ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-brand-secondary text-white hover:bg-brand-secondary'
              }`}
            >
              {loading ? 'Processing...' : 'Download Attendee Profile Images'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPhotos;