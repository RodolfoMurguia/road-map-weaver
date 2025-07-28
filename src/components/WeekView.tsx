import { useState } from 'react';
import { Task, User } from '@/types/roadmap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeekViewProps {
  tasks: Task[];
  users: User[];
  getUserById: (userId: string) => User | undefined;
  onEditTask: (task: Task) => void;
}

export const WeekView = ({ tasks, users, getUserById, onEditTask }: WeekViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const weekStart = startOfWeek(currentDate, { locale: es });
  const weekEnd = endOfWeek(currentDate, { locale: es });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      return isWithinInterval(day, { start: task.startDate, end: task.endDate }) ||
             isSameDay(day, task.startDate) ||
             isSameDay(day, task.endDate);
    });
  };

  const getTaskBar = (task: Task) => {
    const taskStart = task.startDate > weekStart ? task.startDate : weekStart;
    const taskEnd = task.endDate < weekEnd ? task.endDate : weekEnd;
    
    const startDay = weekDays.findIndex(day => isSameDay(day, taskStart) || day >= taskStart);
    const endDay = weekDays.findIndex(day => isSameDay(day, taskEnd) || day >= taskEnd);
    
    const actualStartDay = Math.max(0, startDay === -1 ? 0 : startDay);
    const actualEndDay = Math.min(6, endDay === -1 ? 6 : endDay);
    
    const span = actualEndDay - actualStartDay + 1;
    const leftOffset = (actualStartDay / 7) * 100;
    const width = (span / 7) * 100;
    
    return { leftOffset, width, span };
  };

  const weekTasks = tasks.filter(task => 
    isWithinInterval(task.startDate, { start: weekStart, end: weekEnd }) ||
    isWithinInterval(task.endDate, { start: weekStart, end: weekEnd }) ||
    (task.startDate <= weekStart && task.endDate >= weekEnd)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Semana del {format(weekStart, 'd MMM', { locale: es })} al {format(weekEnd, 'd MMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Header con días */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="bg-card p-3 text-center">
              <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'EEEE', { locale: es })}
              </div>
              <div className={`text-lg font-bold ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd', { locale: es })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline de tareas */}
      <div className="space-y-2 min-h-[300px]">
        {weekTasks.map((task) => {
          const user = getUserById(task.assignedUserId);
          const { leftOffset, width } = getTaskBar(task);
          
          return (
            <div key={task.id} className="relative h-12">
              <div
                className={`absolute h-10 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:z-10 ${
                  task.completed 
                    ? 'bg-muted border-2 border-muted-foreground/20' 
                    : 'bg-primary/15 border-2 border-primary/30 hover:bg-primary/25'
                }`}
                style={{
                  left: `${leftOffset}%`,
                  width: `${width}%`,
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
                  </div>
                  {user && (
                    <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                      {user.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {weekTasks.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No hay tareas en esta semana
          </div>
        )}
      </div>
    </div>
  );
};