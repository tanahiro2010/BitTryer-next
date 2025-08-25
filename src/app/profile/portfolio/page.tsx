import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import PortfolioEditForm from "@/components/layout/profile/portfolio/form";
import User from "@/lib/user";

export default async function PortfolioSetting() {
  const user = await User.current();
  if (!user) redirect("/login");

  return (
    <div className="p-5">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Settings</CardTitle>
          <CardDescription>Manage your portfolio settings</CardDescription>
        </CardHeader>

        <PortfolioEditForm
          name={user.user.name ?? ""}
          description={user.user.description ?? ""}
        />
      </Card>
    </div>
  );
}
