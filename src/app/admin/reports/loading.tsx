export default function ReportsLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-64 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Loading cards */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="h-16 bg-gray-50 flex items-center px-6">
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="p-6 space-y-12">
          {/* Dashboard overview skeleton */}
          <div className="space-y-6">
            <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 p-6 rounded-lg animate-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-8 w-16 bg-gray-400 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-100 p-6 rounded-lg animate-pulse">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    <div className="h-6 w-6 bg-gray-300 rounded"></div>
                  </div>
                  <div className="h-8 w-12 bg-gray-400 rounded mb-2"></div>
                  <div className="h-3 w-28 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional report sections skeleton */}
          {[...Array(5)].map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              
              {sectionIndex < 2 ? (
                // Stats cards skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-100 p-6 rounded-lg animate-pulse">
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-4 w-24 bg-gray-300 rounded"></div>
                        <div className="h-6 w-6 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-8 w-16 bg-gray-400 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                // Table skeleton
                <div className="bg-gray-100 rounded-lg overflow-hidden animate-pulse">
                  <div className="h-12 bg-gray-200"></div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 border-b border-gray-200 flex items-center px-6">
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-gray-300 rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-3 w-16 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
