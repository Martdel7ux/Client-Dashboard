import { ClientPreviewShell } from "@/components/layout/client-preview-shell";

export default function MessagesPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPreviewShell>{children}</ClientPreviewShell>;
}
