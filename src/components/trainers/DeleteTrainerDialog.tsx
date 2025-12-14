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
import { Loader2 } from "lucide-react";

interface DeleteTrainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: any;
}

export function DeleteTrainerDialog({ open, onOpenChange, trainer }: DeleteTrainerDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      // Delete trainer (photo deletion handled by backend)
      await TrainerService.deleteTrainer(trainer.id);

      toast.success("Trainer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["trainers"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete trainer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete trainer{" "}
            <span className="font-semibold">
              {trainer?.first_name} {trainer?.last_name}
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
