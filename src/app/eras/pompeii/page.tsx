"use client";

import { useState, useEffect } from "react";
import { MapPin, Users, Volume2, Calendar, Shield, Wine } from "lucide-react";
import ModelLoader from "@/lib/ai/ModelLoader";
import CharacterChat from "@/components/pompeii/CharacterChat";
import SceneViewer from "@/components/pompeii/SceneViewer";
import LatinAssistant from "@/components/pompeii/LatinAssistant";

// Import data
import historicalData from "@/data/pompeii/historical_facts.json";
import charactersData from "@/data/pompeii/characters.json";
import locationsData from "@/data/pompeii/locations.json";

export default function PompeiiPage() {
  const [currentLocation, setCurrentLocation] = useState("forum");
  const [currentCharacter, setCurrentCharacter] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState({
    text: false,
    image: false,
    audio: false
  });
  const [eraData, setEraData] = useState<any>(null);

  useEffect(() => {
    // Load data
    setEraData({
      historical: historicalData,
      characters: charactersData.characters,
      locations: locationsData.locations
    });
  }, []);

  const handleModelLoad = (type: "text" | "image" | "audio") => {
    setModelsLoaded(prev => ({ ...prev, [type]: true }));
  };

  const selectedLocation = locationsData.locations.find(
    (loc: any) => loc.id === currentLocation
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-historical-roman/20 to-orange-900/20 rounded-2xl border border-historical-roman/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Pompeii, 79 AD</h1>
            <p className="text-gray-300">
              August 24th • Mount Vesuvius • Roman Empire
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1 bg-historical-roman/30 text-historical-roman rounded-full text-sm flex items-center">
                <Calendar className="w-3 h-3 mr-1" /> 24 August 79 AD
              </span>
              <span className="px-3 py-1 bg-orange-900/30 text-orange-400 rounded-full text-sm flex items-center">
                <Shield className="w-3 h-3 mr-1" /> Roman Empire
              </span>
              <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-sm flex items-center">
                <Wine className="w-3 h-3 mr-1" /> Thriving Port City
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">⚠️ WARNING</div>
              <div className="text-sm text-gray-400">Vesuvius will erupt today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Loading Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Load Pompeii AI Models</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ModelLoader 
            eraId="pompeii" 
            modelType="text" 
            onLoad={() => handleModelLoad("text")}
          />
          <ModelLoader 
            eraId="pompeii" 
            modelType="image" 
            onLoad={() => handleModelLoad("image")}
          />
          <ModelLoader 
            eraId="pompeii" 
            modelType="audio" 
            onLoad={() => handleModelLoad("audio")}
          />
        </div>
        
        {Object.values(modelsLoaded).every(v => v) && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="flex items-center text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>All models loaded! Ready for historical immersion.</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Location Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary-400" />
              Explore Locations
            </h3>
            
            <div className="space-y-3">
              {locationsData.locations.map((location: any) => (
                <button
                  key={location.id}
                  onClick={() => setCurrentLocation(location.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    currentLocation === location.id
                      ? "bg-primary-900/30 border border-primary-700"
                      : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                  }`}
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {location.description.substring(0, 60)}...
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Volume2 className="w-3 h-3 mr-1" />
                    {location.sounds.length} sounds • {location.activities.length} activities
                  </div>
                </button>
              ))}
            </div>

            {/* Current Location Details */}
            {selectedLocation && (
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="font-bold mb-2">{selectedLocation.name}</h4>
                <p className="text-sm text-gray-300 mb-3">{selectedLocation.description}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Sounds:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLocation.sounds.slice(0, 3).map((sound: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {sound}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-500">Activities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLocation.activities.slice(0, 3).map((activity: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Character Selection */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-400" />
              Meet The People
            </h3>
            
            <div className="space-y-3">
              {charactersData.characters.map((character: any) => (
                <button
                  key={character.id}
                  onClick={() => setCurrentCharacter(
                    currentCharacter === character.id ? null : character.id
                  )}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    currentCharacter === character.id
                      ? "bg-primary-900/30 border border-primary-700"
                      : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-900 to-orange-800 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-lg">{character.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{character.name}</div>
                      <div className="text-sm text-gray-400">{character.role}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: Scene Viewer */}
        <div className="lg:col-span-2">
          <SceneViewer 
            locationId={currentLocation}
            characterId={currentCharacter}
            modelsLoaded={modelsLoaded}
          />
          
          {/* Character Chat */}
          {currentCharacter && modelsLoaded.text && (
            <div className="mt-6">
              <CharacterChat 
                characterId={currentCharacter}
                locationId={currentLocation}
              />
            </div>
          )}
          
          {/* Latin Assistant */}
          {modelsLoaded.text && (
            <div className="mt-6">
              <LatinAssistant />
            </div>
          )}

          {/* Historical Facts */}
          {eraData?.historical && (
            <div className="mt-6 bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-bold mb-4">Historical Context</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-primary-300">Key Facts</h4>
                  <ul className="space-y-2">
                    {eraData.historical.key_facts.slice(0, 4).map((fact: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2"></div>
                        <span className="text-sm">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-primary-300">Daily Life</h4>
                  <div className="space-y-2">
                    {Object.entries(eraData.historical.daily_life).slice(0, 3).map(([category, items]: [string, any]) => (
                      <div key={category}>
                        <div className="text-sm font-medium capitalize">{category}:</div>
                        <div className="text-xs text-gray-400">
                          {(items as string[]).slice(0, 2).join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                    <span>🔥</span>
                  </div>
                  <div>
                    <div className="font-semibold">Historical Note</div>
                    <div className="text-sm text-gray-300">
                      This simulation takes place on August 24, 79 AD. The catastrophic eruption of Mount Vesuvius will occur later today, preserving this moment for eternity.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}