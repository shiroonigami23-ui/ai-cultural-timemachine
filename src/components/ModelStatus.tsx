"use client";

import { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi, WifiOff, CheckCircle, Loader2 } from "lucide-react";

export default function ModelStatus() {
  const [modelsLoaded, setModelsLoaded] = useState({
    text: false,
    image: false,
    audio: false
  });
  const [storageUsage, setStorageUsage] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    // Simulate model loading (replace with actual loading logic)
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setModelsLoaded({ text: true, image: true, audio: true });
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // Check IndexedDB storage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        if (estimate.usage && estimate.quota) {
          setStorageUsage(Math.round((estimate.usage / estimate.quota) * 100));
        }
      });
    }

    return () => clearInterval(interval);
  }, []);

  const getBrowserCapability = () => {
    const hasWebGPU = !!navigator.gpu;
    const memory = navigator.deviceMemory || 4;
    return {
      webGPU: hasWebGPU,
      memoryGB: memory,
      capability: memory >= 8 ? "High" : memory >= 4 ? "Medium" : "Low"
    };
  };

  const capability = getBrowserCapability();

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Cpu className="w-5 h-5 mr-2 text-primary-400" />
        System Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connection Status */}
        <div className="bg-gray-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Connection</span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="text-lg font-semibold">
            {isOnline ? "Online" : "Offline"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {isOnline ? "Models can be downloaded" : "Using cached models only"}
          </div>
        </div>

        {/* Browser Capability */}
        <div className="bg-gray-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Browser Capability</span>
            <div className={`px-2 py-1 rounded text-xs ${
                capability.capability === "High"
                  ? "bg-green-900/30 text-green-400"
                  : capability.capability === "Medium"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-red-900/30 text-red-400"
              }`}>
              {capability.capability}
            </div>
          </div>
          <div className="text-lg font-semibold">
            {capability.webGPU ? "WebGPU Ready" : "WASM Mode"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {capability.memoryGB}GB RAM • {capability.webGPU ? "Fast" : "Standard"}
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-gray-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Storage Used</span>
            <HardDrive className="w-4 h-4 text-primary-400" />
          </div>
          <div className="text-lg font-semibold">{storageUsage}%</div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${storageUsage}%` }}
            />
          </div>
        </div>

        {/* Model Status */}
        <div className="bg-gray-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Models Ready</span>
            {Object.values(modelsLoaded).every(v => v) ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
            )}
          </div>
          <div className="text-lg font-semibold">
            {Object.values(modelsLoaded).filter(v => v).length}/3
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Model Status */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h3 className="font-medium mb-3">Model Details</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(modelsLoaded).map(([key, loaded]) => (
            <div key={key} className="flex items-center space-x-2">
              {loaded ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              )}
              <span className="text-sm capitalize">{key} Model</span>
              <span className="text-xs text-gray-500">
                {loaded ? "Loaded" : "Loading..."}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
