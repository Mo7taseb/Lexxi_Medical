import LLMTester from '@/components/LLMTester';
import Image from 'next/image';

export default function TestPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
            {/* Compact Modern Header with Large Logo */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/30 border-b border-white/20 shadow-lg shadow-black/5">
                <div className="container mx-auto py-3">
                    <div className="flex items-center justify-center gap-4">
                        {/* Large Logo - Compact Container */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 rounded-2xl blur-md scale-105 opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative bg-white/40 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/50">
                                <Image
                                    src="/logo.png"
                                    alt="Lexxi Medical Logo"
                                    width={160}
                                    height={160}
                                    className="rounded-xl object-contain bg-transparent drop-shadow-lg"
                                    priority
                                />
                                {/* Subtle glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>

                        {/* Compact Branding */}
                        <div className="text-left">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                                Lexxi Medical
                            </h1>
                            <p className="text-sm text-teal-600 font-medium">LLM Integration Testing</p>
                            <div className="flex items-center gap-1 mt-1">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-500">70B Models Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-12 px-6">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Testing Environment • Groq 70B Models
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Test AI Enhancement Capabilities
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Test our powerful 70B parameter Groq models for enhanced Arabic medical transcription
                        and professional medical note generation.
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

                {/* NEW: Whisper Testing Section */}
                <div className="mt-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-2xl p-6 shadow-lg">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-800 mb-2">🎤 Groq Whisper Testing</h2>
                        <p className="text-blue-600">Test the new cloud transcription feature</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50">
                            <h3 className="font-bold text-gray-800 mb-3">📊 Transcription Options</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                                    <span className="font-medium">☁️ Cloud (Groq)</span>
                                    <span className="text-sm text-blue-600">5-15s</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                    <span className="font-medium">🏥 Medical (Local)</span>
                                    <span className="text-sm text-gray-600">1-3min</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                    <span className="font-medium">🎯 Accurate (Local)</span>
                                    <span className="text-sm text-gray-600">30-60s</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                                    <span className="font-medium">⚡ Fast (Local)</span>
                                    <span className="text-sm text-gray-600">7-15s</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50">
                            <h3 className="font-bold text-gray-800 mb-3">🚀 How to Test</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p><strong>1.</strong> Set your Groq API key in .env.local</p>
                                <p><strong>2.</strong> Go to main app and record audio</p>
                                <p><strong>3.</strong> Select "☁️ سحابي" (Cloud) mode</p>
                                <p><strong>4.</strong> Compare speed with local modes</p>
                            </div>

                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">
                                    <strong>✨ New Features:</strong><br />
                                    • Ultra-fast cloud transcription<br />
                                    • Automatic fallback to local<br />
                                    • Same medical corrections<br />
                                    • Smart UI that shows availability
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
