import { useState } from 'react';
import { Task, User } from '@/types/roadmap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthViewProps {
  tasks: Task[];
  users: User[];
  getUserById: (userId: string) => User | undefined;
  onEditTask: (task: Task) => void;
}

export const MonthView = ({ tasks, users, getUserById, onEditTask }: MonthViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: es });
  const calendarEnd = endOfWeek(monthEnd, { locale: es });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      return isWithinInterval(day, { start: task.startDate, end: task.endDate }) ||
             isSameDay(day, task.startDate) ||
             isSameDay(day, task.endDate);
    });
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getTaskPosition = (task: Task, weekStart: Date) => {
    const dayWidth = 100 / 7; // cada día ocupa 1/7 del ancho
    const taskStartInWeek = task.startDate < weekStart ? weekStart : task.startDate;
    const taskEndInWeek = task.endDate;
    
    const startDayIndex = Math.floor((taskStartInWeek.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((taskEndInWeek.getTime() - taskStartInWeek.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      left: Math.max(0, startDayIndex) * dayWidth,
      width: Math.min(duration * dayWidth, (7 - Math.max(0, startDayIndex)) * dayWidth)
    };
  };

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Header con días de la semana */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
        {weekDays.map((dayName) => (
          <div key={dayName} className="bg-card p-2 text-center font-semibold text-sm text-muted-foreground">
            {dayName}
          </div>
        ))}
      </div>

      {/* Semanas del mes */}
      <div className="space-y-px bg-border rounded-b-lg overflow-hidden">
        {weeks.map((week, weekIndex) => {
          const weekStart = week[0];
          const weekTasks = tasks.filter(task => 
            week.some(day => 
              isWithinInterval(day, { start: task.startDate, end: task.endDate }) ||
              isSameDay(day, task.startDate) ||
              isSameDay(day, task.endDate)
            )
          );

          return (
            <div key={weekIndex} className="bg-card">
              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-px">
                {week.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`p-2 h-20 bg-background border-r border-b border-border/50 ${
                        isToday ? 'bg-primary/5' : ''
                      } ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        isToday ? 'text-primary font-bold' : 
                        !isCurrentMonth ? 'text-muted-foreground' : ''
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Tareas de la semana */}
              <div className="relative px-0 pb-2 min-h-[60px]">
                {weekTasks.map((task, taskIndex) => {
                  const user = getUserById(task.assignedUserId);
                  const { left, width } = getTaskPosition(task, weekStart);
                  
                  return (
                    <div
                      key={task.id}
                      className={`absolute h-6 rounded cursor-pointer transition-all duration-200 hover:z-10 ${
                        task.completed 
                          ? 'bg-muted border border-muted-foreground/20' 
                          : 'bg-primary/20 border border-primary/40 hover:bg-primary/30'
                      }`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        top: `${taskIndex * 28 + 4}px`
                      }}
                      onClick={() => onEditTask(task)}
                    >
                      <div className="px-2 py-1 h-full flex items-center justify-between">
                        <span className={`text-xs font-medium truncate flex-1 ${
                          task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}>
                          {task.title}
                        </span>
                        {user && width > 15 && (
                          <span className="text-xs text-muted-foreground ml-1 shrink-0">
                            {user.name.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};