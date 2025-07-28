import { useState } from 'react';
import { Task, User } from '@/types/roadmap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar, User as UserIcon, Clock, Edit, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  user?: User;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string, completed: boolean) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskCard = ({
  task,
  user,
  onEdit,
  onDelete,
  onToggleComplete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskCardProps) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showAddSubtask, setShowAddSubtask] = useState(false);

  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const isOverdue = new Date() > task.endDate && !task.completed;
  const isUpcoming = task.startDate > new Date();

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setShowAddSubtask(false);
    }
  };

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-[var(--shadow-card)] ${
      task.completed ? 'bg-success-light border-success' : 
      isOverdue ? 'bg-warning-light border-warning' : 
      'bg-card border-border hover:border-primary'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => onToggleComplete(task.id, !!checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-muted-foreground text-sm mt-1">{task.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className="text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          {format(task.startDate, 'dd MMM', { locale: es })} - {format(task.endDate, 'dd MMM yyyy', { locale: es })}
        </Badge>
        
        {user && (
          <Badge variant="secondary" className="text-xs">
            <UserIcon className="w-3 h-3 mr-1" />
            {user.name}
          </Badge>
        )}

        {isOverdue && (
          <Badge variant="destructive" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Vencida
          </Badge>
        )}

        {isUpcoming && (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Próxima
          </Badge>
        )}
      </div>

      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Subtareas: {completedSubtasks}/{totalSubtasks}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="text-muted-foreground"
          >
            {showSubtasks ? (
              <ChevronDown className="w-4 h-4 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1" />
            )}
            {totalSubtasks > 0 ? `${totalSubtasks} subtareas` : 'Subtareas'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddSubtask(!showAddSubtask)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {showAddSubtask && (
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Nueva subtarea..."
              className="flex-1 px-3 py-1 text-sm border rounded bg-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
            />
            <Button size="sm" onClick={handleAddSubtask}>
              Agregar
            </Button>
          </div>
        )}

        {showSubtasks && (
          <div className="space-y-2">
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center justify-between py-1 px-2 bg-muted rounded">
                <div className="flex items-center gap-2 flex-1">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={(checked) => onToggleSubtask(task.id, subtask.id, !!checked)}
                  />
                  <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};