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

  const getTaskPosition = (task: Task, monthStart: Date, monthEnd: Date) => {
    const taskStart = task.startDate > monthStart ? task.startDate : monthStart;
    const taskEnd = task.endDate < monthEnd ? task.endDate : monthEnd;
    
    const monthDuration = (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskStartOffset = (taskStart.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    return {
      left: Math.max(0, (taskStartOffset / monthDuration) * 100),
      width: Math.min(100, (taskDuration / monthDuration) * 100)
    };
  };

  const getQuarterNumber = (date: Date) => {
    return Math.floor(date.getMonth() / 3) + 1;
  };

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

      <div className="space-y-6">
        {months.map((month) => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          const monthTasks = tasks.filter(task => 
            isWithinInterval(task.startDate, { start: monthStart, end: monthEnd }) ||
            isWithinInterval(task.endDate, { start: monthStart, end: monthEnd }) ||
            (task.startDate <= monthStart && task.endDate >= monthEnd)
          );

          const isCurrentMonth = isSameMonth(month, new Date());

          return (
            <Card key={month.toISOString()} className={`p-6 ${isCurrentMonth ? 'ring-2 ring-primary' : ''}`}>
              <div className="space-y-4">
                {/* Header del mes */}
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className={`text-xl font-semibold ${isCurrentMonth ? 'text-primary' : ''}`}>
                    {format(month, 'MMMM yyyy', { locale: es })}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {monthTasks.length} {monthTasks.length === 1 ? 'tarea' : 'tareas'}
                  </div>
                </div>

                {/* Timeline del mes */}
                <div className="space-y-3 min-h-[120px]">
                  {monthTasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No hay tareas en este mes
                    </div>
                  ) : (
                    monthTasks.map((task, taskIndex) => {
                      const user = getUserById(task.assignedUserId);
                      const { left, width } = getTaskPosition(task, monthStart, monthEnd);
                      
                      return (
                        <div key={task.id} className="relative h-12">
                          <div
                            className={`absolute h-10 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:z-10 ${
                              task.completed 
                                ? 'bg-muted border-2 border-muted-foreground/20' 
                                : 'bg-primary/15 border-2 border-primary/30 hover:bg-primary/25'
                            }`}
                            style={{
                              left: `${left}%`,
                              width: `${Math.max(width, 8)}%`, // Mínimo 8% de ancho para que sea visible
                            }}
                            onClick={() => onEditTask(task)}
                          >
                            <div className="p-2 h-full flex items-center justify-between">
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
                              {user && width > 15 && (
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

                {/* Línea de tiempo (días del mes) */}
                <div className="relative">
                  <div className="flex justify-between text-xs text-muted-foreground border-t pt-2">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                    <span>{format(monthEnd, 'd')}</span>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-px bg-border"></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};