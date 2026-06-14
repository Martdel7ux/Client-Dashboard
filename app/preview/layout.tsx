// Passthrough — each preview section (client / admin) supplies its own
// sidebar via a nested layout.
export default function PreviewRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
