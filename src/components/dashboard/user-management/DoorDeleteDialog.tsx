
import { 
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
  AlertDialogAction 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Delete as DeleteIcon } from "lucide-react";

interface DoorDeleteDialogProps {
  onDelete: () => void;
  children: React.ReactNode;
}

export default function DoorDeleteDialog({ onDelete, children }: DoorDeleteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Delete Door</AlertDialogTitle>
          <AlertDialogDescription>
            This door will be permanently deleted and cannot be recovered. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-destructive text-white flex items-center space-x-2">
            <DeleteIcon className="w-5 h-5" />
            <span>Delete</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

