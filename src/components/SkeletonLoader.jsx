import { motion } from "framer-motion";

export function SkeletonBox({ className = "" }) {
  return (
    <motion.div
      animate={{ opacity: [0.45, 1, 0.45] }}
      transition={{
        duration: 1.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`rounded-2xl bg-slate-200 ${className}`}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <SkeletonBox className="h-56 w-full rounded-none" />

      <div className="space-y-4 p-5">
        <SkeletonBox className="h-5 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-11 w-full" />
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <SkeletonBox className="h-4 w-1/2" />
      <SkeletonBox className="mt-5 h-9 w-24" />
      <SkeletonBox className="mt-4 h-3 w-3/4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <SkeletonBox className="h-6 w-48" />
      </div>

      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 p-5">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-3/4" />
            <SkeletonBox className="h-4 w-2/3" />
            <SkeletonBox className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <SkeletonBox className="h-10 w-72" />
      <SkeletonBox className="mt-3 h-4 w-96 max-w-full" />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    </div>
  );
}