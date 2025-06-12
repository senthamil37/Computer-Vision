import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface ProcessingOptionsProps {
  options: {
    objectDetection: boolean;
    classification: boolean;
    textDetection: boolean;
  };
  onOptionsChange: (options: any) => void;
  onStartProcessing: () => void;
  canProcess: boolean;
  isProcessing: boolean;
}

export default function ProcessingOptions({
  options,
  onOptionsChange,
  onStartProcessing,
  canProcess,
  isProcessing
}: ProcessingOptionsProps) {
  const handleOptionChange = (key: string, value: boolean) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-google-text mb-2">Processing Options</h3>
          <p className="text-sm text-gray-600">Select the computer vision tasks to perform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <label className="flex items-center space-x-3 p-3 border border-google-border rounded-lg hover:bg-gray-50 cursor-pointer">
            <Checkbox
              checked={options.objectDetection}
              onCheckedChange={(checked) => handleOptionChange('objectDetection', !!checked)}
            />
            <div>
              <div className="text-sm font-medium text-google-text">Object Detection</div>
              <div className="text-xs text-gray-600">Detect and locate objects</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 border border-google-border rounded-lg hover:bg-gray-50 cursor-pointer">
            <Checkbox
              checked={options.classification}
              onCheckedChange={(checked) => handleOptionChange('classification', !!checked)}
            />
            <div>
              <div className="text-sm font-medium text-google-text">Classification</div>
              <div className="text-xs text-gray-600">Classify image content</div>
            </div>
          </label>
          
          <label className="flex items-center space-x-3 p-3 border border-google-border rounded-lg hover:bg-gray-50 cursor-pointer">
            <Checkbox
              checked={options.textDetection}
              onCheckedChange={(checked) => handleOptionChange('textDetection', !!checked)}
            />
            <div>
              <div className="text-sm font-medium text-google-text">Text Detection</div>
              <div className="text-xs text-gray-600">Extract text from image</div>
            </div>
          </label>
        </div>
        
        <Button 
          onClick={onStartProcessing}
          disabled={!canProcess}
          className="bg-google-blue text-white hover:bg-google-blue/90 disabled:bg-gray-300"
        >
          <Play size={16} className="mr-2" />
          {isProcessing ? 'Processing...' : 'Process Image'}
        </Button>
      </CardContent>
    </Card>
  );
}
