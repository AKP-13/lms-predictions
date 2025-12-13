import { auth } from '@/lib/auth';
import { fetchCurrentGameData } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    const data = await fetchCurrentGameData({
      userId: session?.user?.id ?? undefined
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log('error fetching current game data', error);
    return NextResponse.json(
      { error: 'Failed to fetch results.' },
      { status: 500 }
    );
  }
}
