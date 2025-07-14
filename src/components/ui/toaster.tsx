
// Simplified toaster that uses sonner instead of the complex shadcn implementation
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return <SonnerToaster position="top-right" />;
}
