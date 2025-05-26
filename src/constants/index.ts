import { LayoutDashboard, NotebookPen, Trophy, Users, Youtube } from "lucide-react";
import PlaceholderImage from "/placeholder.png";

export const UserAvatar: string = PlaceholderImage;

export const sidebarItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
    },
    {
        label: "All Events",
        icon: Trophy,
        path: "/all-events",
    },
    {
        label: "All Attendees",
        icon: Users,
        path: "/all-attendees",
    },
    // {
    //     label: "All Sponsors",
    //     icon: HandHeart,
    //     path: "/all-sponsors",
    // },
    {
        label: "All Reports",
        icon: NotebookPen,
        path: "/all-reports",
    },
    {
        label: "Tutorials",
        icon: Youtube,
        path: "/tutorials",
    },
];

export const navbarLinks = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Events",
        path: "/events",
    },
    {
        label: "Explore",
        path: "/explore-events/all",
    },
    {
        label: "Feature",
        path: "#",
    },
    {
        label: "Download",
        path: "#",
    },
    {
        label: "Organiser Login",
        path: "/login",
    },
];

export const roles: string[] = ["Speaker", "Panelist", "Sponsor", "Delegate", "Moderator"];

export const domain: string = import.meta.env.VITE_API_URL;
export const appDomain: string = import.meta.env.VITE_APP_URL;
export const googleMapsApiKey: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const token: string | null = JSON.parse(localStorage.getItem("klout-organiser-storage") || '{}')?.state?.token || null;
export const additionalDomain: string = import.meta.env.VITE_ADDITIONAL_URL;
export const photoBucketUrl: string = import.meta.env.VITE_PHOTO_BUCKET_URL;