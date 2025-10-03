import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface LoadingSkeletonProps {
  type?: 'list' | 'detail' | 'form' | 'grid'
  count?: number
  title?: string
}

export function LoadingSkeleton({ type = 'list', count = 6, title }: LoadingSkeletonProps) {
  const renderListSkeleton = () => (
    <div className="space-y-6">
      {title && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <div className="h-4 bg-gray-200 rounded w-1/4 mt-2 animate-pulse"></div>
        </div>
      )}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderDetailSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      {title && (
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mt-2 animate-pulse"></div>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderFormSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      {title && (
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
          <div className="flex gap-4 pt-4">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderGridSkeleton = () => (
    <div className="space-y-6">
      {title && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  switch (type) {
    case 'detail':
      return renderDetailSkeleton()
    case 'form':
      return renderFormSkeleton()
    case 'grid':
      return renderGridSkeleton()
    case 'list':
    default:
      return renderListSkeleton()
  }
}
