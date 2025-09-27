export async function GET() {
  try {
    const apiRes = await fetch(
      'https://fantasy.premierleague.com/api/bootstrap-static/'
    );

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
