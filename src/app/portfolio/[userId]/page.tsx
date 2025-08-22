import UserNotFound from "@/components/screen/user-not-found";
import User from "@/lib/user";

interface PortfolioProps {
    params: Promise<{ userId: string }>;
}

export default async function Portfolio({ params }: PortfolioProps) {
    const { userId } = await params;
    const user = await User.get(userId);
    if (!user) {
        return <UserNotFound />;
    }

    return (
        <div>
            <h1>{user.user.name}'s Portfolio</h1>
            {/* Render user portfolio details here */}
        </div>
    )
}