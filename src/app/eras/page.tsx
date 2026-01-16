import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";

const eras = [
  {
    id: "pompeii",
    name: "Pompeii, 79 AD",
    description: "Experience Roman life moments before Vesuvius eruption",
    year: 79,
    location: "Roman Empire, Italy",
    status: "available",
    features: ["Marketplace", "Baths", "Forum", "Daily Life"],
    color: "bg-historical-roman",
    modelSize: "450MB",
    progress: 100
  },
  {
    id: "medieval",
    name: "Medieval Paris, 1350",
    description: "Walk through medieval streets during the Hundred Years' War",
    year: 1350,
    location: "Kingdom of France",
    status: "coming-soon",
    features: ["Cathedral", "Market", "Guilds", "Plague Era"],
    color: "bg-historical-medieval",
    modelSize: "520MB",
    progress: 30
  },
  {
    id: "renaissance",
    name: "Florence, 1500",
    description: "Meet artists and philosophers of the Italian Renaissance",
    year: 1500,
    location: "Republic of Florence",
    status: "coming-soon",
    features: ["Art Studios", "Libraries", "Gardens", "Innovation"],
    color: "bg-historical-renaissance",
    modelSize: "480MB",
    progress: 10
  },
  {
    id: "victorian",
    name: "London, 1890",
    description: "Explore Victorian society and the Industrial Revolution",
    year: 1890,
    location: "British Empire",
    status: "planned",
    features: ["Factories", "Salons", "Streets", "Technology"],
    color: "bg-gray-700",
    modelSize: "510MB",
    progress: 5
  }
];

export default function ErasPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Historical Eras</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Journey through different periods of history. Each era offers unique characters,
          locations, and experiences reconstructed with AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {eras.map((era) => (
          <div
            key={era.id}
            className={`bg-gray-900 rounded-xl border border-gray-800 overflow-hidden transition-all hover:border-gray-700 hover:transform hover:scale-[1.02] ${
              era.status === "available" ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          >
            <Link href={era.status === "available" ? `/eras/${era.id}` : "#"}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 ${era.color} rounded-full`} />
                      <span className={`px-2 py-1 rounded text-xs ${
                        era.status === "available"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}>
                        {era.status === "available" ? "Available" : "Coming Soon"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold">{era.name}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {era.year} AD
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {era.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Model Size</div>
                    <div className="text-lg font-semibold">{era.modelSize}</div>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">{era.description}</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Features</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {era.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>Development Progress</span>
                      <span>{era.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${era.color}`}
                        style={{ width: `${era.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  {era.status === "available" ? (
                    <button className="w-full py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition">
                      Enter {era.name.split(",")[0]}
                    </button>
                  ) : (
                    <button className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                      {era.status === "coming-soon" ? "Coming Soon" : "Planned"}
                    </button>
                  )}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold mb-4">About Our Historical Reconstruction</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-2 text-primary-300">Accuracy</h4>
            <p className="text-sm text-gray-400">
              All content is based on archaeological evidence, historical records,
              and academic research. We work with historians to ensure accuracy.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-primary-300">AI Technology</h4>
            <p className="text-sm text-gray-400">
              We use fine-tuned AI models to generate historically plausible
              dialogues, scenes, and interactions based on the available evidence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-primary-300">Education Focus</h4>
            <p className="text-sm text-gray-400">
              Designed for learning and engagement. Each era includes historical
              context, language assistance, and cultural insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
