import { Home } from 'lucide-react';

export default function NotFound() {
  return (
      <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md text-center">
                    <div className="text-6xl mb-4">🧭</div>
                            <h1 className="text-3xl font-bold mb-2">Era Not Found</h1>
                                    <p className="text-gray-400 mb-6">
                                              The historical era you're looking for doesn't exist yet, or may be lost to time.
                                                      </p>
                                                              <a
                                                                        href="/"
                                                                                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition"
                                                                                          >
                                                                                                    <Home className="w-4 h-4" />
                                                                                                              <span>Return Home</span>
                                                                                                                      </a>
                                                                                                                            </div>
                                                                                                                                </div>
                                                                                                                                  );
                                                                                                                                  }
