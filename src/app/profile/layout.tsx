import Sidebar from "@/components/layout/profile/sidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
        <Sidebar />
        
        <div className="w-full">
            {children}
        </div>
    </div>
  );
}