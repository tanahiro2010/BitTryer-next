import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function UserNotFound() {
    return (
        <div className="h-full items-center justify-center flex flex-col">
            <div className="text-4xl font-bold">
                <span className="text-red-600">User</span>
                <span> not found</span>
            </div>

            <div className="mt-10">
                <span className="text-gray-500">Please check the user ID and try again.</span>
            </div>

            <form action="/search" method="get" className="flex items-center justify-center mt-4 p-2">
                <Input type="text" name="q" placeholder="Enter user ID" />
                <Button type="submit" className="ml-2">Search</Button>
            </form>
        </div>
    );
}