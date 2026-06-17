"use client";

import { useState } from "react";
import { GitPullRequestArrow, Plus, Check, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ChangeRequestForm } from "./change-request-form";
import { ChangeRequestCard } from "./change-request-card";
import type { ChangeRequest } from "@/lib/supabase/database.types";

export function ChangesView({
  projectId,
  isPostLaunch,
  requests,
  demo = false,
}: {
  projectId: string;
  isPostLaunch: boolean;
  requests: ChangeRequest[];
  demo?: boolean;
}) {
  // Only used in demo so newly-submitted requests appear instantly.
  const [demoExtra, setDemoExtra] = useState<ChangeRequest[]>([]);
  const all = demo ? [...demoExtra, ...requests] : requests;

  const free = all
    .filter((r) => !r.is_post_launch)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  const post = all
    .filter((r) => r.is_post_launch)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <div>
        <Card className="sticky top-8 p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            New change request
          </h2>
          <ChangeRequestForm
            projectId={projectId}
            isPostLaunch={isPostLaunch}
            demo={demo}
            onDemoSubmit={(r) => setDemoExtra((prev) => [r, ...prev])}
          />
        </Card>
      </div>

      {/* Lists */}
      <Tabs defaultValue={isPostLaunch ? "post" : "free"}>
        <TabsList>
          <TabsTrigger value="free">
            During Project
            <Badge variant="outline" className="ml-1 px-1.5 py-0">
              Free
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="post">
            Post-Launch
            <Badge variant="outline" className="ml-1 px-1.5 py-0">
              €45
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="free">
          {free.length > 0 ? (
            <div className="space-y-3">
              {free.map((r) => (
                <ChangeRequestCard key={r.id} request={r} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<GitPullRequestArrow className="size-6" />}
                satellites={[
                  <Plus key="p" className="size-3.5" />,
                  <Clock key="c" className="size-3.5" />,
                  <Check key="k" className="size-3.5" />,
                ]}
                title="No requests yet"
                description="Changes you request while the project is live are free. Submit one and we'll pick it up right away."
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="post">
          {post.length > 0 ? (
            <div className="space-y-3">
              {post.map((r) => (
                <ChangeRequestCard key={r.id} request={r} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<GitPullRequestArrow className="size-6" />}
                satellites={[
                  <Sparkles key="s" className="size-3.5" />,
                  <Check key="k" className="size-3.5" />,
                ]}
                title="Nothing post-launch"
                description="Once your site is live, change requests are billed at €45 each and appear here with their invoice status."
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
