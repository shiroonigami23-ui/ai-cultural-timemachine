"use client";

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
    reset,
    }: {
      error: Error & { digest?: string };
        reset: () => void;
        }) {
          useEffect(() => {
              console.error(error);
                }, [error]);

                  return (
                      <div className="min-h-screen flex items-center justify-center p-4">
                            <div className="max-w-md text-center">
                                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                              <AlertTriangle className="w-8 h-8 text-red-500" />
                                                      </div>
                                                              <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
                                                                      <p className="text-gray-400 mb-6">
                                                                                {error.message || 'An unexpected error occurred'}
                                                                                        </p>
                                                                                                <button
                                                                                                          onClick={reset}
                                                                                                                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition"
                                                                                                                          >
                                                                                                                                    Try again
                                                                                                                                            </button>
                                                                                                                                                  </div>
                                                                                                                                                      </div>
                                                                                                                                                        );
                                                                                                                                                        }
