import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export default function SearchForm({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  return (
    <form action="/search" method="get" className="w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          name="q"
          placeholder="ユーザー名で検索..."
          defaultValue={defaultValue}
          className="pl-10 pr-20"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2"
        >
          検索
        </Button>
      </div>
    </form>
  );
}
