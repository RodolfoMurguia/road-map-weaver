import { Task, User } from '@/types/roadmap';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, User as UserIcon, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';

interface TaskDetailsDialogProps {
  task: Task | null;
  user: User | undefined;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
}

export const TaskDetailsDialog = ({
  task,
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onToggleSubtask
}: TaskDetailsDialogProps) => {
  if (!task) return null;

  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.completed ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Clock className="w-5 h-5 text-orange-500" />
            )}
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y fechas */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant={task.completed ? 'default' : 'secondary'}>
              {task.completed ? 'Completada' : 'En progreso'}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(task.startDate, 'd MMM yyyy', { locale: es })} - {format(task.endDate, 'd MMM yyyy', { locale: es })}
            </div>
            {user && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <UserIcon className="w-4 h-4" />
                {user.name}
              </div>
            )}
          </div>

          {/* Descripción */}
          {task.description && (
            <div>
              <h4 className="font-medium mb-2">Descripción</h4>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          )}

          {/* Subtareas */}
          {task.subtasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Subtareas</h4>
                <span className="text-sm text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} completadas ({Math.round(progress)}%)
                </span>
              </div>
              
              <div className="space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 p-2 rounded-md border">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={(checked) => onToggleSubtask(task.id, subtask.id, checked as boolean)}
                    />
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(subtask.createdAt, 'd MMM', { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button onClick={() => onEdit(task)} size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => onToggleComplete(task.id, !task.completed)}
                size="sm"
              >
                {task.completed ? 'Marcar pendiente' : 'Marcar completa'}
              </Button>
            </div>
            <Button
              variant="destructive"
              onClick={() => onDelete(task.id)}
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};