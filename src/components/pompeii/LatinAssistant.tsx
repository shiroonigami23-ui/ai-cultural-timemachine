"use client";

import { useState } from "react";
import { BookOpen, Volume2, Copy, Check } from "lucide-react";
import latinPhrases from "@/data/pompeii/latin_phrases.json";

export default function LatinAssistant() {
  const [selectedCategory, setSelectedCategory] = useState("common_greetings");
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  const categories = Object.keys(latinPhrases);
  
  const currentPhrases = latinPhrases[selectedCategory as keyof typeof latinPhrases] || [];

  const speakLatin = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'la';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPhrase(text);
      setTimeout(() => setCopiedPhrase(null), 2000);
    });
  };

  const getCategoryName = (key: string) => {
    const names: Record<string, string> = {
      "common_greetings": "Common Greetings",
      "market_phrases": "Market Phrases",
      "food_and_drink": "Food & Drink",
      "time_and_weather": "Time & Weather",
      "emergency_phrases": "Emergency Phrases",
      "philosophical": "Philosophical"
    };
    return names[key] || key.replace("_", " ");
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-primary-400" />
          <h3 className="font-bold">Latin Language Assistant</h3>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Learn phrases used by Pompeii's residents
        </p>
      </div>

      <div className="p-4">
        {/* Category Selection */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                selectedCategory === category
                  ? "bg-primary-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>

        {/* Phrases List */}
        <div className="space-y-3">
          {Array.isArray(currentPhrases) && currentPhrases.map((phrase: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-mono text-lg text-amber-200">{phrase.latin}</div>
                  <div className="text-sm text-gray-300 mt-1">{phrase.english}</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => speakLatin(phrase.latin)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    title="Listen to pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(phrase.latin)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                    title="Copy to clipboard"
                  >
                    {copiedPhrase === phrase.latin ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Context: {phrase.context}
              </div>
            </div>
          ))}
        </div>

        {/* Language Tips */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
          <h4 className="font-semibold mb-2 text-primary-300">Latin Language Tips</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Latin was the language of government and education in Pompeii</li>
            <li>• Common people also spoke a local Italic language (Oscan)</li>
            <li>• Many graffiti found in Pompeii are in Latin</li>
            <li>• Pronunciation is phonetic: each letter is pronounced</li>
            <li>• 'V' is pronounced like English 'W' (Veni = Wen-ee)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}