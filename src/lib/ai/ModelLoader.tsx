"use client";

import { useState, useEffect } from "react";
import { pipeline, env } from "@xenova/transformers";

// Disable local model caching from CDN
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

type ModelType = "text" | "image" | "audio";

interface ModelLoaderProps {
  eraId: string;
  modelType: ModelType;
  onLoad?: (model: any) => void;
  onProgress?: (progress: number) => void;
}

export default function ModelLoader({ eraId, modelType, onLoad, onProgress }: ModelLoaderProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Model configurations
  const MODEL_CONFIGS = {
    text: {
      task: "text-generation" as const,
      model: "microsoft/Phi-3-mini-4k-instruct",
      quantized: true,
    },
    image: {
      task: "text-to-image" as const,
      model: "stabilityai/stable-diffusion-2-1",
      quantized: false,
    },
    audio: {
      task: "text-to-audio" as const,
      model: "facebook/musicgen-small",
      quantized: true,
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      if (!mounted) return;

      const config = MODEL_CONFIGS[modelType];
      if (!config) {
        setError(`Unsupported model type: ${modelType}`);
        setStatus("error");
        return;
      }

      try {
        setStatus("loading");
        setProgress(0);

        // Create progress callback
        const progressCallback = (x: any) => {
          if (mounted && onProgress) {
            setProgress(x.progress);
            onProgress(x.progress);
          }
        };

        const loadedModel = await pipeline(config.task, config.model, {
          progress_callback: progressCallback,
          quantized: config.quantized,
        });

        if (mounted) {
          setStatus("loaded");
          if (onLoad) {
            onLoad(loadedModel);
          }
        }

      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setStatus("error");
        }
      }
    };

    loadModel();

    return () => {
      mounted = false;
    };
  }, [eraId, modelType, onLoad, onProgress]);

  return null; // This component is for loading, it doesn't render anything visible
}
