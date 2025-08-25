import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>
          User profile information will be displayed here.
        </CardDescription>
      </CardContent>
      <CardFooter>
        <CardAction>
          <button>Edit Profile</button>
        </CardAction>
      </CardFooter>
    </Card>
  );
}
