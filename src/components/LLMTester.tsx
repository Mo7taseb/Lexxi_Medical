'use client';

import { useState } from 'react';

interface LLMTestResult {
    text: string;
    source: string;
    confidence: number;
    responseTime: number;
}

export default function LLMTester() {
    const [testTranscript, setTestTranscript] = useState('المريض يشكو من صداع شديد منذ يومين مع غثيان');
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [noteType, setNoteType] = useState('soap');
    const [enhancementResult, setEnhancementResult] = useState<LLMTestResult | null>(null);
    const [noteResult, setNoteResult] = useState<LLMTestResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);

    const checkOllamaStatus = async () => {
        try {
            const response = await fetch('/api/llm-status');
            const data = await response.json();
            setOllamaStatus(data.ollama);
        } catch (error) {
            setOllamaStatus(false);
        }
    };

    const testTranscriptEnhancement = async () => {
        setLoading(true);
        const startTime = Date.now();

        try {
            const response = await fetch('/api/enhance-transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: testTranscript, language })
            });

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            setEnhancementResult({
                text: data.enhanced,
                source: data.source,
                confidence: data.confidence,
                responseTime
            });
        } catch (error) {
            console.error('Enhancement test failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const testNoteGeneration = async () => {
        setLoading(true);
        const startTime = Date.now();

        try {
            const response = await fetch('/api/generate-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transcript: enhancementResult?.text || testTranscript,
                    noteType,
                    language
                })
            });

            const data = await response.json();
            const responseTime = Date.now() - startTime;

            setNoteResult({
                text: data.note,
                source: data.source,
                confidence: data.confidence,
                responseTime
            });
        } catch (error) {
            console.error('Note generation test failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">🧪 LLM Integration Tester</h2>

                {/* Ollama Status Check */}
                <div className="mb-6">
                    <button
                        onClick={checkOllamaStatus}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Check Ollama Status
                    </button>
                    {ollamaStatus !== null && (
                        <span className={`ml-3 px-3 py-1 rounded text-sm ${ollamaStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            Ollama: {ollamaStatus ? '✅ Running' : '❌ Not Available'}
                        </span>
                    )}
                </div>

                {/* Test Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}
                            className="w-full p-2 border rounded text-gray-800"
                        >
                            <option value="ar">Arabic</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">Note Type</label>
                        <select
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value)}
                            className="w-full p-2 border rounded text-gray-800"
                        >
                            <option value="soap">SOAP Note</option>
                            <option value="progress">Progress Note</option>
                            <option value="consultation">Consultation</option>
                            <option value="discharge">Discharge Summary</option>
                            <option value="freeform">Free Form</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={testTranscriptEnhancement}
                            disabled={loading}
                            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                        >
                            {loading ? '⏳ Testing...' : '🔄 Test Enhancement'}
                        </button>
                    </div>
                </div>

                {/* Test Transcript */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Test Transcript</label>
                    <textarea
                        value={testTranscript}
                        onChange={(e) => setTestTranscript(e.target.value)}
                        className="w-full p-3 border rounded h-24 text-gray-800"
                        placeholder="Enter test transcript..."
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                </div>

                {/* Enhancement Results */}
                {enhancementResult && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2 text-gray-800">📝 Enhancement Result</h3>
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm text-gray-700">
                            <div>
                                <span className="font-medium">Source:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${enhancementResult.source === 'groq' ? 'bg-green-100 text-green-800' :
                                    enhancementResult.source === 'local' ? 'bg-blue-100 text-blue-800' :
                                        enhancementResult.source === 'huggingface' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {enhancementResult.source}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">Confidence:</span> {(enhancementResult.confidence * 100).toFixed(0)}%
                            </div>
                            <div>
                                <span className="font-medium">Time:</span> {enhancementResult.responseTime}ms
                            </div>
                        </div>
                        <div
                            className="p-3 bg-white rounded border text-gray-800"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        >
                            {enhancementResult.text}
                        </div>
                        <button
                            onClick={testNoteGeneration}
                            disabled={loading}
                            className="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                        >
                            {loading ? '⏳ Generating...' : '📋 Generate Note'}
                        </button>
                    </div>
                )}

                {/* Note Generation Results */}
                {noteResult && (
                    <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-semibold mb-2 text-gray-800">🏥 Generated Medical Note</h3>
                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm text-gray-700">
                            <div>
                                <span className="font-medium">Source:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${noteResult.source === 'groq' ? 'bg-green-100 text-green-800' :
                                    noteResult.source === 'local' ? 'bg-blue-100 text-blue-800' :
                                        noteResult.source === 'openai' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {noteResult.source}
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">Confidence:</span> {(noteResult.confidence * 100).toFixed(0)}%
                            </div>
                            <div>
                                <span className="font-medium">Time:</span> {noteResult.responseTime}ms
                            </div>
                        </div>
                        <div
                            className="p-4 bg-white rounded border whitespace-pre-wrap font-mono text-sm text-gray-800"
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        >
                            {noteResult.text}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
