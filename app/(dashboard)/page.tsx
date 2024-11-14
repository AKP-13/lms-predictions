// import { Suspense } from "react";
// import { CardsSkeleton } from "@/app/ui/skeletons";
import TileWrapper from '@/components/ui/tiles';
import { Metadata } from 'next';
import CurrentGameResults from './current-game-results';
import CurrentGwFixtures from './current-gw-fixtures';
import Predictions from './predictions';

export const metadata: Metadata = {
  title: 'Dashboard'
};

export default async function Page() {
  return (
    <main>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* <Suspense fallback={<CardsSkeleton />}> */}
        <TileWrapper />
        {/* </Suspense> */}
      </div>

      <CurrentGameResults />

      <div style={{ display: 'flex' }}>
        <div className="w-1/2 mr-3">
          <CurrentGwFixtures />
        </div>

        <div className="w-1/2 ml-3">
          <Predictions />
        </div>
      </div>
    </main>
  );
}
