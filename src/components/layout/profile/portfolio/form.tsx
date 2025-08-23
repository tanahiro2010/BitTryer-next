"use client";
import { CardContent, CardFooter } from "@/components/ui/card";
import { handleUpdatePortfolio } from "@/handlers/portfolio";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PortfolioEditFormProps {
    name: string;
    description: string;
}

export default function PortfolioEditForm({ name, description }: PortfolioEditFormProps) {
    return (
        <form onSubmit={handleUpdatePortfolio}>
            <CardContent>
                <Input
                    placeholder="Enter your portfolio name"
                    defaultValue={name}
                    name="name"
                />

                <Textarea
                    className="mt-4"
                    placeholder="Enter your portfolio description"
                    defaultValue={description}
                    name="description"
                />
            </CardContent>

            <CardFooter className="mt-4 w-full">
                <Button type="submit" className="w-full">Save Changes</Button>
            </CardFooter>
        </form>
    );
}

