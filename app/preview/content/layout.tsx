import { ClientPreviewShell } from "@/components/layout/client-preview-shell";

export default function ContentPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPreviewShell>{children}</ClientPreviewShell>;
}
