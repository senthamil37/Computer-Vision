import { useQuery } from "@tanstack/react-query";
import { MoreVertical, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface HistorySidebarProps {
  onSelectJob: (jobId: number) => void;
}

export default function HistorySidebar({ onSelectJob }: HistorySidebarProps) {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['/api/history'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-google-green/10 text-google-green hover:bg-google-green/20">
            <CheckCircle size={12} className="mr-1" />
            Complete
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-yellow-100 text-yellow-600">
            <Clock size={12} className="mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-google-text mb-2">Processing History</h3>
          <p className="text-sm text-gray-600">Recent image analyses</p>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border border-google-border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="w-12 h-9 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm">
            Failed to load history
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No analysis history yet
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((job: any) => (
              <div 
                key={job.id}
                className="p-3 border border-google-border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectJob(job.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-9 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-500">IMG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-google-text truncate">
                      {job.filename}
                    </div>
                    <div className="text-xs text-gray-600">
                      {job.objectCount || 0} objects detected
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(job.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(job.status)}
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                    <MoreVertical size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-4 text-google-blue hover:text-google-blue border-google-border hover:bg-gray-50"
        >
          View All History
        </Button>
      </CardContent>
    </Card>
  );
}
