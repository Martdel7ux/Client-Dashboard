import { requireProfile } from "@/lib/queries";
import { getInitials } from "@/lib/utils";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Settings — Atelier" };

export default async function SettingsPage() {
  const profile = await requireProfile();

  return (
    <div>
      <PageHeading
        title="Settings"
        description="Manage your profile and account security."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                {profile.avatar_url && (
                  <AvatarImage src={profile.avatar_url} alt="" />
                )}
                <AvatarFallback className="text-base">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-ink">
                  {profile.full_name ?? "Your name"}
                </p>
                <p className="text-sm text-ink-muted">{profile.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                defaultValue={profile.full_name ?? ""}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={profile.email} disabled />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new_password">New password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••••••"
              />
            </div>
            <Button variant="secondary">Update password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
