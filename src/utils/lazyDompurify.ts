// Lazy load DOMPurify only when sanitization is needed
let DOMPurifyModule: any = null;

export const sanitizeHTML = async (dirty: string): Promise<string> => {
  if (!DOMPurifyModule) {
    const module = await import('isomorphic-dompurify');
    DOMPurifyModule = module.default;
  }
  return DOMPurifyModule.sanitize(dirty);
};

// Synchronous version for immediate needs (preload on first use)
export const sanitizeHTMLSync = (dirty: string): string => {
  if (!DOMPurifyModule) {
    console.warn('DOMPurify not loaded, returning unsanitized content');
    return dirty;
  }
  return DOMPurifyModule.sanitize(dirty);
};

// Preload function for critical paths
export const preloadSanitizer = async (): Promise<void> => {
  if (!DOMPurifyModule) {
    const module = await import('isomorphic-dompurify');
    DOMPurifyModule = module.default;
  }
};