import {
  PropertyCardSkeleton,
  DashboardCardSkeleton,
  TableSkeleton,
} from "./SkeletonLoader";

export function PropertyGridLoader({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DashboardGridLoader({ count = 3 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <DashboardCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function AdminTableLoader() {
  return <TableSkeleton rows={6} />;
}