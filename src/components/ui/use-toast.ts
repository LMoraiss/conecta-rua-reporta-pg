
// Redirect to sonner to avoid conflicts
import { toast } from "sonner";

// Create a compatibility layer for the shadcn toast API
export const useToast = () => {
  return {
    toast: (props: { title?: string; description?: string; variant?: string }) => {
      if (props.variant === 'destructive') {
        return toast.error(props.title || props.description || '');
      }
      return toast.success(props.title || props.description || '');
    },
    dismiss: toast.dismiss,
    toasts: []
  };
};

export { toast };
