import { Resend } from 'resend';
import { WC_ROUND_DEADLINES } from '@/lib/wc-constants';

export async function POST(request: Request) {
  // Registration closes at the Round 1 deadline
  if (new Date() >= WC_ROUND_DEADLINES[1]) {
    return Response.json(
      { error: 'Registration is closed — the game has already started.' },
      { status: 403 }
    );
  }

  const adminEmail = process.env.NEXT_PUBLIC_MY_EMAIL_ADDRESS;
  if (!adminEmail) {
    console.error('NEXT_PUBLIC_MY_EMAIL_ADDRESS is not configured');
    return Response.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return Response.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const resend = new Resend(process.env.AUTH_RESEND_KEY);

    await resend.emails.send({
      from: 'Last Player Standing <noreply@lmsiq.co.uk>',
      to: [adminEmail],
      subject: `WC LPS: join request from ${email}`,
      html: `
        <h2>New join request</h2>
        <p><strong>${email}</strong> has requested to join the World Cup 2026 Last Player Standing game.</p>
        <p>Add them to the DB and league, then let them know they can log in and submit predictions.</p>
      `
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error sending register-interest email:', error);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
