# Development Guide for AI Cultural Time Machine

This document outlines the technical architecture, development setup, and best practices for contributing to the AI Cultural Time Machine project.

## 🛠️ Tech Stack

*   **Frontend Framework**: Next.js 15 (App Router) with React
*   **Styling**: Tailwind CSS
*   **Language**: TypeScript
*   **AI Inference (Browser)**: @xenova/transformers (Transformers.js)
*   **Database (User Data)**: Supabase (free tier for authentication and minimal profiles)
*   **Database (Historical Knowledge)**: Potentially local vector DB or specialized IndexedDB for semantic search.
*   **Model Hosting**: Hugging Face Hub (for text, image, and audio models)
*   **Version Control**: Git and GitHub

## 🚀 Local Development Setup

### Prerequisites

Make sure you have the following installed:

*   Node.js (v18.x or later)
*   npm (v8.x or later)
*   Git

### Getting Started

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/shiroonigami23-ui/ai-cultural-timemachine.git
    cd ai-cultural-timemachine
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Environment Variables**: Create a `.env.local` file in the root of the project based on `.env.example`. Make sure to add your Hugging Face token if you plan to use private models or need higher rate limits:

    ```env
    NEXT_PUBLIC_HF_TOKEN=your_hugging_face_token_here
    ```

4.  **Run the Development Server**:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
ai-cultural-timemachine/
├── public/              # Static assets (images, fonts)
├── src/                 # Next.js 15 App Router
│   ├── app/             # Application specific routes, pages, and layouts
│   │   ├── (home)/      # Route group for the main landing page
│   │   ├── era/[id]/    # Dynamic route for specific historical eras
│   │   ├── api/         # API routes for backend functions (e.g., fallback inference)
│   │   ├── components/  # Page-level components, layout components
│   │   ├── globals.css  # Global Tailwind CSS styles
│   │   ├── layout.tsx   # Root layout for the application
│   │   ├── page.tsx     # Home page component
│   │   ├── error.tsx    # Error boundary for unexpected errors
│   │   ├── loading.tsx  # Loading state UI
│   │   └── not-found.tsx # 404 page
│   ├── components/      # Reusable UI components (EraSelector, ModelStatus, etc.)
│   ├── lib/             # Utility functions, configurations, external integrations
│   │   ├── ai/          # AI-related utilities (ModelLoader, inference wrappers)
│   │   ├── hf/          # Hugging Face specific utils (model registry, client)
│   │   └── utils.ts     # General utility functions
│   └── styles/          # Additional CSS files or Tailwind config extensions
├── data/                # Raw historical datasets, text corpora, image references
├── models/              # Saved trained models or LoRA adapters for local use/testing
├── notebooks/           # Jupyter/Colab notebooks for data processing and model training/fine-tuning
├── .github/             # GitHub specific configurations (workflows, issue templates)
├── .env.example         # Example environment variables
├── next.config.js       # Next.js configuration
├── postcss.config.js    # PostCSS configuration (for Tailwind)
├── tailwind.config.ts   # Tailwind CSS configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project metadata and dependencies
├── README.md            # Project overview
├── CONTRIBUTING.md      # Guidelines for contributions
├── DEVELOPMENT.md       # This development guide
├── LICENSE              # Project license
├── SECURITY.md          # Security policy
└── CODE_OF_CONDUCT.md   # Code of Conduct
```

## 🎨 Styling and UI

*   **Tailwind CSS**: Utility-first CSS framework. Refer to `tailwind.config.ts` for custom themes and colors.
*   **Lucide React**: For icons. Import and use directly in your components.

## 🤖 AI Models and Inference

*   **Transformers.js**: Used for running models directly in the browser. It leverages WebAssembly (WASM) and WebGPU for performance.
*   **Model Loading**: The `src/lib/ai/ModelLoader.tsx` handles the dynamic loading of models from Hugging Face Hub.
*   **Model Configuration**: `src/lib/hf/models.json` defines which models to load for each historical era.
*   **Quantization**: Models are typically 4-bit quantized (GGUF or ONNX) to optimize for browser performance and memory usage.

## ☁️ Deployment

This project is designed for serverless deployment on platforms like Vercel, leveraging Next.js's capabilities for static site generation (SSG) and incremental static regeneration (ISR) to optimize performance and keep costs low (within free tiers).

## ✍️ Best Practices and Guidelines

*   **TypeScript**: Adhere to strict TypeScript typing for better code maintainability and error prevention.
*   **Atomic Commits**: Make small, focused commits. Each commit should ideally address a single logical change.
*   **Descriptive Pull Requests**: Provide clear titles and detailed descriptions for your PRs.
*   **Testing**: Write tests for new components and complex logic.
*   **Performance**: Keep browser performance in mind, especially with AI models. Optimize model size and inference.
*   **Accessibility**: Design and implement features with accessibility in mind.

## ❓ Need Help?

*   Check the [GitHub Discussions](https://github.com/shiroonigami23-ui/ai-cultural-timemachine/discussions) for community help.
*   Open a [GitHub Issue](https://github.com/shiroonigami23-ui/ai-cultural-timemachine/issues) for bugs or feature requests.
