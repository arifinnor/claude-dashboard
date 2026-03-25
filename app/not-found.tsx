import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Link href="/">
          <Button>
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
