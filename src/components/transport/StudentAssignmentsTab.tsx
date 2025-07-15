import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Trash2, Users } from 'lucide-react';
import { useTransportRoutes } from '@/hooks/transport/useTransportRoutes';
import { useStudentTransportAssignments, StudentTransportAssignment } from '@/hooks/transport/useStudentTransportAssignments';
import { AssignStudentDialog } from './AssignStudentDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export const StudentAssignmentsTab = () => {
  const { routes } = useTransportRoutes();
  const { assignments, loading, removeAssignment, fetchAssignmentsByRoute } = useStudentTransportAssignments();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<StudentTransportAssignment | null>(null);

  const selectedRoute = routes.find(r => r.id.toString() === selectedRouteId);

  useEffect(() => {
    if (selectedRouteId) {
      fetchAssignmentsByRoute(parseInt(selectedRouteId));
    }
  }, [selectedRouteId, fetchAssignmentsByRoute]);

  const handleRemoveAssignment = (assignment: StudentTransportAssignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      const success = await removeAssignment(assignmentToDelete.id);
      if (success) {
        setIsDeleteOpen(false);
        setAssignmentToDelete(null);
        // Refresh the assignments for the selected route
        if (selectedRouteId) {
          fetchAssignmentsByRoute(parseInt(selectedRouteId));
        }
      }
    }
  };

  const columns = [
    {
      accessorKey: 'student_name' as keyof StudentTransportAssignment,
      header: 'Student Name',
    },
    {
      accessorKey: 'student_admission_number' as keyof StudentTransportAssignment,
      header: 'Admission Number',
    },
    {
      accessorKey: 'assignment_date' as keyof StudentTransportAssignment,
      header: 'Assignment Date',
      cell: ({ row }: { row: { getValue: (key: string) => any } }) => {
        const date = new Date(row.getValue('assignment_date'));
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: StudentTransportAssignment } }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRemoveAssignment(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Student Transport Assignments</h3>
          <p className="text-sm text-muted-foreground">
            Assign students to transport routes and manage their assignments
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-xs">
            <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a route to view assignments" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    {route.route_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedRouteId && (
            <Button 
              onClick={() => setIsAssignDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign Student
            </Button>
          )}
        </div>

        {selectedRoute && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">{selectedRoute.route_name}</h4>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Monthly Fee: KSH {selectedRoute.monthly_fee.toLocaleString()}</p>
              {selectedRoute.route_description && (
                <p>Description: {selectedRoute.route_description}</p>
              )}
              <p>Assigned Students: {assignments.length}</p>
            </div>
          </div>
        )}

        {selectedRouteId ? (
          <DataTable
            columns={columns}
            data={assignments}
            loading={loading}
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a route to view student assignments</p>
          </div>
        )}
      </div>

      <AssignStudentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        routeId={selectedRouteId ? parseInt(selectedRouteId) : undefined}
        onSuccess={() => {
          setIsAssignDialogOpen(false);
          if (selectedRouteId) {
            fetchAssignmentsByRoute(parseInt(selectedRouteId));
          }
        }}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Remove Student Assignment"
        description={`Are you sure you want to remove "${assignmentToDelete?.student_name}" from this transport route?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};