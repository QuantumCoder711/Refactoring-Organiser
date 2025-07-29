import DocumentRenderer from "@/components/DocumentRenderer";
import GoBack from "@/components/GoBack";
import Wave from "@/components/Wave";
import { domain, sponsorPdfBucketUrl, token } from "@/constants";
import { getImageUrl } from "@/lib/utils";
import axios from "axios";
import { CircleCheck, CircleX } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface EventSponsorAttendee {
    id: number;
    first_name: string;
    last_name: string;
    job_title: string;
    image: string | null;
}

interface SponsorDetails {
    id: number;
    uuid: string;
    user_id: number;
    event_id: number;
    company_name: string;
    company_logo: string;
    about_company: string;
    video_link: string;
    upload_deck: string[];
    attendees: EventSponsorAttendee[] | [];
}

const ViewEventSponsorDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [data, setData] = useState<SponsorDetails | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        axios.get(`${domain}/api/display-sponsors/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        }).then(res => {
            if (res.data.success) {
                const obj = { ...res.data.sponsor, attendees: res.data.attendees }
                setData(obj);
                toast(res.data.message || "Event sponsor attendees retrieved successfully", {
                    className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleCheck className='size-5' />
                });
            } else {
                toast(res.data.message || "Error while fetching sponsor details", {
                    className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
                    icon: <CircleX className='size-5' />
                });
            }
        }).finally(() => {
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return <Wave />
    }

    return (
        <div>
            <GoBack />

            <div className="max-w-2xl mx-auto p-5 bg-brand-background mt-5 rounded-2xl">
                <div className="flex gap-5 items-center mb-5">
                    {
                        data?.company_logo ? <img src={getImageUrl(data.company_logo)} alt={data.company_name} className="size-28 border-2 object-contain rounded-full" />
                            : <div className="size-28 bg-brand-primary/30 rounded-full" />
                    }
                    <h3 className="font-semibold capitalize">{data?.company_name}</h3>
                </div>
                <h5 className="text-xl font-bold">About Company</h5>

                <p className="mt-5">{data?.about_company}</p>

                {/* Attendees */}
                <div className="grid grid-cols-3 gap-5 mt-5">
                    {data?.attendees.map(attendee => (
                        <div key={attendee.id} className="flex flex-col gap-1 mb-5 items-center">
                            {
                                attendee.image ? <img src={getImageUrl(attendee.image)} alt={`${attendee.first_name} ${attendee.last_name}`} className="size-28 object-cover object-center rounded-full" />
                                    : <div className="size-28 bg-brand-primary/30 rounded-full" />
                            }
                            <h5 className="font-semibold capitalize">{attendee.first_name} {attendee.last_name}</h5>
                            <span className="text-sm leading-0 capitalize mt-0.5">{attendee.job_title}</span>
                        </div>
                    ))}
                </div>

                {/* Video Link */}
                {data?.video_link && (
                    <div className="w-full h-80 rounded-xl mt-10">
                        {(() => {
                            const link = data.video_link;
                            // Check for YouTube
                            const youtubeMatch = link.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                            if (youtubeMatch) {
                                const videoId = youtubeMatch[1];
                                return (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${videoId}`}
                                        title="Sponsor Video"
                                        className="w-full h-full rounded-xl"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                );
                            }
                        })()}
                    </div>
                )}

                {/* Pdf */}
                {/* {data?.upload_deck && (
                    <div className="w-full h-96 mt-10">
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(`${sponsorPdfBucketUrl}/${data.upload_deck}`)}`}
                            width="100%"
                            title="PowerPoint Viewer"
                            height="100%"
                        />

                    </div>
                )} */}

                {data?.upload_deck && (
                    <div className="w-full rounded-xl mt-10">
                        <DocumentRenderer filePaths={data.upload_deck}/>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewEventSponsorDetails;