// Keeps the field's name on screen while the user types, unlike a placeholder.
export function LabelledField({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}
