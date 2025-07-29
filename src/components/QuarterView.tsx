import { useState } from 'react';
import { Task, User } from '@/types/roadmap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, startOfMonth, endOfMonth, isSameMonth, isWithinInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface QuarterViewProps {
  tasks: Task[];
  users: User[];
  getUserById: (userId: string) => User | undefined;
  onEditTask: (task: Task) => void;
}

export const QuarterView = ({ tasks, users, getUserById, onEditTask }: QuarterViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  const months = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

  const goToPreviousQuarter = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1));
  };

  const goToNextQuarter = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 3, 1));
  };

  const getTaskPosition = (task: Task) => {
    const taskStart = task.startDate > quarterStart ? task.startDate : quarterStart;
    const taskEnd = task.endDate < quarterEnd ? task.endDate : quarterEnd;
    
    const quarterDuration = (quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskStartOffset = (taskStart.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    return {
      left: Math.max(0, (taskStartOffset / quarterDuration) * 100),
      width: Math.min(100, (taskDuration / quarterDuration) * 100)
    };
  };

  const getQuarterNumber = (date: Date) => {
    return Math.floor(date.getMonth() / 3) + 1;
  };

  // Filtrar tareas del trimestre
  const quarterTasks = tasks.filter(task => 
    isWithinInterval(task.startDate, { start: quarterStart, end: quarterEnd }) ||
    isWithinInterval(task.endDate, { start: quarterStart, end: quarterEnd }) ||
    (task.startDate <= quarterStart && task.endDate >= quarterEnd)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Q{getQuarterNumber(currentDate)} {format(currentDate, 'yyyy')} - {format(quarterStart, 'MMM', { locale: es })} a {format(quarterEnd, 'MMM', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousQuarter}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextQuarter}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Header del trimestre */}
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-xl font-semibold">
              Timeline del Trimestre
            </h3>
            <div className="text-sm text-muted-foreground">
              {quarterTasks.length} {quarterTasks.length === 1 ? 'tarea' : 'tareas'}
            </div>
          </div>

          {/* Timeline del trimestre */}
          <div className="space-y-3 min-h-[300px]">
            {quarterTasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                No hay tareas en este trimestre
              </div>
            ) : (
              quarterTasks.map((task) => {
                const user = getUserById(task.assignedUserId);
                const { left, width } = getTaskPosition(task);
                
                return (
                  <div key={task.id} className="relative h-16">
                    <div
                      className={`absolute h-12 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:z-10 ${
                        task.completed 
                          ? 'bg-muted border-2 border-muted-foreground/20' 
                          : 'bg-primary/15 border-2 border-primary/30 hover:bg-primary/25'
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${Math.max(width, 5)}%`, // Mínimo 5% de ancho para que sea visible
                      }}
                      onClick={() => onEditTask(task)}
                    >
                      <div className="p-3 h-full flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium truncate ${
                            task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}>
                            {task.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(task.startDate, 'd MMM', { locale: es })} - {format(task.endDate, 'd MMM', { locale: es })}
                          </div>
                        </div>
                        {user && width > 10 && (
                          <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                            {user.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Línea de tiempo del trimestre (meses) */}
          <div className="relative">
            <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
              {months.map((month) => (
                <span key={month.toISOString()}>
                  {format(month, 'MMM', { locale: es })}
                </span>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-full h-px bg-border"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};