import { useState, useEffect } from 'react';
import { Task, User, RoadmapData, Subtask } from '@/types/roadmap';
import { supabase } from '@/integrations/supabase/client';

export const useRoadmap = () => {
  const [data, setData] = useState<RoadmapData>({
    tasks: [],
    users: [],
  });
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const { data: users, error: usersError } = await (supabase as any)
        .from('users')
        .select('*')
        .order('name');
      
      if (usersError) throw usersError;

      // Load tasks with subtasks
      const { data: tasks, error: tasksError } = await (supabase as any)
        .from('tasks')
        .select(`
          *,
          subtasks (*)
        `)
        .order('start_date');
      
      if (tasksError) throw tasksError;

      // Convert database format to frontend format
      const formattedTasks = tasks?.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        startDate: new Date(task.start_date),
        endDate: new Date(task.end_date),
        assignedUserId: task.assigned_user_id,
        completed: task.completed,
        color: task.color,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        subtasks: task.subtasks.map((subtask: any) => ({
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed,
          createdAt: new Date(subtask.created_at),
        })),
      })) || [];

      setData({
        tasks: formattedTasks,
        users: users || [],
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
    try {
      const { data: newTask, error } = await (supabase as any)
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          start_date: taskData.startDate.toISOString(),
          end_date: taskData.endDate.toISOString(),
          assigned_user_id: taskData.assignedUserId,
          completed: taskData.completed,
          color: taskData.color,
        })
        .select()
        .single();

      if (error) throw error;

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString();
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString();
      if (updates.assignedUserId !== undefined) updateData.assigned_user_id = updates.assignedUserId;
      if (updates.completed !== undefined) updateData.completed = updates.completed;
      if (updates.color !== undefined) updateData.color = updates.color;

      const { error } = await (supabase as any)
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const addSubtask = async (taskId: string, title: string) => {
    try {
      const { error } = await (supabase as any)
        .from('subtasks')
        .insert({
          task_id: taskId,
          title,
          completed: false,
        });

      if (error) throw error;

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  };

  const updateSubtask = async (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.completed !== undefined) updateData.completed = updates.completed;

      const { error } = await (supabase as any)
        .from('subtasks')
        .update(updateData)
        .eq('id', subtaskId);

      if (error) throw error;

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  };

  const getUserById = (userId: string) => {
    return data.users.find(user => user.id === userId);
  };

  return {
    tasks: data.tasks,
    users: data.users,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    getUserById,
  };
};