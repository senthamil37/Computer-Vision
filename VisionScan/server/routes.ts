import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertAnalysisJobSchema, insertDetectionResultSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

// Mock computer vision processing
async function processImage(imagePath: string, options: any) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  // Mock detection results based on processing options
  const mockResults = [];
  const colors = ["#4285F4", "#34A853", "#FBBC04", "#EA4335"];
  
  if (options.objectDetection) {
    // Generate mock object detections
    const objects = ["monitor", "laptop", "keyboard", "mouse", "phone", "desk", "chair", "book"];
    const numDetections = Math.floor(Math.random() * 5) + 2; // 2-6 objects
    
    for (let i = 0; i < numDetections; i++) {
      const obj = objects[Math.floor(Math.random() * objects.length)];
      mockResults.push({
        objectClass: obj,
        confidence: Math.floor(Math.random() * 30) + 70, // 70-99% confidence
        boundingBox: {
          x: Math.floor(Math.random() * 300),
          y: Math.floor(Math.random() * 200),
          width: Math.floor(Math.random() * 150) + 50,
          height: Math.floor(Math.random() * 100) + 30,
        },
        color: colors[i % colors.length],
      });
    }
  }
  
  if (options.classification) {
    // Add classification results to the mock results
    const categories = ["office", "workspace", "technology", "indoor", "business"];
    mockResults.push({
      objectClass: "scene_classification",
      confidence: Math.floor(Math.random() * 20) + 80,
      boundingBox: null,
      color: "#9AA0A6",
    });
  }
  
  return mockResults;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Upload and process image
  app.post("/api/analyze", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const processingOptions = JSON.parse(req.body.options || "{}");
      
      // Validate processing options
      const optionsSchema = z.object({
        objectDetection: z.boolean().default(true),
        classification: z.boolean().default(true),
        textDetection: z.boolean().default(false),
      });
      
      const validatedOptions = optionsSchema.parse(processingOptions);

      // Get image dimensions (mock for now)
      const dimensions = { width: 1920, height: 1080 };

      // Create analysis job
      const job = await storage.createAnalysisJob({
        filename: req.file.originalname,
        originalPath: req.file.path,
        processedPath: null,
        status: "processing",
        processingOptions: validatedOptions,
        results: null,
        fileSize: req.file.size,
        dimensions: dimensions,
        processingTimeMs: null,
      });

      // Start processing asynchronously
      processImageAsync(job.id, req.file.path, validatedOptions);

      res.json({ jobId: job.id, status: "processing" });
    } catch (error) {
      console.error("Error starting analysis:", error);
      res.status(500).json({ message: "Failed to start image analysis" });
    }
  });

  // Get analysis job status and results
  app.get("/api/analyze/:jobId", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getAnalysisJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Analysis job not found" });
      }

      let detectionResults = [];
      if (job.status === "completed") {
        detectionResults = await storage.getDetectionResultsByJobId(jobId);
      }

      res.json({
        ...job,
        detectionResults,
      });
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ message: "Failed to fetch analysis" });
    }
  });

  // Get recent analysis history
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const jobs = await storage.getRecentAnalysisJobs(limit);
      
      // Add detection counts to each job
      const jobsWithCounts = await Promise.all(
        jobs.map(async (job) => {
          const detectionResults = await storage.getDetectionResultsByJobId(job.id);
          return {
            ...job,
            objectCount: detectionResults.length,
          };
        })
      );

      res.json(jobsWithCounts);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });

  // Serve uploaded images
  app.get("/api/images/:filename", (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(path.resolve(imagePath));
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Async function to process image
  async function processImageAsync(jobId: number, imagePath: string, options: any) {
    const startTime = Date.now();
    
    try {
      // Update status to processing
      await storage.updateAnalysisJob(jobId, { status: "processing" });

      // Process the image
      const mockResults = await processImage(imagePath, options);

      // Save detection results
      for (const result of mockResults) {
        await storage.createDetectionResult({
          analysisJobId: jobId,
          ...result,
        });
      }

      // Update job as completed
      const processingTime = Date.now() - startTime;
      await storage.updateAnalysisJob(jobId, {
        status: "completed",
        completedAt: new Date(),
        processingTimeMs: processingTime,
        results: { objectsDetected: mockResults.length },
      });

    } catch (error) {
      console.error("Error processing image:", error);
      await storage.updateAnalysisJob(jobId, {
        status: "failed",
        completedAt: new Date(),
        results: { error: "Processing failed" },
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
