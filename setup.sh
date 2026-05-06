#!/bin/bash
# Development setup script

echo "🚀 Setting up Cripto & Stock API Project..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your ALPHA_VANTAGE_API_KEY"
fi

# Create instance directory
mkdir -p instance

# Initialize database
echo "🗄️  Initializing database..."
python3 -c "from BitcoinApiProject import app, db, init_db; init_db(app); print('✓ Database initialized')"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your ALPHA_VANTAGE_API_KEY"
echo "2. Run: source venv/bin/activate"
echo "3. Run: python BitcoinApiProject.py"
echo "4. Open: http://localhost:5000"
echo ""
