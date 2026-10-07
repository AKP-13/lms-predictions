import { FPL_BOOTSTRAP_URL } from '@/lib/constants';

export async function GET() {
  try {
    const apiRes = await fetch(FPL_BOOTSTRAP_URL);

    if (!apiRes.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch FPL data' }),
        { status: apiRes.status }
      );
    }
    const data = await apiRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500
    });
  }
}
