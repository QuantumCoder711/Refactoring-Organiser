import { Printer } from 'lucide-react';
import React, { useRef } from 'react';
import { AttendeeType } from '@/types';
import { Button } from '@/components/ui/button';
import { cn, printBadge } from '@/lib/utils';
import BadgeBanner from "@/assets/badge-banner.jpg";

interface PrintBadgeProps {
  attendee: AttendeeType;
  print?: boolean;
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);

const PrintBadge: React.FC<PrintBadgeProps> = ({ attendee, print = true }) => {
  const firstName = attendee?.first_name || '';
  const lastName = attendee?.last_name || '';
  const companyName = attendee.company_name || '';
  const jobTitle = attendee.job_title || '';

  // Rough heuristic: if the name is very long (> 20 characters) it likely wraps to three lines on badge width
  const isLongName = (firstName.length + lastName.length) > 20; // Adjusted to consider both first and last name
  const isLongCompanyName = companyName.length > 38;
  const isLongJobTitle = jobTitle.length > 68;
  const badgeRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!badgeRef.current) return;

    if (isIOS) {
      const badgeHTML = badgeRef.current.outerHTML;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
        .map((el) => el.outerHTML)
        .join('\n');

      printWindow.document.write(`
      <html>
        <head>
          <title>Print Badge</title>
          ${styles}
          <style>
            @page {
              size: A6 portrait;
              margin: 0;
              padding: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white;
            }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              overflow: hidden;
            }
            #print-wrapper {
              width: 100%; /* badge width */
              height: 100%; /* badge height */
              display: flex;
              justify-content: center;
              align-items: center;
            }
            #print-wrapper > * {
              width: 100% !important;
              height: 100% !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: hidden !important;
            }
          </style>
        </head>
        <body>
          <div id="print-wrapper">
            ${badgeHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
              setTimeout(() => window.close(), 1000);
            };
          </script>
        </body>
      </html>
    `);
      printWindow.document.close();
    } else {
      // Desktop print using overlay
      printBadge(badgeRef.current, '100%', '100%', 'auto');
    }
  };



  return (
    <div className='max-w-80 my-10'>
      {/* Card For Printing... */}
      <div ref={badgeRef} className={cn('w-full mx-auto h-full flex flex-col gap-3 flex-1', !isIOS && '')}>
        {/* Card 1 */}
        <div className="w-full mx-auto overflow-hidden rounded bg-white flex flex-col justify-between flex-1">
          <img
            // src={`${baseUrl}/${badgeData?.imageUrl}`}
            src={BadgeBanner}
            className="w-11/12 rounded-t mx-auto mt-[10px] object-contain"
            alt="Badge"
          />

          <div className='mx-4 pb-3 !capitalize pl-1'>
            <div className={`font-bold ${isLongName ? 'text-3xl' : 'text-5xl'}`}>
              <h3 className="mb-2">{firstName?.toLowerCase() || 'First Name'} {lastName?.toLowerCase() || 'Last Name'}</h3>
              {/* <h3 className="mb-2">{}</h3> */}
            </div>
            <h3 className={`font-medium ${isLongCompanyName ? 'text-2xl' : 'text-3xl'} pt-2 mb-2`}>
              {attendee?.company_name?.toLowerCase() || "Company"}
            </h3>
            <span className={`${isLongJobTitle ? 'text-lg' : 'text-xl'} capitalize pt-2 pb-2`}>
              {attendee?.job_title?.toLowerCase() || "Designation"}
            </span>
          </div>
          <div
            style={
              attendee.status.toLowerCase() === "delegate"
                ? { backgroundColor: 'white', color: 'black', border: '1px solid black' }
                : attendee.status.toLowerCase() === "speaker"
                  ? { backgroundColor: '#80365F', color: 'white' }
                  : attendee.status.toLowerCase() === "sponsor"
                    ? { backgroundColor: 'black', color: 'white' }
                    : {}
            }
            className="py-3 text-2xl text-center capitalize font-semibold rounded-3xl max-w-11/12 mx-auto w-full bg-gradient-to-r">
            {(attendee?.status?.toLowerCase() === "sponsor" ? "Partner" : attendee?.status?.toLowerCase()) || "Delegate"}
          </div>
        </div>
        {/* Card 2 */}
        <div className="w-full rotate-x-180 rotate-y-180 mx-auto overflow-hidden rounded bg-white hidden print:flex flex-col justify-between flex-1">
          <img
            // src={`${baseUrl}/${badgeData?.imageUrl}`}
            src={BadgeBanner}
            className="w-11/12 rounded-t mx-auto mt-3 object-contain"
            alt="Badge"
          />

          <div className='mx-4 pb-3 !capitalize pl-1'>
            <div className={`font-bold ${isLongName ? 'text-3xl' : 'text-5xl'}`}>
              <h3 className="mb-2">{firstName?.toLowerCase() || 'First Name'} {lastName?.toLowerCase() || 'Last Name'}</h3>
              {/* <h3 className="mb-2">{}</h3> */}
            </div>
            <h3 className={`font-medium ${isLongCompanyName ? 'text-2xl' : 'text-3xl'} pt-2 mb-2`}>
              {attendee?.company_name?.toLowerCase() || "Company"}
            </h3>
            <span className={`${isLongJobTitle ? 'text-lg' : 'text-xl'} capitalize pt-2 pb-2`}>
              {attendee?.job_title?.toLowerCase() || "Designation"}
            </span>
          </div>
          <div
            style={
              attendee.status.toLowerCase() === "delegate"
                ? { backgroundColor: 'white', color: 'black', border: '1px solid black' }
                : attendee.status.toLowerCase() === "speaker"
                  ? { backgroundColor: '#80365F', color: 'white' }
                  : attendee.status.toLowerCase() === "sponsor"
                    ? { backgroundColor: 'black', color: 'white' }
                    : {}
            }
            // className="py-4 text-xl text-center capitalize font-semibold bg-gradient-to-r">
            className="py-3 text-2xl text-center capitalize font-semibold rounded-3xl max-w-11/12 mx-auto w-full bg-gradient-to-r">
            {(attendee?.status?.toLowerCase() === "sponsor" ? "Partner" : attendee?.status?.toLowerCase()) || "Delegate"}
          </div>
        </div>
      </div>

      {print && (
        <Button onClick={handlePrint} className='btn my-4 btn-primary w-full flex items-center justify-center gap-2'>
          <Printer className="w-4 h-4" /> Print Badge
        </Button>
      )}
    </div>
  )
}

export default PrintBadge;