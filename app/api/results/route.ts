import { auth } from '@/lib/auth';
import { fetchResultsData } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    const data = await fetchResultsData({
      userId: session?.user?.id ?? undefined
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log('error fetching results', error);
    return NextResponse.json(
      { error: 'Failed to fetch results.' },
      { status: 500 }
    );
  }
}
