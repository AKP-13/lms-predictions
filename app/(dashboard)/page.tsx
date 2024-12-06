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
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4 w-5/12 md:w-full">
        {/* <Suspense fallback={<CardsSkeleton />}> */}
        <TileWrapper />
        {/* </Suspense> */}
      </div>

      <CurrentGameResults />

      <div className="block md:flex">
        <div className="w-5/12 my-8 md:mr-3 md:w-full md:my-0">
          <CurrentGwFixtures />
        </div>

        <div className="w-5/12 my-8 md:ml-3 md:w-full md:my-0">
          <Predictions />
        </div>
      </div>
    </main>
  );
}
