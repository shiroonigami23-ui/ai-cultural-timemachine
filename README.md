# 🕰️ AI Cultural Time Machine

<div align="center">

**Experience history through AI-powered immersion**  
*Chat with historical figures, explore reconstructed environments, all running locally in your browser*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-Transformers-yellow?style=for-the-badge&logo=huggingface)](https://huggingface.co)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

</div>

## ✨ Features

- **🌍 Multiple Historical Eras**: From Ancient Rome to Victorian London
- **🤖 Local AI Processing**: Models run in your browser, no API calls
- **💬 Interactive Dialogues**: Chat with AI-powered historical characters
- **🖼️ Visual Reconstruction**: AI-generated period-accurate scenes
- **🔊 Ambient Audio**: Recreated historical soundscapes
- **📱 Progressive Enhancement**: Works on all devices, offline-capable
- **🔓 Open Source**: Free, transparent, and community-driven

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shiroonigami23-ui/ai-cultural-timemachine.git
cd ai-cultural-timemachine

# Run the installation script (Linux/Mac)
chmod +x install.sh
./install.sh

# Or install manually
npm install
```

### Development
```bash
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Production Build
```bash
# Create production build
npm run build

# Start production server
npm start
```

### Project Structure
```
ai-cultural-timemachine/
├── src/                 # Next.js 15 App Router
│   ├── app/             # Application specific routes and layouts
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Homepage
│   │   ├── loading.tsx  # Loading state
│   │   └── error.tsx    # Error boundary
│   ├── components/      # Reusable React components
│   │   ├── EraSelector.tsx    # Era selection UI
│   │   ├── ModelStatus.tsx    # System monitoring
│   │   └── ModelLoader.tsx    # AI model loader
│   └── lib/             # Utility functions and configurations
│       ├── ai/          # AI model management logic
│       └── hf/          # Hugging Face specific configurations (e.g., models.json)
├── models/              # (Optional) Directory for local model training scripts or initial model files
├── notebooks/           # Jupyter/Colab notebooks for data processing and model fine-tuning
└── data/                # Historical datasets, text corpora, image references
```


## 📚 Further Information

- **GitHub Repository**: [https://github.com/shiroonigami23-ui/ai-cultural-timemachine](https://github.com/shiroonigami23-ui/ai-cultural-timemachine)
- **Contributing**: Check `CONTRIBUTING.md` (once created) for how to contribute to the project.
- **Development Guide**: Refer to `DEVELOPMENT.md` (once created) for deeper insights into the development setup and architecture.
