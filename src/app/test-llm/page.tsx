import LLMTester from '@/components/LLMTester';

export default function TestPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        🤖 Lexxi Medical - Enhanced LLM Integration
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Test the new free LLM integration combining cloud services (Groq, Hugging Face)
                        with local Ollama models for enhanced transcription and medical note generation.
                    </p>
                </div>

                <LLMTester />

                <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4">🔧 Setup Instructions</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">1. Free Cloud LLMs (Recommended)</h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="mb-2"><strong>Groq (Primary):</strong></p>
                                <ul className="list-disc ml-6 space-y-1">
                                    <li>Visit: <a href="https://console.groq.com/keys" className="text-blue-600 underline">console.groq.com/keys</a></li>
                                    <li>Free tier: 6,000 tokens/minute</li>
                                    <li>Add to .env.local: <code className="bg-gray-200 px-2 py-1 rounded">GROQ_API_KEY=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</code></li>
                                </ul>

                                <p className="mb-2 mt-4"><strong>Hugging Face (Backup):</strong></p>
                                <ul className="list-disc ml-6 space-y-1">
                                    <li>Visit: <a href="https://huggingface.co/settings/tokens" className="text-blue-600 underline">huggingface.co/settings/tokens</a></li>
                                    <li>Free tier: 1,000 requests/month</li>
                                    <li>Add to .env.local: <code className="bg-gray-200 px-2 py-1 rounded">HUGGINGFACE_API_KEY=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</code></li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">2. Local LLM Setup (Optional)</h3>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <p className="mb-2"><strong>Ollama Installation:</strong></p>
                                <ul className="list-disc ml-6 space-y-1">
                                    <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">setup-llm.bat</code></li>
                                    <li>Or manually install from: <a href="https://ollama.ai" className="text-blue-600 underline">ollama.ai</a></li>
                                    <li>Models will be downloaded automatically (~7GB total)</li>
                                    <li>Provides offline privacy and unlimited usage</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">3. System Requirements</h3>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium">Your Hardware:</p>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>✅ 8GB RAM (sufficient)</li>
                                            <li>✅ GTX 1650 (supported)</li>
                                            <li>✅ i5 Gen5 (good performance)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-medium">Recommended Models:</p>
                                        <ul className="list-disc ml-6 space-y-1">
                                            <li>phi3:mini (2.3GB) - Fast</li>
                                            <li>mistral:7b (4.1GB) - Quality</li>
                                            <li>gemma:2b (1.6GB) - Backup</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
