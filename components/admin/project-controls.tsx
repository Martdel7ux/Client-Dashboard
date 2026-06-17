"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Rocket, Loader2 } from "lucide-react";
import { STAGE_ORDER, STAGE_META, STATUS_META } from "@/lib/stages";
import {
  setProjectStage,
  setProjectStatus,
  setProjectProgress,
  setProjectEndDate,
  markProjectLive,
} from "@/app/(admin)/admin/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project, ProjectStage, ProjectStatus } from "@/lib/supabase/database.types";

const STATUSES: ProjectStatus[] = [
  "onboarding",
  "in_progress",
  "review",
  "completed",
  "live",
];

export function ProjectControls({ project }: { project: Project }) {
  const [progress, setProgress] = useState(project.progress_percent);
  const [endDate, setEndDate] = useState(project.estimated_end_date ?? "");
  const [pending, startTransition] = useTransition();
  const isLive = project.stage === "launched";

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) toast.success(msg);
      else toast.error(res.error ?? "Something went wrong");
    });
  }

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Project controls</h2>
        {pending && <Loader2 className="size-4 animate-spin text-ink-faint" />}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Stage</Label>
          <Select
            value={project.stage}
            onValueChange={(v) =>
              run(
                () => setProjectStage(project.id, v as ProjectStage),
                "Stage updated — client emailed",
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGE_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {STAGE_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={project.status}
            onValueChange={(v) =>
              run(
                () => setProjectStatus(project.id, v as ProjectStatus),
                "Status updated",
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label>Progress</Label>
            <span className="tabular text-sm font-semibold text-ink">
              {progress}%
            </span>
          </div>
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setProgress(v[0])}
            onValueCommit={(v) =>
              run(() => setProjectProgress(project.id, v[0]), "Progress saved")
            }
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="end-date">Estimated end date</Label>
          <div className="flex gap-2">
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="max-w-[220px]"
            />
            <Button
              variant="secondary"
              onClick={() =>
                run(
                  () => setProjectEndDate(project.id, endDate || null),
                  "End date saved",
                )
              }
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      {!isLive && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4">
          <div>
            <p className="text-sm font-semibold text-ink">Ready to launch?</p>
            <p className="text-xs text-ink-muted">
              Marks the project live, sets stage to Launched, and emails the
              client.
            </p>
          </div>
          <Button
            onClick={() =>
              run(() => markProjectLive(project.id), "Project is live 🎉")
            }
            disabled={pending}
          >
            <Rocket /> Mark as Live
          </Button>
        </div>
      )}
    </Card>
  );
}
