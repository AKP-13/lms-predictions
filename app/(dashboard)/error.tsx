'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-md md:pt-4">
      <Card className="flex flex-col items-center gap-4 p-7 text-center md:p-9">
        <span
          aria-hidden
          className="flex size-14 items-center justify-center rounded-full bg-destructive-bg text-destructive"
        >
          <TriangleAlert className="size-6" strokeWidth={2.25} />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-[1.625rem] font-extrabold leading-[1.875rem]">
            Something went wrong
          </h1>
          <p className="text-[0.9375rem] font-semibold leading-5 text-muted-foreground">
            This page did not load. Try again, or come back in a few minutes.
          </p>
        </div>
        <Button size="lg" className="mt-2 w-full" onClick={reset}>
          Try again
        </Button>
      </Card>
    </div>
  );
}
