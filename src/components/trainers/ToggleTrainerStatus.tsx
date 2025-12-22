import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TrainerService } from "@/services/trainerService";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ToggleTrainerStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: any;
}

export function ToggleTrainerStatusDialog({ open, onOpenChange, trainer }: ToggleTrainerStatusDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleActivation = async () => {
    setIsLoading(true);

    try {
      await TrainerService.toggleTrainerStatus(trainer.id,!trainer.isActive);

      toast.success(`Trainer ${trainer.isActive? "inactive" : "activate"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || `"Failed to ${trainer.isActive? "inactive" : "activate"} trainer`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{trainer.isActive? "Inactive" : "Activate"} Trainer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {trainer.isActive? "inactive" : "activate"} trainer{" "}
            <span className="font-semibold">
              {trainer?.first_name} {trainer?.last_name}?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={trainer.isActive ? 'destructive' : 'default'} onClick={handleActivation} disabled={isLoading}>
            {isLoading ? 'Processing...' :trainer.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
