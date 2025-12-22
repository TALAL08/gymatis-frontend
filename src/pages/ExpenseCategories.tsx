import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Tags, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ExpenseCategoryService } from '@/services/expenseCategoryService';
import { ExpenseCategory } from '@/models/interfaces/Expense';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddExpenseCategoryDialog } from '@/components/expenses/AddExpenseCategoryDialog';
import { EditExpenseCategoryDialog } from '@/components/expenses/EditExpenseCategoryDialog';
import { DeleteExpenseCategoryDialog } from '@/components/expenses/DeleteExpenseCategoryDialog';
import { format } from 'date-fns';

export default function ExpenseCategories() {
  const { gymId } = useAuth();
  const [searchText, setSearchText] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['expense-categories', gymId],
    queryFn: () => ExpenseCategoryService.getCategoriesByGym(String(gymId)),
    enabled: !!gymId,
  });

  const filteredCategories = categories?.filter((cat) =>
    cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const handleDelete = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold mb-2">Expense Categories</h1>
          <p className="text-muted-foreground">Manage your expense categories</p>
        </div>
        <Button variant="energetic" onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6 animate-slide-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </Card>

      {/* Categories Table */}
      <Card className="p-6 card-glow animate-slide-in">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading categories...
          </div>
        ) : filteredCategories && filteredCategories.length > 0 ? (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(category.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {
                        !category.isDefault && (

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(category)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        )
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Tags className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-4">
              {searchText
                ? 'Try adjusting your search'
                : 'Get started by adding your first expense category'}
            </p>
            {!searchText && (
              <Button variant="energetic" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Category
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <AddExpenseCategoryDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => refetch()}
      />

      {selectedCategory && (
        <>
          <EditExpenseCategoryDialog
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) setSelectedCategory(null);
            }}
            category={selectedCategory}
            onSuccess={() => {
              refetch();
              setSelectedCategory(null);
            }}
          />
          <DeleteExpenseCategoryDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setSelectedCategory(null);
            }}
            category={selectedCategory}
            onSuccess={() => {
              refetch();
              setSelectedCategory(null);
            }}
          />
        </>
      )}
    </div>
  );
}
