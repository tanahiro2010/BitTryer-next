import { redirect } from "next/navigation";
import { getBaseUrl } from "@/utils/url";
import User from "@/lib/user";

export default async function GiftPage() {
    const [user, baseUrl] = await Promise.all([User.current(), getBaseUrl()]);
    if (!user) redirect("/login");
    return (
        <div className="">
            <h1 className="text-4xl font-bold mb-4">Gift Page</h1>
            <p className="text-lg mb-8">
                This is the gift page for {user.user.name}.
            </p>
            <div className="flex space-x-2">
                <div className="w-1/2"></div>
                <div className="w-1/2"></div>
            </div>
        </div>
    );
}
