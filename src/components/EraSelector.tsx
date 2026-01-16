"use client";

import { useState } from "react";
import { Calendar, Users, MapPin, Download } from "lucide-react";

const eras = [
  {
    id: "pompeii",
    name: "Pompeii, 79 AD",
    description: "Experience Roman life before Vesuvius eruption",
    color: "bg-historical-roman",
    modelSize: "450MB",
    status: "ready",
    features: ["Marketplace", "Baths", "Villa Tours", "Latin Dialogue"]
  },
  {
    id: "medieval",
    name: "Medieval Paris, 1350",
    description: "Walk through medieval streets and meet craftsmen",
    color: "bg-historical-medieval",
    modelSize: "520MB",
    status: "coming-soon",
    features: ["Cathedral", "Market", "Tavern", "Guild Hall"]
  },
  {
    id: "renaissance",
    name: "Florence, 1500",
    description: "Meet artists and philosophers of the Renaissance",
    color: "bg-historical-renaissance",
    modelSize: "480MB",
    status: "coming-soon",
    features: ["Studio", "Palace", "Library", "Garden"]
  },
  {
    id: "victorian",
    name: "London, 1890",
    description: "Explore Victorian society and industrial revolution",
    color: "bg-gray-700",
    modelSize: "510MB",
    status: "planned",
    features: ["Factory", "Salon", "Street", "Gallery"]
  }
];

export default function EraSelector() {
  const [selectedEra, setSelectedEra] = useState("pompeii");

  const handleEraSelect = (eraId: string) => {
    setSelectedEra(eraId);
    // TODO: Trigger model loading
    console.log(`Selected era: ${eraId}`);
  };

  const selectedEraData = eras.find(era => era.id === selectedEra);

  return (
    <div className="space-y-8">
      {/* Era Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {eras.map((era) => (
          <button
            key={era.id}
            onClick={() => handleEraSelect(era.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedEra === era.id
                ? "border-primary-500 bg-gray-800"
                : "border-gray-700 bg-gray-900 hover:border-gray-600"
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 ${era.color} rounded-lg flex items-center justify-center`}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{era.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{era.modelSize}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                  era.status === "ready"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-yellow-900/30 text-yellow-400"
                }`}>
                  {era.status === "ready" ? "Ready" : "Coming Soon"}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Era Details */}
      {selectedEraData && (
        <div className="animate-fade-in">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedEraData.name}</h3>
                <p className="text-gray-300 mt-2">{selectedEraData.description}</p>
              </div>
              <button
                className={`mt-4 md:mt-0 px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                  selectedEraData.status === "ready"
                    ? "bg-primary-600 hover:bg-primary-700"
                    : "bg-gray-700 cursor-not-allowed"
                } transition`}
                disabled={selectedEraData.status !== "ready"}
                onClick={() => selectedEraData.status === "ready" && console.log(`Launching ${selectedEraData.id}`)}
              >
                {selectedEraData.status === "ready" ? (
                  <>
                    <span>Enter Era</span>
                    <MapPin className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Coming Soon</span>
                    <Download className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {selectedEraData.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-3 flex items-center space-x-2"
                >
                  <Users className="w-4 h-4 text-primary-400" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Model Info */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>Model: {selectedEraData.modelSize} (4-bit quantized)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Runs locally in browser</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
