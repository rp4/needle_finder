// Enhanced worker manager with retry logic and better error handling
import { logger } from '@services/logger';

export interface WorkerMessage {
  action: string;
  data?: unknown;
  id?: string;
}

export interface WorkerResponse {
  result?: unknown;
  error?: string;
  progress?: number;
  id?: string;
}

interface WorkerTask {
  id: string;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  retryCount: number;
  data: unknown;
}

export class WorkerManager {
  private worker: Worker | null = null;
  private tasks = new Map<string, WorkerTask>();
  private isProcessing = false;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(private workerPath: string) {}

  private initWorker(): Worker {
    if (this.worker) {
      return this.worker;
    }

    this.worker = new Worker(this.workerPath, { type: 'module' });

    this.worker.addEventListener('message', this.handleMessage.bind(this));
    this.worker.addEventListener('error', this.handleError.bind(this));

    logger.debug('Worker initialized', { path: this.workerPath });

    return this.worker;
  }

  private handleMessage(event: MessageEvent<WorkerResponse>): void {
    const { result, error, progress, id } = event.data;

    if (!id) {
      logger.warn('Received message without task ID', event.data);
      return;
    }

    const task = this.tasks.get(id);
    if (!task) {
      logger.warn('Received message for unknown task', { id });
      return;
    }

    // Handle progress updates
    if (progress !== undefined) {
      logger.debug('Task progress', { id, progress });
      // Could emit progress events here
      return;
    }

    // Handle completion
    if (result !== undefined) {
      logger.debug('Task completed', { id });
      task.resolve(result);
      this.tasks.delete(id);
      this.isProcessing = false;
    }

    // Handle errors
    if (error) {
      this.handleTaskError(task, new Error(error));
    }
  }

  private handleError(event: ErrorEvent): void {
    logger.error('Worker error', new Error(event.message));

    // Retry all pending tasks
    for (const task of this.tasks.values()) {
      this.handleTaskError(task, new Error('Worker crashed'));
    }
  }

  private async handleTaskError(task: WorkerTask, error: Error): Promise<void> {
    task.retryCount++;

    if (task.retryCount <= this.maxRetries) {
      logger.warn(`Retrying task (attempt ${task.retryCount}/${this.maxRetries})`, {
        taskId: task.id,
        error: error.message
      });

      // Wait before retrying
      await this.delay(this.retryDelay * task.retryCount);

      // Reinitialize worker if needed
      if (!this.worker) {
        this.initWorker();
      }

      // Retry the task
      this.sendMessage({
        action: 'process',
        data: task.data,
        id: task.id
      });
    } else {
      logger.error('Task failed after max retries', error);
      task.reject(error);
      this.tasks.delete(task.id);
      this.isProcessing = false;
    }
  }

  private sendMessage(message: WorkerMessage): void {
    const worker = this.initWorker();
    worker.postMessage(message);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async process<T>(data: unknown): Promise<T> {
    const taskId = this.generateTaskId();

    return new Promise<T>((resolve, reject) => {
      const task: WorkerTask = {
        id: taskId,
        resolve: resolve as (value: unknown) => void,
        reject,
        retryCount: 0,
        data
      };

      this.tasks.set(taskId, task);
      this.isProcessing = true;

      logger.debug('Starting worker task', { taskId });

      this.sendMessage({
        action: 'process',
        data,
        id: taskId
      });

      // Set timeout for the entire operation
      const timeout = setTimeout(() => {
        if (this.tasks.has(taskId)) {
          this.handleTaskError(task, new Error('Task timeout'));
        }
      }, 60000); // 60 second timeout

      // Clean up timeout when task completes
      const originalResolve = task.resolve;
      task.resolve = (value: unknown) => {
        clearTimeout(timeout);
        originalResolve(value);
      };

      const originalReject = task.reject;
      task.reject = (error: Error) => {
        clearTimeout(timeout);
        originalReject(error);
      };
    });
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      logger.debug('Worker terminated');
    }

    // Reject all pending tasks
    for (const task of this.tasks.values()) {
      task.reject(new Error('Worker terminated'));
    }
    this.tasks.clear();
    this.isProcessing = false;
  }

  get isBusy(): boolean {
    return this.isProcessing;
  }

  get pendingTasks(): number {
    return this.tasks.size;
  }
}