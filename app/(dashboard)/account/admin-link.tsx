import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

// Shown to the admin only. The Account page decides who sees it.
export function AdminLink() {
  return (
    <Card>
      <CardHeader className="space-y-1 p-5 pb-3 md:p-7 md:pb-3">
        <CardTitle>Admin</CardTitle>
        <CardDescription>Run the Premier League game.</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 md:p-7 md:pt-0">
        <Button asChild variant="outline">
          <Link href="/admin">Open the Admin page</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
