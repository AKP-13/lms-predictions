/** Keeps the page light in dark mode. globals.css reads the class. */
export default function LightOnlyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <div className="light-only contents">{children}</div>;
}
