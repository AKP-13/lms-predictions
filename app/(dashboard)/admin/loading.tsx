export default function AdminLoading() {
  return (
    <div className="rounded-xl bg-white shadow-sm p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-6 w-48 rounded-full bg-gray-200 mb-2" />
        <div className="h-4 w-72 rounded-full bg-gray-200" />
      </div>

      {/* Table header */}
      <div className="flex gap-4 mb-3 pb-3 border-b border-gray-100">
        <div className="h-4 w-28 rounded-full bg-gray-200" />
        <div className="h-4 w-40 rounded-full bg-gray-200" />
        <div className="h-4 w-32 rounded-full bg-gray-200" />
      </div>

      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-4 border-b border-gray-50">
          <div className="flex flex-col gap-1 w-28">
            <div className="h-4 w-24 rounded-full bg-gray-200" />
            <div className="h-3 w-28 rounded-full bg-gray-100" />
          </div>
          <div className="flex gap-1 w-40">
            <div className="h-6 w-20 rounded bg-gray-100" />
            <div className="h-6 w-20 rounded bg-gray-100" />
          </div>
          <div className="h-6 w-32 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
