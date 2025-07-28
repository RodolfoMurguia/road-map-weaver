import { User } from '@/types/roadmap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TaskFiltersProps {
  users: User[];
  selectedUserId?: string;
  selectedStatus?: 'all' | 'pending' | 'completed';
  onUserChange: (userId?: string) => void;
  onStatusChange: (status: 'all' | 'pending' | 'completed') => void;
  onClearFilters: () => void;
}

export const TaskFilters = ({
  users,
  selectedUserId,
  selectedStatus = 'all',
  onUserChange,
  onStatusChange,
  onClearFilters,
}: TaskFiltersProps) => {
  const hasActiveFilters = selectedUserId || selectedStatus !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
      </div>

      <Select value={selectedUserId || 'all'} onValueChange={(value) => onUserChange(value === 'all' ? undefined : value)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los usuarios" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los usuarios</SelectItem>
          {users.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="pending">Pendientes</SelectItem>
          <SelectItem value="completed">Completadas</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-1" />
          Limpiar filtros
        </Button>
      )}

      {hasActiveFilters && (
        <div className="flex gap-2">
          {selectedUserId && (
            <Badge variant="secondary">
              Usuario: {users.find(u => u.id === selectedUserId)?.name}
            </Badge>
          )}
          {selectedStatus !== 'all' && (
            <Badge variant="secondary">
              Estado: {selectedStatus === 'pending' ? 'Pendientes' : 'Completadas'}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};