import { Button } from "../ui/button";
import { Input } from "../ui/input";
import SearchForm from "../layout/search-form";

export default function UserNotFound() {
  return (
    <div className="h-full items-center justify-center flex flex-col">
      <div className="text-4xl font-bold">
        <span className="text-red-600">User</span>
        <span> not found</span>
      </div>

      <div className="mt-10">
        <span className="text-gray-500">
          Please check the user ID and try again.
        </span>
      </div>

      <div className="mt-6">
        <SearchForm defaultValue="" />
      </div>
    </div>
  );
}
