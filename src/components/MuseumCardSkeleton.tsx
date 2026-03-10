import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MuseumCardSkeleton() {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-1 h-4 w-full" />
      </CardContent>
    </Card>
  );
}
