import Skeleton from "@/components/Skeleton";

export default function ShopLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12">
      <Skeleton className="h-9 w-32" />
      <Skeleton className="mt-3 h-4 w-20" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-3 h-8 w-full" />
            </div>
          ))}
        </aside>

        <div>
          <div className="mb-6 flex justify-end">
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-frost">
                <Skeleton className="aspect-square w-full" />
                <div className="px-3 py-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
