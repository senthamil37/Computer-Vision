import { useQuery } from "@tanstack/react-query";
import { Download, Share, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultsDisplayProps {
  jobId: number;
  originalFile: File | null;
}

export default function ResultsDisplay({ jobId, originalFile }: ResultsDisplayProps) {
  const { data: job, isLoading, error } = useQuery({
    queryKey: [`/api/analyze/${jobId}`],
    refetchInterval: (data) => {
      return data?.status === 'completed' || data?.status === 'failed' ? false : 2000;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="aspect-video" />
              <Skeleton className="aspect-video" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !job) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Failed to load analysis results
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-google-green text-white';
      case 'processing': return 'bg-yellow-500 text-white';
      case 'failed': return 'bg-google-red text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const originalImageUrl = originalFile ? URL.createObjectURL(originalFile) : '';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-google-text">Analysis Results</h3>
            <Badge className={getStatusColor(job.status)}>
              {job.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">Computer vision analysis with annotations and confidence scores</p>
        </div>
        
        {job.status === 'processing' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-google-blue">
              <Clock className="animate-spin" size={20} />
              <span>Processing your image...</span>
            </div>
          </div>
        )}

        {job.status === 'completed' && (
          <>
            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-google-text mb-3">Original Image</h4>
                <div className="aspect-video bg-gray-100 rounded-lg border border-google-border overflow-hidden">
                  {originalImageUrl && (
                    <img 
                      src={originalImageUrl}
                      alt="Original" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-google-text mb-3">Processed Results</h4>
                <div className="aspect-video bg-gray-100 rounded-lg border border-google-border relative overflow-hidden">
                  {originalImageUrl && (
                    <img 
                      src={originalImageUrl}
                      alt="Processed" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Bounding boxes overlay */}
                  <div className="absolute inset-0">
                    {job.detectionResults?.map((detection: any, index: number) => {
                      if (!detection.boundingBox) return null;
                      
                      const { x, y, width, height } = detection.boundingBox;
                      const scaleX = 100; // Percentage scale for responsive positioning
                      const scaleY = 100;
                      
                      return (
                        <div
                          key={index}
                          className="absolute border-2"
                          style={{
                            borderColor: detection.color,
                            backgroundColor: `${detection.color}20`,
                            left: `${(x / (job.dimensions?.width || 1920)) * 100}%`,
                            top: `${(y / (job.dimensions?.height || 1080)) * 100}%`,
                            width: `${(width / (job.dimensions?.width || 1920)) * 100}%`,
                            height: `${(height / (job.dimensions?.height || 1080)) * 100}%`,
                          }}
                        >
                          <div 
                            className="text-white text-xs px-2 py-1 rounded-bl-md absolute -top-6 left-0"
                            style={{ backgroundColor: detection.color }}
                          >
                            {detection.objectClass} ({detection.confidence}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Detection Results */}
            {job.detectionResults && job.detectionResults.length > 0 && (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-google-text">Detection Results</h4>
                
                <div className="space-y-2">
                  {job.detectionResults.map((detection: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ 
                        backgroundColor: `${detection.color}10`,
                        borderColor: `${detection.color}40`
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: detection.color }}
                        ></div>
                        <span className="text-sm font-medium text-google-text capitalize">
                          {detection.objectClass}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-google-text">{detection.confidence}%</div>
                          <div className="text-xs text-gray-600">confidence</div>
                        </div>
                        {detection.boundingBox && (
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              x: {detection.boundingBox.x}, y: {detection.boundingBox.y}
                            </div>
                            <div className="text-xs text-gray-600">
                              {detection.boundingBox.width}×{detection.boundingBox.height} px
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Export Options */}
            <div className="flex items-center justify-between pt-6 border-t border-google-border">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-google-blue hover:text-google-blue/80">
                  <Download size={16} className="mr-2" />
                  Download Results
                </Button>
                <Button variant="ghost" className="text-google-blue hover:text-google-blue/80">
                  <Share size={16} className="mr-2" />
                  Share
                </Button>
              </div>
              <div className="text-xs text-gray-600">
                Processed in {job.processingTimeMs ? `${(job.processingTimeMs / 1000).toFixed(2)}s` : 'N/A'} • {job.detectionResults?.length || 0} objects detected
              </div>
            </div>
          </>
        )}

        {job.status === 'failed' && (
          <div className="text-center py-8 text-red-500">
            <p>Processing failed. Please try again with a different image.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
