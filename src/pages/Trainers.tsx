import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrainerService } from "@/services/trainerService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddTrainerDialog } from "@/components/trainers/AddTrainerDialog";
import { EditTrainerDialog } from "@/components/trainers/EditTrainerDialog";
import { DeleteTrainerDialog } from "@/components/trainers/DeleteTrainerDialog";
import { Plus, Search, Edit, Trash2, UserCircle } from "lucide-react";
import { usePagination } from "@/hooks/use-pagination";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { useDebounce } from "@/hooks/use-debounce";

export default function Trainers() {
  const { gymId, isAdmin } = useAuth();
  const [localSearch, setLocalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    pageNo,
    pageSize,
    searchText,
    setPageNo,
    setPageSize,
    setSearchText,
    pageSizeOptions,
  } = usePagination({ defaultPageSize: 10 });

  const debouncedSearch = useDebounce(localSearch, 400);

  useEffect(() => {
    if (debouncedSearch !== searchText) {
      setSearchText(debouncedSearch);
    }
  }, [debouncedSearch, searchText, setSearchText]);

  useEffect(() => {
    setLocalSearch(searchText);
  }, []);

  const { data: paginatedData, isLoading, refetch } = useQuery({
    queryKey: ["trainers", gymId, pageNo, pageSize, searchText, statusFilter],
    queryFn: async () => {
      if (!gymId) return { data: [], totalCount: 0, pageNo: 1, pageSize: 10, totalPages: 0 };
      return await TrainerService.getTrainersByGymPaginated(gymId, {
        pageNo,
        pageSize,
        searchText,
        status: statusFilter === "all" ? "" : statusFilter,
      });
    },
    enabled: !!gymId,
  });

  const trainers = paginatedData?.data ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;
  const totalPages = paginatedData?.totalPages ?? 0;

  const handleStatusFilterChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setPageNo(1);
  };

  const handleEdit = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold mb-2">Trainers</h1>
          <p className="text-muted-foreground">Manage gym trainers and their specialties</p>
        </div>
        {isAdmin && (
          <Button variant="energetic" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Trainer
          </Button>
        )}
      </div>

      <Card className="animate-slide-in">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-10"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => handleStatusFilterChange('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => handleStatusFilterChange('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                onClick={() => handleStatusFilterChange('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="p-6 card-glow animate-slide-in">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading trainers...
          </div>
        ) : trainers && trainers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="p-4 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {trainer.photoUrl ? (
                        <img
                          src={trainer.photoUrl}
                          alt={`${trainer.firstName} ${trainer.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{trainer.firstName} {trainer.lastName}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {trainer.bio || 'No bio available'}
                          </p>
                        </div>
                        <Badge className={trainer.isActive ? 'bg-success/10 text-success border-success/20 flex-col' : 'bg-muted text-muted-foreground border-border flex-col'}>
                          {trainer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        {trainer.specialties && trainer.specialties.length > 0 && (
                          <p className="text-sm text-muted-foreground truncate">
                            Specialties: {trainer.specialties.join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">Per Session: {trainer.pricePerSession}</p>
                        <p className="text-sm text-muted-foreground">Monthly Add-on: {trainer.monthlyAddonPrice}</p>
                        {trainer.phone && <p className="text-sm text-muted-foreground">📞 {trainer.phone}</p>}
                        {trainer.email && <p className="text-sm text-muted-foreground">✉️ {trainer.email}</p>}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(trainer)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDelete(trainer)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <DataTablePagination
              pageNo={pageNo}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setPageNo}
              onPageSizeChange={setPageSize}
              isLoading={isLoading}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <UserCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchText || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first trainer'}
            </p>
            {isAdmin && !searchText && statusFilter === 'all' && (
              <Button variant="energetic" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Trainer
              </Button>
            )}
          </div>
        )}
      </Card>

      <AddTrainerDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) refetch();
        }} 
      />
      {selectedTrainer && (
        <>
          <EditTrainerDialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) refetch();
            }}
            trainer={selectedTrainer}
          />
          <DeleteTrainerDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open);
              if (!open) refetch();
            }}
            trainer={selectedTrainer}
          />
        </>
      )}
    </div>
  );
}
