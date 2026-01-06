/**
 * ConfirmationDialog Component
 *
 * Modal dialog for confirming potentially destructive agent actions.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: string;
  details: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  action,
  details,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Action</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>The agent wants to perform the following action:</p>

              <div className="rounded-lg bg-muted p-3">
                <p className="mb-2 font-medium text-sm">{action}</p>
                {Object.keys(details).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(details).map(([key, value]) => (
                      <div key={key} className="flex gap-2 text-xs">
                        <span className="font-medium opacity-70">{key}:</span>
                        <span className="font-mono">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm">Do you want to proceed?</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
