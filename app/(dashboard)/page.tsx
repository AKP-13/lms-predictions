// import { Suspense } from "react";
// import { CardsSkeleton } from "@/app/ui/skeletons";
import TileWrapper from '@/components/ui/tiles';
import { Metadata } from 'next';
import CurrentGameResults from './current-game-results';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function Page() {
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* <Suspense fallback={<CardsSkeleton />}> */}
        <TileWrapper />
        {/* </Suspense> */}
      </div>

      <CurrentGameResults />
    </main>
  );
}
