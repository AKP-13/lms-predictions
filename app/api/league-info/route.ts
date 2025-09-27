import { auth } from '@/lib/auth';
import { fetchLeagueInfo } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    const data = await fetchLeagueInfo({
      userId: session?.user?.id ?? undefined
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log('error fetching league info', error);
    return NextResponse.json(
      { error: 'Failed to fetch league info.' },
      { status: 500 }
    );
  }
}
