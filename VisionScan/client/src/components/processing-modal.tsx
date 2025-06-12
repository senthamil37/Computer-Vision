import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ProcessingModalProps {
  isOpen: boolean;
}

export default function ProcessingModal({ isOpen }: ProcessingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md">
        <VisuallyHidden>
          <DialogTitle>Processing Image</DialogTitle>
        </VisuallyHidden>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-google-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="text-google-blue animate-spin" size={32} />
          </div>
          
          <h3 className="text-lg font-medium text-google-text mb-2">
            Processing Image
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            Running computer vision analysis...
          </p>
          
          <div className="space-y-4">
            <Progress value={65} className="w-full" />
            <div className="text-sm text-gray-600">
              Step 2 of 3: Object Detection
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
