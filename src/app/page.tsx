import EraSelector from "@/components/EraSelector";
import ModelStatus from "@/components/ModelStatus";
import { Clock, Globe, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary-900 to-historical-medieval rounded-2xl mb-6">
          <Clock className="w-12 h-12 text-primary-300" />
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-historical-renaissance bg-clip-text text-transparent">
          AI Cultural Time Machine
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Step into history through AI-powered immersive experiences.
          Chat with historical figures, explore reconstructed environments,
          and experience daily life across eras—all running locally in your browser.
        </p>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Globe className="w-10 h-10 text-historical-roman mb-4" />
          <h3 className="text-xl font-semibold mb-2">Historical Accuracy</h3>
          <p className="text-gray-400">
            Fine-tuned models on verified historical texts and archaeological data.
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <Brain className="w-10 h-10 text-primary-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Local AI</h3>
          <p className="text-gray-400">
            Runs completely in your browser. No API calls, no data sent to servers.
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-historical-renaissance to-historical-modern rounded-lg flex items-center justify-center mb-4">
            <span className="text-lg">🌍</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Multi-Era</h3>
          <p className="text-gray-400">
            From Ancient Rome to 20th century, with more eras constantly added.
          </p>
        </div>
      </section>

      {/* Era Selection */}
      <section className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Era</h2>
        <EraSelector />
      </section>

      {/* Model Status */}
      <section className="mt-12">
        <ModelStatus />
      </section>

      {/* Quick Start */}
      <section className="mt-16 bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-8 border border-primary-900/30">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-300">For Users</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Select an era above</li>
              <li>Wait for models to load (first time only)</li>
              <li>Start chatting with historical characters</li>
              <li>Explore environments and daily life</li>
            </ol>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-300">For Developers</h3>
            <div className="bg-gray-950 p-4 rounded-lg font-mono text-sm">
              <code>git clone https://github.com/shiroonigami23-ui/ai-cultural-timemachine</code><br/>
              <code>npm install</code><br/>
              <code>npm run dev</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
