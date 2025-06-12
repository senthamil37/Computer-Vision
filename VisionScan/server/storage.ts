import { users, analysisJobs, detectionResults, type User, type InsertUser, type AnalysisJob, type InsertAnalysisJob, type DetectionResult, type InsertDetectionResult } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analysis Jobs
  createAnalysisJob(job: InsertAnalysisJob): Promise<AnalysisJob>;
  getAnalysisJob(id: number): Promise<AnalysisJob | undefined>;
  updateAnalysisJob(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob | undefined>;
  getAllAnalysisJobs(): Promise<AnalysisJob[]>;
  getRecentAnalysisJobs(limit?: number): Promise<AnalysisJob[]>;
  
  // Detection Results
  createDetectionResult(result: InsertDetectionResult): Promise<DetectionResult>;
  getDetectionResultsByJobId(jobId: number): Promise<DetectionResult[]>;
  deleteDetectionResultsByJobId(jobId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private analysisJobs: Map<number, AnalysisJob>;
  private detectionResults: Map<number, DetectionResult>;
  private currentUserId: number;
  private currentJobId: number;
  private currentResultId: number;

  constructor() {
    this.users = new Map();
    this.analysisJobs = new Map();
    this.detectionResults = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentResultId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAnalysisJob(job: InsertAnalysisJob): Promise<AnalysisJob> {
    const id = this.currentJobId++;
    const analysisJob: AnalysisJob = {
      ...job,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.analysisJobs.set(id, analysisJob);
    return analysisJob;
  }

  async getAnalysisJob(id: number): Promise<AnalysisJob | undefined> {
    return this.analysisJobs.get(id);
  }

  async updateAnalysisJob(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob | undefined> {
    const existing = this.analysisJobs.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.analysisJobs.set(id, updated);
    return updated;
  }

  async getAllAnalysisJobs(): Promise<AnalysisJob[]> {
    return Array.from(this.analysisJobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRecentAnalysisJobs(limit: number = 10): Promise<AnalysisJob[]> {
    const all = await this.getAllAnalysisJobs();
    return all.slice(0, limit);
  }

  async createDetectionResult(result: InsertDetectionResult): Promise<DetectionResult> {
    const id = this.currentResultId++;
    const detectionResult: DetectionResult = { ...result, id };
    this.detectionResults.set(id, detectionResult);
    return detectionResult;
  }

  async getDetectionResultsByJobId(jobId: number): Promise<DetectionResult[]> {
    return Array.from(this.detectionResults.values()).filter(
      (result) => result.analysisJobId === jobId
    );
  }

  async deleteDetectionResultsByJobId(jobId: number): Promise<void> {
    for (const [id, result] of this.detectionResults.entries()) {
      if (result.analysisJobId === jobId) {
        this.detectionResults.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
