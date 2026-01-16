"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Volume2, History, X } from "lucide-react";
import charactersData from "@/data/pompeii/characters.json";

interface CharacterChatProps {
  characterId: string;
  locationId: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "character";
  timestamp: Date;
}

export default function CharacterChat({ characterId, locationId }: CharacterChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Salve! Welcome to Pompeii. I'm here to share what life was like before the eruption. What would you like to know?",
      sender: "character",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const character = charactersData.characters.find((c: any) => c.id === characterId);

  // Sample responses based on character
  const characterResponses: Record<string, string[]> = {
    lucius_caecilius_iucundus: [
      "The interest rates? They vary, but 12% per annum is common for secured loans.",
      "Yes, I started as a slave. Now I handle loans for some of Pompeii's most prominent citizens.",
      "The recent earthquakes have everyone worried. But business must continue.",
      "I deal in sestertii mostly. A small loan might be 1,000 sestertii.",
      "Vesuvius has been smoking more than usual. The augurs say it's a bad omen."
    ],
    aulus_umbricius_scaurus: [
      "My garum? It's the best in Campania! Aged for three months in the sun.",
      "I ship amphorae to Rome every week. The patricians can't get enough.",
      "The secret is mackerel intestines fermented with salt and herbs.",
      "Business is excellent! I just expanded my vats near the harbor.",
      "You can smell my workshop from the forum on a windy day!"
    ],
    helena: [
      "I work with wool mostly. The purple dye from murex shells is my specialty.",
      "Yes, women can own businesses here. I employ three other freedwomen.",
      "We work from sunrise to midday, then tend to household duties.",
      "The earthquake last week damaged my loom. I'm still repairing it.",
      "Most clothing is wool or linen. Silk from the East is for the very wealthy."
    ],
    marcus_vesonius_primus: [
      "I start baking before dawn. The town needs fresh bread by sunrise.",
      "We use wheat from Egypt mostly. The local harvest was poor this year.",
      "My bread is stamped with my seal. That's how people know it's quality.",
      "The oven heats with wood from Vesuvius' slopes. It gives a unique flavor.",
      "I supply bread to three thermopolia and several wealthy households."
    ],
    diocles: [
      "I fight as a murmillo. My next match is in five days at the amphitheater.",
      "Training starts at dawn. We practice with wooden swords to avoid injury.",
      "If I win enough matches, my master may grant me freedom.",
      "The crowd decides our fate. Thumbs up for life, thumbs down for death.",
      "I was captured in Thrace. This life is hard, but better than the mines."
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCharacterResponse = (userMessage: string): string => {
    const responses = characterResponses[characterId] || [
      "That's an interesting question. Let me think about it...",
      "Life in Pompeii is busy but good. The gods have blessed us.",
      "I've noticed more earthquakes lately. The ground trembles daily.",
      "You should visit the forum in the morning. That's when it's most lively.",
      "The smell of garum from Scaurus' workshop fills the whole street!"
    ];
    
    // Simple keyword matching
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("earthquake") || lowerMessage.includes("shake")) {
      return "Yes, the earth has been trembling more frequently. Some say it's Vulcan's anger.";
    }
    if (lowerMessage.includes("vesuvius") || lowerMessage.includes("smoke")) {
      return "The mountain has been smoking for days. The priests are making extra sacrifices.";
    }
    if (lowerMessage.includes("food") || lowerMessage.includes("eat")) {
      return "Try the thermopolium by the forum. Their lentil stew is excellent.";
    }
    if (lowerMessage.includes("money") || lowerMessage.includes("price")) {
      return "A loaf of bread costs one as. A day's wage for a laborer is about 10 asses.";
    }
    
    // Return random response from character's pool
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = getCharacterResponse(input);
      
      const characterMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "character",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, characterMessage]);
      setIsTyping(false);
      
      // Auto-speak the response
      speakResponse(response);
    }, 1500);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "1",
        content: "Salve! Welcome to Pompeii. I'm here to share what life was like before the eruption. What would you like to know?",
        sender: "character",
        timestamp: new Date()
      }
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!character) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="text-center text-gray-400">
          Character not found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-900 to-orange-800 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold">{character.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-bold">{character.name}</h3>
              <p className="text-sm text-gray-400">{character.role} • {character.status}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={isSpeaking ? stopSpeaking : () => speakResponse(messages[messages.length - 1]?.content || "")}
              className={`p-2 rounded-lg ${isSpeaking ? "bg-red-900/30 text-red-400" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
              title={isSpeaking ? "Stop speaking" : "Speak last message"}
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearConversation}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700"
              title="Clear conversation"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-primary-900/30 border border-primary-700/30"
                  : "bg-gray-800/50 border border-gray-700"
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === "character" ? (
                  <Bot className="w-3 h-3 mr-2 text-primary-400" />
                ) : (
                  <User className="w-3 h-3 mr-2 text-green-400" />
                )}
                <span className="text-xs text-gray-400">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-sm">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <Bot className="w-3 h-3 mr-2 text-primary-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${character.name} about life in Pompeii...`}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary-500 pr-12"
              rows={2}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-500">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`px-4 py-3 rounded-lg flex items-center justify-center ${
              input.trim() && !isTyping
                ? "bg-primary-600 hover:bg-primary-700"
                : "bg-gray-700 cursor-not-allowed"
            } transition`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Conversation Tips */}
        <div className="mt-3 text-xs text-gray-500">
          <span className="font-medium">Try asking about:</span>{" "}
          {character.conversation_topics.slice(0, 3).join(" • ")}
        </div>
      </div>
    </div>
  );
}