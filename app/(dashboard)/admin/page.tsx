import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/lib/admin';
import { auth } from '@/lib/auth';

// The admin page of the Premier League game. Only the admin gets in.
export default async function AdminPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) redirect('/');

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-4 md:gap-5 md:pt-4">
      <header className="px-1">
        <h1 className="text-[1.625rem] font-extrabold leading-[1.875rem] md:text-[2.125rem] md:leading-10">
          Admin
        </h1>
        <p className="mt-0.5 text-[0.8125rem] font-semibold leading-[1.125rem] text-muted-foreground md:text-[0.9375rem] md:leading-5">
          Premier League game
        </p>
      </header>
    </div>
  );
}
