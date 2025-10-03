import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trophy, BarChart3, Users, Calendar } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'games' | 'stats' | 'players' | 'teams' | 'calendar'
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  showAction?: boolean
}

export function EmptyState({
  icon = 'games',
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
}: EmptyStateProps) {
  const getIcon = () => {
    const iconClass = 'h-12 w-12 text-muted-foreground mx-auto mb-4'

    switch (icon) {
      case 'games':
        return <Trophy className={iconClass} />
      case 'stats':
        return <BarChart3 className={iconClass} />
      case 'players':
        return <Users className={iconClass} />
      case 'teams':
        return <Users className={iconClass} />
      case 'calendar':
        return <Calendar className={iconClass} />
      default:
        return <Trophy className={iconClass} />
    }
  }

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          {getIcon()}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{description}</p>
          </div>
          {showAction && actionLabel && onAction && (
            <Button onClick={onAction} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
