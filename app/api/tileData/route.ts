import { auth } from '@/lib/auth';
import { fetchTileData } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (session) {
      const data = await fetchTileData({
        userId: session?.user?.id ?? undefined
      });

      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.log('error fetching tile data', error);
    return NextResponse.json(
      { error: 'Failed to fetch tile data.' },
      { status: 500 }
    );
  }
}
