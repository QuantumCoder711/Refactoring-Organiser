import { BrainCircuit, ChartPie, HandHeart, Images, LayoutDashboard, NotebookPen, Trophy, Users } from "lucide-react";

export const UserAvatar: string = "https://github.com/shadcn.png";

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
    {
        label: "All Sponsors",
        icon: HandHeart,
        path: "/all-sponsors",
    },
    {
        label: "All Reports",
        icon: NotebookPen,
        path: "/all-reports",
    },
    {
        label: "Tutorials",
        icon: NotebookPen,
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
        path: "#",
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
export const googleMapsApiKey: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
export const token: string | null = JSON.parse(localStorage.getItem("klout-organiser-storage") || '{}')?.state?.token || null;