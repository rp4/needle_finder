// Scheduler utility for non-blocking heavy operations
type Task = () => void;

class TaskScheduler {
  private queue: Task[] = [];
  private isProcessing = false;

  // Schedule work to be done when the browser is idle
  scheduleTask(task: Task, priority: 'high' | 'normal' | 'low' = 'normal') {
    const wrappedTask = () => {
      try {
        task();
      } catch (error) {
        console.error('Task execution failed:', error);
      }
    };

    if (priority === 'high') {
      this.queue.unshift(wrappedTask);
    } else {
      this.queue.push(wrappedTask);
    }

    this.processQueue();
  }

  private processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        (deadline) => {
          while (this.queue.length > 0 && deadline.timeRemaining() > 1) {
            const task = this.queue.shift();
            task?.();
          }

          this.isProcessing = false;
          if (this.queue.length > 0) {
            this.processQueue();
          }
        },
        { timeout: 2000 }
      );
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        const task = this.queue.shift();
        task?.();
        this.isProcessing = false;

        if (this.queue.length > 0) {
          this.processQueue();
        }
      }, 0);
    }
  }

  // Clear all pending tasks
  clear() {
    this.queue = [];
  }
}

export const scheduler = new TaskScheduler();

// Utility function for chunked processing
export function processInChunks<T>(
  items: T[],
  processor: (item: T) => void,
  chunkSize = 100
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;

    function processChunk() {
      const chunk = items.slice(index, index + chunkSize);
      chunk.forEach(processor);
      index += chunkSize;

      if (index < items.length) {
        scheduler.scheduleTask(processChunk, 'normal');
      } else {
        resolve();
      }
    }

    processChunk();
  });
}