
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, MoreHorizontal } from 'lucide-react';
import { useFeeStructures } from '@/hooks/useFeeStructures';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateFeeStructureDialog from './fee-management/CreateFeeStructureDialog';
import AssignFeeStructureDialog from './fee-management/AssignFeeStructureDialog';
import { FeeStructure } from '@/types/finance';

const FeeManagementModule = () => {
    const { data: feeStructures, isLoading, error } = useFeeStructures();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);

    const handleOpenAssignDialog = (structure: FeeStructure) => {
        setSelectedFeeStructure(structure);
        setIsAssignDialogOpen(true);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-2">Loading Fee Structures...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            );
        }

        if (!feeStructures || feeStructures.length === 0) {
            return (
                <div className="text-center py-8">
                    <h3 className="text-lg font-semibold">No Fee Structures Found</h3>
                    <p className="text-muted-foreground mt-1">
                        Get started by creating your first fee structure.
                    </p>
                    <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Fee Structure
                    </Button>
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {feeStructures.map((structure) => (
                        <TableRow key={structure.id}>
                            <TableCell className="font-medium">{structure.name}</TableCell>
                            <TableCell>{structure.academic_year}</TableCell>
                            <TableCell>{structure.term}</TableCell>
                            <TableCell>
                                <Badge variant={structure.is_active ? 'default' : 'secondary'}>
                                    {structure.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(structure.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenAssignDialog(structure)}>
                                            Assign to Class
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Fee Structures</h2>
                    <p className="text-muted-foreground">
                        Manage fee structures for different academic years and terms.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {renderContent()}
                </CardContent>
            </Card>
            
            <CreateFeeStructureDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            />

            {selectedFeeStructure && (
                <AssignFeeStructureDialog
                    isOpen={isAssignDialogOpen}
                    onClose={() => setIsAssignDialogOpen(false)}
                    feeStructure={selectedFeeStructure}
                />
            )}
        </div>
    );
};

export default FeeManagementModule;
