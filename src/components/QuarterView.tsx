import { useState } from 'react';
import { Task, User } from '@/types/roadmap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval, startOfMonth, endOfMonth, isSameMonth, isWithinInterval, isSameDay, eachWeekOfInterval, startOfWeek, addDays } from 'date-fns';
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

  // Generar marcadores de tiempo para el trimestre
  const generateTimeMarkers = () => {
    const markers = [];
    const totalDays = (quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);
    
    // Añadir marcadores cada 15 días aproximadamente
    for (let i = 0; i <= totalDays; i += 15) {
      const markerDate = addDays(quarterStart, i);
      if (markerDate <= quarterEnd) {
        const position = (i / totalDays) * 100;
        markers.push({
          date: markerDate,
          position: Math.min(position, 100),
          isMonth: markerDate.getDate() === 1
        });
      }
    }
    
    return markers;
  };

  const timeMarkers = generateTimeMarkers();

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
          <div className="relative">
            {/* Marcadores de tiempo */}
            <div className="relative mb-2 h-6">
              {timeMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${marker.position}%` }}
                >
                  <div className={`w-px ${marker.isMonth ? 'h-4 bg-border' : 'h-2 bg-border/50'}`}></div>
                  <span className={`text-xs text-muted-foreground mt-1 ${marker.isMonth ? 'font-medium' : ''}`}>
                    {format(marker.date, marker.isMonth ? 'MMM' : 'd', { locale: es })}
                  </span>
                </div>
              ))}
            </div>

            {/* Tareas */}
            <div className="space-y-2 min-h-[250px] mt-6">
              {quarterTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  No hay tareas en este trimestre
                </div>
              ) : (
                quarterTasks.map((task) => {
                  const { left, width } = getTaskPosition(task);
                  
                  return (
                    <div key={task.id} className="relative h-10">
                      <div
                        className={`absolute h-8 rounded-md cursor-pointer transition-all duration-200 hover:h-9 hover:-translate-y-0.5 hover:z-10 shadow-sm ${
                          task.completed 
                            ? 'bg-muted border border-muted-foreground/20' 
                            : 'bg-primary/20 border border-primary/40 hover:bg-primary/30'
                        }`}
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 3)}%`, // Mínimo 3% de ancho
                        }}
                        onClick={() => onEditTask(task)}
                      >
                        <div className="px-2 h-full flex items-center">
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium truncate ${
                              task.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}>
                              {task.title}
                            </div>
                            {width > 15 && (
                              <div className="text-xs text-muted-foreground/80">
                                {format(task.startDate, 'd/M', { locale: es })} - {format(task.endDate, 'd/M', { locale: es })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Línea base de tiempo */}
            <div className="absolute top-5 left-0 w-full h-px bg-border/30"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};