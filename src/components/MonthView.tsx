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

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((dayName) => (
          <div key={dayName} className="p-2 text-center font-semibold text-sm text-muted-foreground">
            {dayName}
          </div>
        ))}
        
        {calendarDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentDate);
          
          return (
            <Card 
              key={day.toISOString()} 
              className={`p-1 min-h-[100px] ${
                isToday ? 'ring-2 ring-primary' : ''
              } ${
                !isCurrentMonth ? 'opacity-50' : ''
              }`}
            >
              <div className={`text-sm text-center mb-1 ${
                isToday ? 'text-primary font-bold' : 
                !isCurrentMonth ? 'text-muted-foreground' : ''
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => {
                  const user = getUserById(task.assignedUserId);
                  return (
                    <div
                      key={task.id}
                      className="p-1 bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors text-xs"
                      onClick={() => onEditTask(task)}
                    >
                      <div className={`font-medium truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </div>
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayTasks.length - 3} más
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};