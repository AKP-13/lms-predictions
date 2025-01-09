// import { Suspense } from "react";
// import { CardsSkeleton } from "@/app/ui/skeletons";
import { PartyPopper } from 'lucide-react';
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
      <div className="rounded-xl bg-white p-4 shadow-sm grid col-span-2 md:col-span-1 my-4">
        <div className="flex p-4">
          <PartyPopper className={`h-5 w-5 text-blue-300`} />
          {/* <h3 className="ml-2 text-sm font-medium">{title}</h3> */}
        </div>
        <p className="rounded-xl px-4 py-4 text-center text-xl font-light">
          Welcome! This is a demo version of a tool I've built to help submit
          LMS predictions, view past results, and analyse performance.
        </p>
        <p className="rounded-xl px-4 py-4 text-center text-xl font-light">
          Interested in using this tool? Drop me an email at{' '}
          <a
            href="mailto:alexlmsapp@icloud.com?subject=Interested%20in%20LMS%20Predictions%20Tool&body=Hi%20Alex,%0D%0A%0D%0AI%20am%20interested%20in%20using%20your%20LMS%20Predictions%20Tool.%20Please%20provide%20more%20information.%0D%0A%0D%0AThank%20you!"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            alexlmsapp@icloud.com
          </a>
          .
        </p>
      </div>
      {/* <Suspense fallback={<CardsSkeleton />}> */}
      <TileWrapper />
      {/* </Suspense> */}

      <CurrentGameResults />

      <div className="block md:flex">
        <div className="my-8 md:mr-3 w-full md:my-0">
          <CurrentGwFixtures />
        </div>

        <div className="my-8 md:ml-3 w-full md:my-0">
          <Predictions />
        </div>
      </div>
    </main>
  );
}
