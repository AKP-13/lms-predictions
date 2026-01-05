import { auth } from '@/lib/auth';
import { fetchLeagueInfo } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    const userId = session?.user?.id;

    if (userId) {
      const data = await fetchLeagueInfo({ userId });

      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.log('error fetching league info', error);
    return NextResponse.json(
      { error: 'Failed to fetch league info.' },
      { status: 500 }
    );
  }
}
