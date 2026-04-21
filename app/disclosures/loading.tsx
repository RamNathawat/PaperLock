export default function DisclosuresLoading() {
  return (
    <div className="min-h-screen flex bg-[#f7f9fb] font-[Inter,sans-serif]">
      {/* Sidebar skeleton */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col py-8 px-4 z-40">
        <div className="px-2 mb-10">
          <div className="h-2.5 w-16 bg-gray-100 rounded mb-2 animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
        <nav className="flex-1 space-y-1">
          <div className="h-9 w-full bg-gray-50 rounded-lg animate-pulse" />
          <div className="h-9 w-full bg-blue-50 rounded-lg animate-pulse" />
        </nav>
        <div className="space-y-2 mt-4">
          <div className="h-10 w-full bg-blue-100 rounded-lg animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </aside>

      {/* Main skeleton */}
      <main className="ml-60 flex-1 px-10 py-10">
        <div className="mb-10">
          <div className="h-2.5 w-32 bg-gray-100 rounded mb-2 animate-pulse" />
          <div className="h-8 w-44 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Search bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-9 w-80 bg-white border border-gray-200 rounded-lg animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Table skeleton */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
            {[4, 2, 3, 2, 1].map((span, i) => (
              <div key={i} className={`col-span-${span} h-2 bg-gray-100 rounded animate-pulse`} />
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 items-center">
              <div className="col-span-4 space-y-1.5">
                <div className="h-3.5 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="col-span-2">
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="col-span-3 space-y-1">
                <div className="h-2 w-8 bg-gray-100 rounded animate-pulse" />
                <div className="h-1.5 w-full bg-gray-100 rounded-full animate-pulse" />
              </div>
              <div className="col-span-2">
                <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="col-span-1 flex gap-2">
                <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
