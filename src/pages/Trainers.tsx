import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrainerService } from "@/services/trainerService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AddTrainerDialog } from "@/components/trainers/AddTrainerDialog";
import { EditTrainerDialog } from "@/components/trainers/EditTrainerDialog";
import { DeleteTrainerDialog } from "@/components/trainers/DeleteTrainerDialog";
import { Plus, Search, Edit, Trash2, DollarSign, Calendar, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Trainers() {
  const { gymId, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: trainers, isLoading } = useQuery({
    queryKey: ["trainers", gymId, statusFilter],
    queryFn: async () => {
      if (!gymId) return [];
      
      let allTrainers = await TrainerService.getTrainersByGym(gymId);

      // Apply status filter
      if (statusFilter !== "all") {
        allTrainers = allTrainers.filter(trainer => 
          trainer.isActive === (statusFilter === "active")
        );
      }

      return allTrainers;
    },
    enabled: !!gymId,
  });

  const filteredTrainers = trainers?.filter((trainer) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      trainer.firstName.toLowerCase().includes(searchLower) ||
      trainer.lastName.toLowerCase().includes(searchLower) ||
      trainer.email?.toLowerCase().includes(searchLower) ||
      trainer.phone?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (trainer: any) => {
    setSelectedTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  return (
<>
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
                placeholder="Search by name, code, or phone..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('inactive')}
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
      ) : filteredTrainers && filteredTrainers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers.map((trainer) => (
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
      ) : (
        <div className="text-center py-12">
          <UserCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first trainer'}
          </p>
          {isAdmin && !searchQuery && statusFilter === 'all' && (
            <Button variant="energetic" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Trainer
            </Button>
          )}
        </div>
      )}
    </Card>

    <AddTrainerDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    {selectedTrainer && (
      <>
        <EditTrainerDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          trainer={selectedTrainer}
        />
        <DeleteTrainerDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          trainer={selectedTrainer}
        />
      </>
    )}
  </div>
</>
  );
}
