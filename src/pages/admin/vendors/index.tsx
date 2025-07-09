import GoBack from "@/components/GoBack";
import Audience from "@/assets/audience.svg";
import { ChevronRight } from "lucide-react";
import Gift from "@/assets/gift.svg";
import EventSetup from "@/assets/event-setup.svg";
import { Link } from "react-router-dom";

const CardData = [
    {
        title: "Audience Acquisition",
        description: "Partner with experts to grow your audience.",
        icon: Audience,
        link: "/vendors/audience-acquisition",
    },
    {
        title: "Gifting",
        description: "Connect with top-tier gifting solutions effortlessly.",
        icon: Gift,
        link: "/vendors/gifting",
    },
    {
        title: "Event Setup",
        description: "Partner with experts to grow your audience.",
        icon: EventSetup,
        link: "/vendors/event-setup",
    },
]


const VendorsPage: React.FC = () => {

    return (
        <div className="h-full w-full">
            <GoBack />

            <div className="mt-10 flex flex-wrap gap-5">
                {/* Card */}
                {CardData.map((card, index) => (
                    <Link to={card.link} key={index}>
                    <div className="relative min-w-[400px]">
                        <div className="w-full h-full">
                            <svg width="100%" height="100%" viewBox="0 0 350 164" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.18895e-05 28C1.32414e-05 12.536 12.5361 -2.9502e-05 28 -2.81501e-05L322 -2.44784e-06C337.464 -1.09593e-06 350 12.536 350 28L350 86C350 100.359 338.359 112 324 112C309.641 112 298 123.641 298 138C298 152.359 286.359 164 272 164L28 164C12.536 164 1.09593e-06 151.464 2.44784e-06 136L1.18895e-05 28Z" fill="#f0f0f0" />
                            </svg>
                        </div>

                        {/* Content positioned absolutely over the SVG */}
                        <div className="absolute inset-0 p-6 flex flex-col gap-4">
                            <img src={card.icon} alt={card.title} width={70} height={59} />
                            <div className="flex flex-col gap-1">
                                <h4 className="font-bold">{card.title}</h4>
                                <p className="text-sm">{card.description}</p>
                            </div>
                        </div>

                        {/* Button positioned in the cut-out area */}
                        <span className="grid place-content-center bg-brand-background rounded-full p-2 size-[52px] absolute right-0 bottom-0">
                            <ChevronRight />
                        </span>
                    </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default VendorsPage;