import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";

type Props = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  action: () => void;
  trigger?: ReactNode;
  description: string;
};

export function ConfirmationAlert({
  isOpen,
  setIsOpen,
  action,
  trigger,
  description,
}: Props) {
  function onClose() {
    setIsOpen(false);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      {trigger ? (
        trigger
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure ?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={action}
            className="bg-red-500 text-white hover:bg-red-500"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
