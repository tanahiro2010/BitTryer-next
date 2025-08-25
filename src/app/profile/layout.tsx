import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/profile/sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <SidebarProvider>
        <AppSidebar />

        <div className="w-full">
          <div className="mt-2 ml-2 flex items-center">
            <SidebarTrigger />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {">>"} BitTryer Dashboard
            </p>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </SidebarProvider>
    </div>
  );
}
