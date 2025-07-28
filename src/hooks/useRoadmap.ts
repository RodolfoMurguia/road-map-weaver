import { useState, useEffect } from 'react';
import { Task, User, RoadmapData, Subtask } from '@/types/roadmap';

const DEFAULT_USERS: User[] = [
  { id: '1', name: 'Ana García', email: 'ana@empresa.com' },
  { id: '2', name: 'Carlos López', email: 'carlos@empresa.com' },
  { id: '3', name: 'María Rodríguez', email: 'maria@empresa.com' },
  { id: '4', name: 'Juan Pérez', email: 'juan@empresa.com' },
  { id: '5', name: 'Laura Martín', email: 'laura@empresa.com' },
];

const STORAGE_KEY = 'roadmap-data';

export const useRoadmap = () => {
  const [data, setData] = useState<RoadmapData>({
    tasks: [],
    users: DEFAULT_USERS,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert string dates back to Date objects
        const tasks = parsed.tasks.map((task: any) => ({
          ...task,
          startDate: new Date(task.startDate),
          endDate: new Date(task.endDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          subtasks: task.subtasks.map((subtask: any) => ({
            ...subtask,
            createdAt: new Date(subtask.createdAt),
          })),
        }));
        setData({ ...parsed, tasks });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      subtasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask].sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
    }));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    }));
  };

  const deleteTask = (taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId),
    }));
  };

  const addSubtask = (taskId: string, title: string) => {
    const newSubtask: Subtask = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
    };

    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [...task.subtasks, newSubtask],
              updatedAt: new Date(),
            }
          : task
      ),
    }));
  };

  const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
              ),
              updatedAt: new Date(),
            }
          : task
      ),
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
              updatedAt: new Date(),
            }
          : task
      ),
    }));
  };

  const getUserById = (userId: string) => {
    return data.users.find(user => user.id === userId);
  };

  return {
    tasks: data.tasks,
    users: data.users,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    getUserById,
  };
};