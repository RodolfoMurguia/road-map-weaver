import { useState } from 'react';
import { ViewMode, Task } from '@/types/roadmap';
import { useRoadmap } from '@/hooks/useRoadmap';
import { RoadmapHeader } from '@/components/RoadmapHeader';
import { TaskFilters } from '@/components/TaskFilters';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskDetailsDialog } from '@/components/TaskDetailsDialog';
import { WeekView } from '@/components/WeekView';
import { MonthView } from '@/components/MonthView';
import { QuarterView } from '@/components/QuarterView';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const {
    tasks,
    users,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    getUserById,
  } = useRoadmap();

  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    if (selectedUserId && task.assignedUserId !== selectedUserId) {
      return false;
    }
    if (selectedStatus === 'pending' && task.completed) {
      return false;
    }
    if (selectedStatus === 'completed' && !task.completed) {
      return false;
    }
    return true;
  });

  const completedTasks = tasks.filter(task => task.completed).length;

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsTaskFormOpen(true);
  };

  const handleViewTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailsOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
    setIsTaskDetailsOpen(false); // Cerrar detalles si está abierto
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast({
        title: "Tarea actualizada",
        description: "La tarea se ha actualizado correctamente.",
      });
    } else {
      addTask(taskData);
      toast({
        title: "Tarea creada",
        description: "La nueva tarea se ha creado correctamente.",
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Tarea eliminada",
      description: "La tarea se ha eliminado correctamente.",
    });
  };

  const handleToggleTaskComplete = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed });
    toast({
      title: completed ? "Tarea completada" : "Tarea marcada como pendiente",
      description: `La tarea se ha marcado como ${completed ? 'completada' : 'pendiente'}.`,
    });
  };

  const handleAddSubtask = (taskId: string, title: string) => {
    addSubtask(taskId, title);
    toast({
      title: "Subtarea agregada",
      description: "La subtarea se ha agregado correctamente.",
    });
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, completed: boolean) => {
    updateSubtask(taskId, subtaskId, { completed });
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta subtarea?')) {
      deleteSubtask(taskId, subtaskId);
      toast({
        title: "Subtarea eliminada",
        description: "La subtarea se ha eliminado correctamente.",
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedUserId(undefined);
    setSelectedStatus('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <RoadmapHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNewTask={handleNewTask}
          totalTasks={tasks.length}
          completedTasks={completedTasks}
        />

        <TaskFilters
          users={users}
          selectedUserId={selectedUserId}
          selectedStatus={selectedStatus}
          onUserChange={setSelectedUserId}
          onStatusChange={setSelectedStatus}
          onClearFilters={handleClearFilters}
        />

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  {tasks.length === 0 
                    ? 'No hay tareas creadas aún' 
                    : 'No se encontraron tareas con los filtros aplicados'
                  }
                </p>
                {tasks.length === 0 && (
                  <p className="text-muted-foreground">
                    Comienza creando tu primera tarea para planificar tu roadmap.
                  </p>
                )}
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  user={getUserById(task.assignedUserId)}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleTaskComplete}
                  onAddSubtask={handleAddSubtask}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteSubtask={handleDeleteSubtask}
                />
              ))
            )}
          </div>
        )}

        {viewMode === 'calendar-week' && (
          <WeekView
            tasks={filteredTasks}
            users={users}
            getUserById={getUserById}
            onEditTask={handleViewTaskDetails}
          />
        )}

        {viewMode === 'calendar-month' && (
          <MonthView
            tasks={filteredTasks}
            users={users}
            getUserById={getUserById}
            onEditTask={handleViewTaskDetails}
          />
        )}

        {viewMode === 'calendar-quarter' && (
          <QuarterView
            tasks={filteredTasks}
            users={users}
            getUserById={getUserById}
            onEditTask={handleViewTaskDetails}
          />
        )}

        <TaskDetailsDialog
          task={selectedTask}
          user={selectedTask ? getUserById(selectedTask.assignedUserId) : undefined}
          isOpen={isTaskDetailsOpen}
          onClose={() => setIsTaskDetailsOpen(false)}
          onEdit={handleEditTask}
          onDelete={(taskId) => {
            handleDeleteTask(taskId);
            setIsTaskDetailsOpen(false);
          }}
          onToggleComplete={handleToggleTaskComplete}
          onToggleSubtask={handleToggleSubtask}
        />

        <TaskForm
          task={editingTask}
          users={users}
          isOpen={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSave={handleSaveTask}
        />
      </div>
    </div>
  );
};

export default Index;