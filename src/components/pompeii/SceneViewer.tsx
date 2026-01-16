"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Image as ImageIcon, Volume2, Eye } from "lucide-react";

interface SceneViewerProps {
  locationId: string;
  characterId: string | null;
  modelsLoaded: {
    text: boolean;
    image: boolean;
    audio: boolean;
  };
}

export default function SceneViewer({ locationId, characterId, modelsLoaded }: SceneViewerProps) {
  const [sceneDescription, setSceneDescription] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Scene descriptions for each location
  const sceneDescriptions: Record<string, string> = {
    forum: "The bustling Forum of Pompeii under the morning sun. Marble columns rise around the open square, where merchants set up stalls and citizens gather for business. The Temple of Jupiter dominates the north end, while political orators address crowds. The air smells of incense, baking bread, and the sea breeze from the nearby port.",
    thermopolium: "A lively thermopolium (fast-food counter) with colorful frescoes on the walls. Large dolia jars are embedded in the counter, containing wine and food. Customers stand at the counter while slaves serve hot stew and bread. The smell of garlic, fish sauce, and simmering meat fills the air.",
    stabian_baths: "The grand Stabian Baths with steam rising from the caldarium. Bathers relax in pools of varying temperatures, some being massaged by slaves. Mosaics decorate the floors, and sunlight filters through high windows. The sound of water echoes through the vaulted chambers.",
    house_of_faun: "The luxurious atrium of the House of the Faun. A bronze faun statue dances in the impluvium pool, collecting rainwater. Frescoes of Greek myths cover the walls, and the peristyle garden is visible through columns. The scent of perfumed oil and fresh flowers lingers.",
    amphitheater: "The massive amphitheater empty before the day's games. Sand covers the arena floor, with animal pens visible at the edges. The seating tiers rise steeply, capable of holding 20,000 spectators. Training sounds echo from the gladiator barracks nearby."
  };

  // Audio files for each location (placeholder - would use generated audio)
  const audioFiles: Record<string, string> = {
    forum: "/audio/forum-ambient.mp3",
    thermopolium: "/audio/thermopolium-ambient.mp3",
    stabian_baths: "/audio/baths-ambient.mp3",
    house_of_faun: "/audio/house-ambient.mp3",
    amphitheater: "/audio/amphitheater-ambient.mp3"
  };

  useEffect(() => {
    setSceneDescription(sceneDescriptions[locationId] || "Select a location to view the scene.");
    
    // Reset image when location changes
    setGeneratedImage(null);
    
    // Stop audio when location changes
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    }
  }, [locationId]);

  const generateSceneImage = async () => {
    if (!modelsLoaded.image) {
      alert("Image model not loaded yet. Please wait.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // This would use the actual image generation model
      // For now, we'll use a placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, this would be:
      // const image = await imageModel.generate(sceneDescription);
      // setGeneratedImage(image);
      
      setGeneratedImage(`https://picsum.photos/seed/${locationId}-${Date.now()}/800/400`);
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate scene image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <Eye className="w-5 h-5 mr-2 text-primary-400" />
          Scene Visualization
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={generateSceneImage}
            disabled={isGenerating || !modelsLoaded.image}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              modelsLoaded.image && !isGenerating
                ? "bg-primary-600 hover:bg-primary-700"
                : "bg-gray-700 cursor-not-allowed"
            } transition`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            <span>{isGenerating ? "Generating..." : "Generate Scene"}</span>
          </button>
          
          <button
            onClick={toggleAudio}
            disabled={!modelsLoaded.audio}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              modelsLoaded.audio
                ? isPlayingAudio
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 cursor-not-allowed"
            } transition`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingAudio ? "Stop Audio" : "Play Ambience"}</span>
          </button>
        </div>
      </div>

      {/* Scene Display */}
      <div className="relative bg-gray-950 rounded-lg overflow-hidden min-h-[400px]">
        {generatedImage ? (
          <div className="relative h-full">
            <img
              src={generatedImage}
              alt="Generated scene"
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="text-sm text-gray-300">
                AI-generated reconstruction of {locationId.replace("_", " ")}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Scene Visualization</h4>
              <p className="text-gray-400 mb-4">
                {sceneDescription}
              </p>
              <p className="text-sm text-gray-500">
                Click "Generate Scene" to create an AI visualization of this location.
                Requires image model to be loaded.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scene Details */}
      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-primary-300">Scene Description</h4>
            <p className="text-sm text-gray-300">{sceneDescription}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-primary-300">Immersion Features</h4>
            <div className="flex flex-wrap gap-2">
              {modelsLoaded.image && (
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                  Visual Reconstruction
                </span>
              )}
              {modelsLoaded.audio && (
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                  Ambient Audio
                </span>
              )}
              {characterId && (
                <span className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs">
                  Character Interaction
                </span>
              )}
              <span className="px-3 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs">
                Historical Accuracy
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioFiles[locationId]}
        onEnded={() => setIsPlayingAudio(false)}
        loop
      />
    </div>
  );
}