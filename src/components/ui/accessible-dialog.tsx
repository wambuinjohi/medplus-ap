import * as React from "react"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter, DialogDescription, DialogClose, DialogOverlay, DialogPortal, DialogTrigger } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

/**
 * AccessibleDialogContent ensures that every DialogContent has a DialogTitle
 * for accessibility compliance with Radix UI dialog requirements.
 * 
 * This wrapper component automatically adds a hidden DialogTitle if one isn't provided,
 * preventing accessibility warnings from Radix UI.
 */
interface AccessibleDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  hiddenTitle?: string;
  children: React.ReactNode;
}

export const AccessibleDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  AccessibleDialogContentProps
>(({ children, hiddenTitle = "Dialog", ...props }, ref) => {
  // Check if children contain a DialogTitle element
  const hasDialogTitle = React.Children.toArray(children).some((child) => {
    if (React.isValidElement(child)) {
      return (
        child.type === DialogHeader ||
        (React.isValidElement(child) && 
         React.Children.toArray((child as any).props?.children).some(
           (subchild) =>  React.isValidElement(subchild) && subchild.type === DialogTitle
         ))
      );
    }
    return false;
  });

  return (
    <DialogContent ref={ref} {...props}>
      {!hasDialogTitle && (
        <VisuallyHidden>
          <DialogTitle>{hiddenTitle}</DialogTitle>
        </VisuallyHidden>
      )}
      {children}
    </DialogContent>
  );
});

AccessibleDialogContent.displayName = "AccessibleDialogContent";

// Re-export Dialog components for convenience
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
