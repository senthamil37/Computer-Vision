import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, FileImage, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
}

export default function UploadZone({ onFileUpload, uploadedFile }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-medium text-google-text mb-2">Upload Image</h2>
          <p className="text-sm text-gray-600">Upload an image to analyze with computer vision algorithms</p>
        </div>
        
        {uploadedFile ? (
          <div className="border border-google-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={URL.createObjectURL(uploadedFile)} 
                  alt="Uploaded preview" 
                  className="w-20 h-14 object-cover rounded"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-google-text">{uploadedFile.name}</div>
                <div className="text-xs text-gray-600">
                  {formatFileSize(uploadedFile.size)} • {uploadedFile.type}
                </div>
                <div className="text-xs text-google-green mt-1 flex items-center">
                  <CheckCircle size={12} className="mr-1" />
                  Ready to process
                </div>
              </div>
              <FileImage className="text-gray-400" size={24} />
            </div>
          </div>
        ) : (
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-google-blue bg-blue-50' 
                : 'border-google-border hover:border-google-blue hover:bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <CloudUpload className="text-google-blue" size={48} />
              <div>
                <p className="text-lg font-medium text-google-text">
                  {isDragActive ? 'Drop the image here' : 'Drag and drop your image here'}
                </p>
                <p className="text-sm text-gray-600">
                  or <span className="text-google-blue font-medium">browse</span> to choose a file
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Supports: JPEG, PNG, WebP (max 10MB)
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
