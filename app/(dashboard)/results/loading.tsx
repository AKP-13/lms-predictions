import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ResultsLoading() {
  return (
    <Card className="rounded-xl bg-white shadow-sm animate-pulse">
      <CardHeader className="p-4 md:p-6">
        <div className="h-6 w-24 rounded-full bg-gray-200 mb-2" />
        <div className="h-4 w-48 rounded-full bg-gray-200" />
      </CardHeader>

      <CardContent className="p-2 md:p-6 md:pt-0 overflow-x-auto">
        {/* Table header */}
        <div className="flex gap-4 mb-3 pb-3 border-b border-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-20 rounded-full bg-gray-200" />
          ))}
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-gray-50">
            <div className="h-4 w-16 rounded-full bg-gray-200" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex flex-col gap-1">
                <div className="h-4 w-20 rounded-full bg-gray-100" />
                <div className="h-3 w-16 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
