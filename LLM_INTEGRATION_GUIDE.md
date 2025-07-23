# 🤖 Enhanced LLM Integration Guide

## 🚀 New Features Added

Your Lexxi Medical app now includes a sophisticated **free LLM integration system** that combines:

- **Free Cloud LLMs** (Groq, Hugging Face) for fast, high-quality processing
- **Local Ollama models** for privacy and unlimited usage
- **Smart fallback system** ensuring the app always works
- **Optimized for your hardware** (8GB RAM + GTX 1650)

## 🔧 Quick Setup (5 minutes)

### Option 1: Automatic Setup (Recommended)

```bash
# Run the automated setup script
setup-llm.bat

# Start the development server
npm run dev

# Test the integration
npm run test-llm
```

### Option 2: Manual Setup

#### 1. Get Free API Keys

**Groq (Primary - Free 6K tokens/minute):**

1. Visit: [console.groq.com/keys](https://console.groq.com/keys)
2. Create account and generate API key
3. Add to `.env.local`: `GROQ_API_KEY=your_key_here`

**Hugging Face (Backup - Free 1K requests/month):**

1. Visit: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create account and generate token
3. Add to `.env.local`: `HUGGINGFACE_API_KEY=your_key_here`

#### 2. Install Local LLM (Recommended: Single Model)

```bash
# Install Ollama
# Download from: https://ollama.ai/download

# Install ONLY the essential model for your 8GB RAM
ollama pull phi3:mini      # 2.3GB - Perfect for your hardware

# ⚠️ STOP HERE - phi3:mini handles everything you need!
# Optional later: ollama pull gemma:2b (1.6GB - only if you need backup)
```

**Important**: phi3:mini alone can handle both transcript enhancement AND note generation efficiently on your hardware. No need for multiple models!

## 📋 What's Enhanced

### 1. **Smart Transcription Enhancement**

- **Before**: Raw Whisper output with potential errors
- **After**: LLM-enhanced text with corrected medical terms

```typescript
// Example enhancement
Input: "المريض عنده الم في الرأس مع دوخة";
Output: "المريض يعاني من ألم في الرأس مصحوب بدوخة";
```

### 2. **Intelligent Medical Note Generation**

- **Multiple sources**: Cloud + Local LLMs
- **Language support**: Arabic & English
- **Smart fallback**: Always generates notes

### 3. **Performance Optimized**

- **Your GTX 1650**: Supports local models with GPU acceleration
- **8GB RAM**: Perfect for phi3:mini and mistral:7b models
- **Fast response**: Cloud APIs respond in 1-3 seconds

## 🧪 Testing the Integration

1. **Start the app**: `npm run dev`
2. **Visit test page**: `http://localhost:3000/test-llm`
3. **Test features**:
   - Transcript enhancement
   - Note generation
   - LLM source switching
   - Performance metrics

## 🔄 How It Works

### Processing Flow:

```
1. Whisper Transcription → Raw Text
2. LLM Enhancement → Corrected Medical Text
3. Note Generation → Structured Medical Report
```

### LLM Selection Priority:

```
1. Groq API (Fast, Free)
2. Hugging Face API (Backup)
3. Local Ollama (Privacy)
4. Basic Template (Fallback)
```

## 📊 Cost & Performance

| Method           | Cost   | Speed  | Quality    | Privacy    |
| ---------------- | ------ | ------ | ---------- | ---------- |
| **Groq**         | Free\* | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐       |
| **HuggingFace**  | Free\* | ⚡⚡   | ⭐⭐⭐⭐   | ⭐⭐       |
| **Local Ollama** | Free   | ⚡⚡   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ |
| **Template**     | Free   | ⚡⚡⚡ | ⭐⭐       | ⭐⭐⭐⭐⭐ |

\*Free tiers: Groq (6K tokens/min), HF (1K requests/month)

## 🛠️ API Usage Examples

### Enhance Transcript

```bash
curl -X POST http://localhost:3000/api/enhance-transcript \
  -H "Content-Type: application/json" \
  -d '{"transcript": "المريض عنده صداع", "language": "ar"}'
```

### Generate Note

```bash
curl -X POST http://localhost:3000/api/generate-note \
  -H "Content-Type: application/json" \
  -d '{"transcript": "المريض يعاني من صداع شديد", "noteType": "soap", "language": "ar"}'
```

### Check LLM Status

```bash
curl http://localhost:3000/api/llm-status
```

## 🔍 Troubleshooting

### Common Issues:

**1. "Groq API error"**

- Check your API key in `.env.local`
- Verify key is correct at console.groq.com

**2. "Ollama not running"**

- Start Ollama: `ollama serve`
- Check models: `ollama list`

**3. "Out of memory"**

- Use smaller models: `phi3:mini` instead of larger models
- Close other applications to free RAM

**4. "Slow response"**

- Check internet connection for cloud APIs
- Local models may be slower on first run

### Performance Tips:

1. **For best speed**: Get Groq API key (free, 6K tokens/min)
2. **For privacy**: Use local Ollama models
3. **For reliability**: Use both cloud + local setup
4. **For low RAM**: Stick to `phi3:mini` and `gemma:2b` models

## 📈 Monitoring

Check LLM performance in the test page:

- Response times
- Success rates
- Confidence scores
- Source usage

## 🔮 Advanced Configuration

### Custom Model Selection

```typescript
// In utils/smartLLMRouter.ts
const PREFERRED_MODELS = {
  enhancement: "phi3:mini", // Fast, 2GB
  noteGeneration: "mistral:7b", // Quality, 4GB
  fallback: "gemma:2b", // Backup, 1.6GB
};
```

### GPU Acceleration (Optional)

```bash
# Enable GPU layers for faster inference
export OLLAMA_GPU_LAYERS=35
ollama serve
```

## 🎯 Next Steps

1. **Test the integration** using the test page
2. **Add your API keys** for cloud LLMs
3. **Install local models** for offline usage
4. **Integrate with main app** workflow
5. **Monitor performance** and adjust as needed

Your app now has enterprise-grade LLM capabilities using completely free resources! 🚀
