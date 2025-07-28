import { ViewMode } from '@/types/roadmap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, List, Calendar, Grid3X3, LayoutGrid } from 'lucide-react';

interface RoadmapHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewTask: () => void;
  totalTasks: number;
  completedTasks: number;
}

export const RoadmapHeader = ({
  viewMode,
  onViewModeChange,
  onNewTask,
  totalTasks,
  completedTasks,
}: RoadmapHeaderProps) => {
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Roadmap Interactivo</h1>
          <p className="text-primary-foreground/80 mb-4">
            Gestiona tus tareas y planifica tu año 2025
          </p>
          <div className="flex gap-3">
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground">
              {totalTasks} tareas totales
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-primary-foreground">
              {completedTasks} completadas ({completionPercentage}%)
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button onClick={onNewTask} className="bg-accent hover:bg-accent-light text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>

          <div className="flex gap-1 bg-white/10 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={viewMode === 'list' ? 'bg-white text-primary' : 'text-primary-foreground hover:bg-white/20'}
            >
              <List className="w-4 h-4 mr-1" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'calendar-week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('calendar-week')}
              className={viewMode === 'calendar-week' ? 'bg-white text-primary' : 'text-primary-foreground hover:bg-white/20'}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Semana
            </Button>
            <Button
              variant={viewMode === 'calendar-month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('calendar-month')}
              className={viewMode === 'calendar-month' ? 'bg-white text-primary' : 'text-primary-foreground hover:bg-white/20'}
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Mes
            </Button>
            <Button
              variant={viewMode === 'calendar-quarter' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('calendar-quarter')}
              className={viewMode === 'calendar-quarter' ? 'bg-white text-primary' : 'text-primary-foreground hover:bg-white/20'}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Trimestre
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};