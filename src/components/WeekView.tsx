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

      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <Card key={day.toISOString()} className={`p-3 min-h-[200px] ${isToday ? 'ring-2 ring-primary' : ''}`}>
              <div className="font-semibold text-sm mb-2 text-center">
                <div className={`${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                  {format(day, 'EEEE', { locale: es })}
                </div>
                <div className={`text-lg ${isToday ? 'text-primary font-bold' : ''}`}>
                  {format(day, 'd', { locale: es })}
                </div>
              </div>
              
              <div className="space-y-2">
                {dayTasks.map((task) => {
                  const user = getUserById(task.assignedUserId);
                  return (
                    <div
                      key={task.id}
                      className="p-2 bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => onEditTask(task)}
                    >
                      <div className={`text-xs font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </div>
                      {user && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {user.name}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};