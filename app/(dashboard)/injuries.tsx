'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitleWithSpinner
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Injury } from '@/lib/definitions';
import { parseInjuryNews } from '@/lib/injuries';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

const ROW_CLASSES =
  'flex min-h-[3.125rem] items-center gap-2.5 border-t border-border py-1.5';
const PAGER_BUTTON_CLASSES =
  'flex h-8 items-center gap-1.5 rounded-full bg-chip px-3 text-[0.8125rem] font-extrabold transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-45';

const InjuryRow = ({ injury }: { injury: Injury }) => {
  const news = parseInjuryNews(injury.news);
  const details = [injury.team_name, news.injury].filter(Boolean).join(' · ');

  return (
    <li className={ROW_CLASSES}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-bold leading-[1.375rem]">
          {injury.web_name}
        </p>
        {details && (
          <p className="truncate text-xs font-semibold text-muted-foreground">
            {details}
          </p>
        )}
      </div>
      {news.expectedBack ? (
        <Badge variant="accent">Back {news.expectedBack}</Badge>
      ) : (
        <Badge variant="secondary">No date</Badge>
      )}
    </li>
  );
};

const Injuries = ({
  data,
  isLoading
}: {
  data: Injury[];
  isLoading: boolean;
}) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paginatedData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Card
      className={cn(
        'flex h-full min-h-0 flex-col',
        isLoading && 'animate-pulse'
      )}
      aria-busy={isLoading}
      aria-live="polite"
    >
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 pb-2 md:p-6 md:pb-2">
        <CardTitleWithSpinner isLoading={isLoading}>
          Injuries
        </CardTitleWithSpinner>
        {!isLoading && data.length > 0 && (
          <CardDescription>{data.length} players</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-5 pt-0 md:p-6 md:pt-0">
        <div className="min-h-0 flex-1 overflow-auto">
          {isLoading ? (
            <ul aria-hidden="true">
              {Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                <li key={idx} className={ROW_CLASSES}>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-24 rounded-full bg-chip" />
                    <div className="h-3 w-36 rounded-full bg-chip" />
                  </div>
                  <div className="h-7 w-20 rounded-full bg-chip" />
                </li>
              ))}
            </ul>
          ) : data.length === 0 ? (
            <p className="text-center text-muted-foreground">
              The site is being updated. Please check back later.
            </p>
          ) : (
            <ul>
              {paginatedData.map((injury) => (
                <InjuryRow key={injury.web_name} injury={injury} />
              ))}
            </ul>
          )}
        </div>

        {!isLoading && data.length > PAGE_SIZE && (
          <div className="mt-auto flex items-center justify-between pt-3.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className={PAGER_BUTTON_CLASSES}
            >
              <ChevronLeft
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2.5}
              />
              Previous
            </button>
            <span className="text-[0.8125rem] font-semibold text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={PAGER_BUTTON_CLASSES}
            >
              Next
              <ChevronRight
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2.5}
              />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Injuries;
