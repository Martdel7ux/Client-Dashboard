"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { SendHorizonal, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Message } from "@/lib/supabase/database.types";

export interface Participant {
  full_name: string | null;
  avatar_url: string | null;
}

interface ChatProps {
  projectId: string;
  meId: string;
  participants: Record<string, Participant>;
  initialMessages: Message[];
  demo?: boolean;
}

function dayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

export function Chat({
  projectId,
  meId,
  participants,
  initialMessages,
  demo = false,
}: ChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function addMessage(msg: Message) {
    setMessages((prev) =>
      prev.some((m) => m.id === msg.id)
        ? prev
        : [...prev, msg].sort(
            (a, b) => +new Date(a.created_at) - +new Date(b.created_at),
          ),
    );
  }

  // Realtime subscription + mark-as-read (skipped in demo).
  useEffect(() => {
    if (demo) return;
    const supabase = createClient();

    async function markRead() {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("project_id", projectId)
        .neq("sender_id", meId)
        .eq("read", false);
      router.refresh();
    }
    markRead();

    const channel = supabase
      .channel(`messages:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          addMessage(msg);
          if (msg.sender_id !== meId) markRead();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, meId, demo, router]);

  // Auto-scroll to newest.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");

    if (demo) {
      addMessage({
        id: `demo-${Date.now()}`,
        project_id: projectId,
        sender_id: meId,
        content: text,
        read: true,
        created_at: new Date().toISOString(),
      });
      return;
    }

    setSending(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("messages")
        .insert({ project_id: projectId, sender_id: meId, content: text })
        .select()
        .single();
      if (data) addMessage(data);
    } finally {
      setSending(false);
    }
  }

  // Build a flat render list with date dividers.
  const rendered = useMemo(() => {
    const out: Array<
      | { kind: "divider"; id: string; label: string }
      | { kind: "msg"; id: string; msg: Message; showAvatar: boolean }
    > = [];
    let lastDay = "";
    let lastSender = "";
    messages.forEach((msg) => {
      const d = new Date(msg.created_at);
      const day = d.toDateString();
      if (day !== lastDay) {
        out.push({ kind: "divider", id: `d-${day}`, label: dayLabel(d) });
        lastDay = day;
        lastSender = "";
      }
      out.push({
        kind: "msg",
        id: msg.id,
        msg,
        showAvatar: msg.sender_id !== lastSender,
      });
      lastSender = msg.sender_id;
    });
    return out;
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col rounded-lg border border-line bg-surface shadow-inset-md">
      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="mb-3 grid size-12 place-items-center rounded-2xl border border-line bg-surface-raised text-accent">
              <MessageSquare className="size-5" />
            </span>
            <p className="text-sm font-medium text-ink">No messages yet</p>
            <p className="mt-1 max-w-xs text-sm text-ink-muted">
              Say hello, ask a question, or share a thought. Your team replies in
              real time.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-1">
            {rendered.map((row) =>
              row.kind === "divider" ? (
                <div
                  key={row.id}
                  className="my-4 flex items-center gap-3 text-center"
                >
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
                    {row.label}
                  </span>
                  <div className="h-px flex-1 bg-line" />
                </div>
              ) : (
                <MessageRow
                  key={row.id}
                  msg={row.msg}
                  mine={row.msg.sender_id === meId}
                  showAvatar={row.showAvatar}
                  participant={participants[row.msg.sender_id]}
                />
              ),
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line p-3 sm:p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Write a message…"
            className="max-h-32 flex-1 resize-none rounded-lg border border-line bg-surface-sunken px-3.5 py-2.5 text-sm text-ink shadow-inset placeholder:text-ink-ghost focus-visible:border-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          />
          <button
            onClick={send}
            disabled={!input.trim() || sending}
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-white transition-all hover:bg-accent-hover hover:shadow-glow disabled:opacity-40 disabled:shadow-none"
            aria-label="Send message"
          >
            <SendHorizonal className="size-[18px]" />
          </button>
        </div>
        <p className="mx-auto mt-1.5 max-w-2xl text-[11px] text-ink-ghost">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}

function MessageRow({
  msg,
  mine,
  showAvatar,
  participant,
}: {
  msg: Message;
  mine: boolean;
  showAvatar: boolean;
  participant?: Participant;
}) {
  const name = mine ? "You" : participant?.full_name ?? "Tamplo Team";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("group flex items-end gap-2.5", mine && "flex-row-reverse")}
    >
      <div className="w-8 shrink-0">
        {showAvatar && !mine && (
          <Avatar className="size-8">
            {participant?.avatar_url && (
              <AvatarImage src={participant.avatar_url} alt="" />
            )}
            <AvatarFallback className="text-[10px]">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn("flex max-w-[78%] flex-col", mine && "items-end")}>
        {showAvatar && (
          <span className="mb-1 px-1 text-[11px] font-medium text-ink-faint">
            {name}
          </span>
        )}
        <div className="flex items-end gap-2">
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
              mine
                ? "rounded-br-md bg-accent text-white"
                : "rounded-bl-md border border-line bg-surface-raised text-ink",
            )}
          >
            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          </div>
          <span className="mb-0.5 whitespace-nowrap text-[10px] text-ink-ghost opacity-0 transition-opacity group-hover:opacity-100">
            {format(new Date(msg.created_at), "HH:mm")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
