import { useState } from "react";
import { Eye, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import UploadZone from "@/components/upload-zone";
import ProcessingOptions from "@/components/processing-options";
import ResultsDisplay from "@/components/results-display";
import HistorySidebar from "@/components/history-sidebar";
import ProcessingModal from "@/components/processing-modal";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [processingOptions, setProcessingOptions] = useState({
    objectDetection: true,
    classification: true,
    textDetection: false,
  });

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentJobId(null);
  };

  const handleStartProcessing = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("options", JSON.stringify(processingOptions));

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to start processing");
      }

      const result = await response.json();
      setCurrentJobId(result.jobId);
    } catch (error) {
      console.error("Error starting processing:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-google-bg">
      {/* Header */}
      <header className="bg-white border-b border-google-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="text-google-blue text-2xl" size={24} />
                <h1 className="text-xl font-medium text-google-text">Vision AI</h1>
              </div>
              <nav className="hidden md:flex space-x-6 ml-8">
                <a href="#" className="text-google-blue border-b-2 border-google-blue pb-4 px-1 text-sm font-medium">
                  Process Images
                </a>
                <a href="#" className="text-google-text hover:text-google-blue pb-4 px-1 text-sm font-medium">
                  History
                </a>
                <a href="#" className="text-google-text hover:text-google-blue pb-4 px-1 text-sm font-medium">
                  API Docs
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-google-text hover:text-google-blue">
                <HelpCircle size={16} />
              </Button>
              <Button className="bg-google-blue text-white hover:bg-google-blue/90">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Processing Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Upload Section */}
            <UploadZone 
              onFileUpload={handleFileUpload} 
              uploadedFile={uploadedFile}
            />

            {/* Processing Options */}
            <ProcessingOptions
              options={processingOptions}
              onOptionsChange={setProcessingOptions}
              onStartProcessing={handleStartProcessing}
              canProcess={!!uploadedFile && !isProcessing}
              isProcessing={isProcessing}
            />

            {/* Results Display */}
            {currentJobId && (
              <ResultsDisplay 
                jobId={currentJobId}
                originalFile={uploadedFile}
              />
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <HistorySidebar onSelectJob={setCurrentJobId} />
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      <ProcessingModal isOpen={isProcessing} />
    </div>
  );
}
