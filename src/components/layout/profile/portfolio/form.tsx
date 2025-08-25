"use client";
import { CardContent, CardFooter } from "@/components/ui/card";
import { handleUpdatePortfolio } from "@/handlers/portfolio";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, FileText, Save } from "lucide-react";

interface PortfolioEditFormProps {
  name: string;
  description: string;
}

export default function PortfolioEditForm({
  name,
  description,
}: PortfolioEditFormProps) {
  return (
    <form onSubmit={handleUpdatePortfolio}>
      <CardContent className="p-6 space-y-6">
        {/* 名前入力 */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4 text-blue-500" />
            Portfolio Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your portfolio name"
            defaultValue={name}
            className="transition-colors focus:border-blue-500 focus:ring-blue-500/20"
          />
          <p className="text-xs text-gray-500">
            This will be displayed as your portfolio title
          </p>
        </div>

        {/* 説明入力 */}
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-blue-500" />
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Tell others about your investment strategy, goals, or interesting facts about your portfolio..."
            defaultValue={description}
            rows={4}
            className="transition-colors focus:border-blue-500 focus:ring-blue-500/20 resize-none"
          />
          <p className="text-xs text-gray-500">
            Share your investment philosophy or portfolio highlights
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          type="submit"
          className="w-full flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </CardFooter>
    </form>
  );
}
