import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Calendar, Home, Coins, CirclePoundSterling, Gift, User, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const items = [
    {
        title: "Home",
        url: "/profile",
        icon: Home
    },
    {
        title: "Portfolio",
        url: "/profile/portfolio",
        icon: User
    },
    {
        title: "Trade",
        url: "/profile/trade",
        icon: CirclePoundSterling
    },
    {
        title: "Coins",
        url: "/profile/coins",
        icon: Coins
    },
    {
        title: "History",
        url: "/profile/history",
        icon: Calendar
    },
    {
        title: "Gift",
        url: "/profile/gift",
        icon: Gift
    },
    {
        title: "Settings",
        url: "/profile/settings",
        icon: Settings
    }
];

export default function AppSidebar() {
    const logoSize = 35;

    return (
        <Sidebar>
            <SidebarHeader>
                <Link href={`/`}>
                    { /* Sidebar logo */}
                    <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 rounded">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center">
                            {/* <span className="text-white font-semibold text-sm">B</span> */}
                            <Image src="/bit.png" alt="" className="rounded" width={logoSize} height={logoSize} />
                        </div>

                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">BitTryer</h1>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup className={`h-full ${false ? "flex flex-col justify-center" : ""}`}>

                    <SidebarGroupContent className="flex flex-col justify-center">
                        <SidebarMenu className="">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} className="mt-1 text-lg">
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                { /* Sidebar User Info */}
                <div className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">T</span>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">tanahiro2010</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">無料プラン(変更不可)</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <Link href="/profile/settings" className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors">
                            アカウント設定
                        </Link>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}