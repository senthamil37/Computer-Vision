// Computer vision utilities and types

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  objectClass: string;
  confidence: number;
  boundingBox: BoundingBox | null;
  color: string;
}

export interface ProcessingOptions {
  objectDetection: boolean;
  classification: boolean;
  textDetection: boolean;
}

export interface AnalysisJob {
  id: number;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingOptions: ProcessingOptions;
  results?: any;
  detectionResults?: DetectionResult[];
  createdAt: string;
  completedAt?: string;
  fileSize: number;
  dimensions?: { width: number; height: number };
  processingTimeMs?: number;
}

// Utility functions for working with computer vision results
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'processing': return 'text-yellow-600 bg-yellow-100';
    case 'failed': return 'text-red-600 bg-red-100';
    case 'pending': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const formatConfidence = (confidence: number): string => {
  return `${confidence}%`;
};

export const formatDimensions = (width: number, height: number): string => {
  return `${width}×${height}px`;
};

export const formatProcessingTime = (ms: number): string => {
  return `${(ms / 1000).toFixed(2)}s`;
};

// Mock object classes for demonstration
export const OBJECT_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush', 'monitor', 'computer', 'desk', 'office'
];

// Color palette for bounding boxes
export const DETECTION_COLORS = [
  '#4285F4', // Google Blue
  '#34A853', // Google Green
  '#FBBC04', // Google Yellow
  '#EA4335', // Google Red
  '#9AA0A6', // Gray
  '#FF6D01', // Orange
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
];
