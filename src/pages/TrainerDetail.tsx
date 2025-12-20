import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TrainerService } from "@/services/trainerService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrainerSalaryConfigSection } from "@/components/trainers/TrainerSalaryConfigSection";
import { EditTrainerDialog } from "@/components/trainers/EditTrainerDialog";
import { GenerateSalarySlipDialog } from "@/components/trainers/GenerateSalarySlipDialog";
import { 
  ArrowLeft, 
  Edit, 
  UserCircle, 
  Phone, 
  Mail, 
  FileText,
  Loader2
} from "lucide-react";

export default function TrainerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGenerateSlipDialogOpen, setIsGenerateSlipDialogOpen] = useState(false);

  const { data: trainer, isLoading, refetch } = useQuery({
    queryKey: ["trainer", id],
    queryFn: async () => {
      if (!id) return null;
      return await TrainerService.getTrainerById(parseInt(id));
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Trainer not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/trainers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trainers
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in-up">
        <Button variant="ghost" size="icon" onClick={() => navigate("/trainers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Trainer Details</h1>
          <p className="text-muted-foreground">View and manage trainer information</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsGenerateSlipDialogOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Salary Slip
            </Button>
            <Button variant="energetic" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Trainer
            </Button>
          </div>
        )}
      </div>

      {/* Trainer Info Card */}
      <Card className="animate-slide-in">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {trainer.photoUrl ? (
                <img
                  src={trainer.photoUrl}
                  alt={`${trainer.firstName} ${trainer.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle className="w-16 h-16 text-white" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{trainer.firstName} {trainer.lastName}</h2>
                <Badge className={trainer.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
                  {trainer.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {trainer.bio && (
                <p className="text-muted-foreground">{trainer.bio}</p>
              )}

              <div className="flex flex-wrap gap-6 text-sm">
                {trainer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{trainer.phone}</span>
                  </div>
                )}
                {trainer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{trainer.email}</span>
                  </div>
                )}
              </div>

              {trainer.specialties && trainer.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trainer.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card className="animate-slide-in">
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Price Per Session</p>
              <p className="text-xl font-semibold">{trainer.pricePerSession.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Monthly Add-on Price</p>
              <p className="text-xl font-semibold">{trainer.monthlyAddonPrice.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Configuration Section */}
      <TrainerSalaryConfigSection trainerId={trainer.id} />

      {/* Dialogs */}
      <EditTrainerDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) refetch();
        }}
        trainer={trainer}
      />

      <GenerateSalarySlipDialog
        open={isGenerateSlipDialogOpen}
        onOpenChange={setIsGenerateSlipDialogOpen}
        preselectedTrainerId={trainer.id}
      />
    </div>
  );
}
