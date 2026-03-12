'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // In development, we want to see the rich error in the console or overlay
      // but we use toast for immediate visual feedback in the studio.
      console.error('Firebase Permission Fault:', error);
      
      toast({
        variant: "destructive",
        title: "Security Rule Violation",
        description: error.message || "You do not have permission to perform this action.",
      });

      // Optionally re-throw to trigger Next.js error boundary/overlay in dev
      if (process.env.NODE_ENV === 'development') {
        // We wrap in a timeout to avoid interrupting the current render cycle
        setTimeout(() => {
          // throw error; 
        }, 0);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  return null;
}
