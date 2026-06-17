import { ClientPreviewShell } from "@/components/layout/client-preview-shell";

export default function ChangesPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPreviewShell>{children}</ClientPreviewShell>;
}
