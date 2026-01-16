#!/bin/bash

# AI Cultural Time Machine - One-Click Deployment Setup
# This script helps set up all deployment services

set -e  # Exit on error

# Colors
RED='[0;31m'
GREEN='[0;32m'
YELLOW='[1;33m'
BLUE='[0;34m'
NC='[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════╗"
echo "║   AI Cultural Time Machine - Deployment Setup      ║"
echo "╚════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_step() {
    echo -e "
${GREEN}[$1]${NC} $2"
}

print_warning() {
    echo -e "${YELLOW}⚠  $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ  $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_step "1" "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 18+ first."
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found. Please install npm."
        exit 1
    fi

    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install git."
        exit 1
    fi

    print_info "Prerequisites check passed ✓"
}

# Setup Supabase
setup_supabase() {
    print_step "2" "Setting up Supabase..."

    echo ""
    print_info "Please create a Supabase project:"
    echo "1. Go to https://supabase.com"
    echo "2. Click 'Start your project'"
    echo "3. Create project: ai-cultural-timemachine"
    echo "4. Note down: Project URL and anon public key"
    echo ""

    read -p "Have you created the Supabase project? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter Supabase Project URL: " supabase_url
        read -p "Enter Supabase anon key: " supabase_key

        # Create .env.local
        if [ ! -f .env.local ]; then
            cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=${supabase_url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabase_key}
NEXT_PUBLIC_ENABLE_WEBGPU=false
NEXT_PUBLIC_MODEL_CACHE=true
EOF
            print_info "Created .env.local with Supabase credentials"
        fi

        print_info "To apply database schema, run:"
        echo "  ./supabase.sh start  # For local development"
        echo "  Or apply manually via Supabase dashboard SQL editor"
    else
        print_warning "Skipping Supabase setup. Remember to set it up later."
    fi
}

# Setup Vercel
setup_vercel() {
    print_step "3" "Setting up Vercel..."

    echo ""
    print_info "Deployment options:"
    echo "1. Automatic (recommended) - Connect GitHub repo"
    echo "2. Manual - Deploy using Vercel CLI"
    echo ""

    read -p "Choose deployment method (1/2): " method

    case $method in
        1)
            print_info "Automatic deployment instructions:"
            echo "1. Go to https://vercel.com"
            echo "2. Import from GitHub"
            echo "3. Select your repository"
            echo "4. Add environment variables from .env.local"
            echo "5. Click Deploy"
            ;;
        2)
            if ! command -v vercel &> /dev/null; then
                print_info "Installing Vercel CLI..."
                npm install -g vercel
            fi

            print_info "Run the following commands:"
            echo "  vercel login"
            echo "  vercel"
            echo "  vercel env pull .env.local"
            echo "  vercel --prod"
            ;;
        *)
            print_warning "Invalid choice. Skipping Vercel setup."
            ;;
    esac
}

# Setup GitHub Secrets
setup_github_secrets() {
    print_step "4" "Setting up GitHub Secrets..."

    echo ""
    print_info "Go to your GitHub repository:"
    echo "1. Settings → Secrets and variables → Actions"
    echo "2. Add the following secrets:"
    echo ""
    echo "   VERCEL_TOKEN          (from Vercel account settings)"
    echo "   VERCEL_ORG_ID         (from Vercel dashboard)"
    echo "   VERCEL_PROJECT_ID     (from Vercel project settings)"
    echo "   NEXT_PUBLIC_SUPABASE_URL     (from .env.local)"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY (from .env.local)"
    echo ""

    read -p "Press Enter when you have added the secrets..." -n 1 -r
    echo ""
}

# Setup Hugging Face
setup_huggingface() {
    print_step "5" "Setting up Hugging Face..."

    echo ""
    print_info "1. Create Hugging Face account: https://huggingface.co/join"
    print_info "2. Create access token: Settings → Access Tokens"
    print_info "3. Create model repositories:"
    echo "   - your-username/phi3-pompeii-4bit"
    echo "   - your-username/sd-pompeii-lora"
    echo "   - your-username/pompeii-ambient"
    echo ""
    print_info "4. Update src/lib/hf/models.json with your model paths"
    echo ""
}

# Final instructions
final_instructions() {
    print_step "6" "Deployment Setup Complete!"

    echo ""
    echo -e "${GREEN}✅ Deployment services configured${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run locally to test: ${YELLOW}npm run dev${NC}"
    echo "2. Push changes to GitHub: ${YELLOW}git push origin main${NC}"
    echo "3. Monitor deployment in GitHub Actions"
    echo "4. Check your site at: ${YELLOW}https://ai-cultural-timemachine.vercel.app${NC}"
    echo ""
    echo "Documentation:"
    echo "• DEPLOYMENT.md - Full deployment guide"
    echo "• DEVELOPMENT.md - Development guide"
    echo "• README.md - Project overview"
    echo ""
    echo -e "${BLUE}Need help?${NC}"
    echo "• Open GitHub Issues for bugs"
    echo "• Check troubleshooting in DEPLOYMENT.md"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_supabase
    setup_vercel
    setup_github_secrets
    setup_huggingface
    final_instructions
}

# Run main function
main "$@"