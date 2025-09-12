'use client';

import React, { useState, useEffect } from 'react';
import { ChangeTrackingConsent } from '@/components/ChangeTrackingConsent';
import { createClient } from '@supabase/supabase-js';
import { Eye, Database, Loader2, RefreshCw } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TrackingTestPage() {
    const [data, setData] = useState<any>({
        doctorSessions: [],
        noteGenerations: [],
        noteEdits: [],
        sectionDiffs: [],
        learningInsights: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTrackingData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch data from all tracking tables
            const [
                doctorSessionsRes,
                noteGenerationsRes,
                noteEditsRes,
                sectionDiffsRes,
                learningInsightsRes
            ] = await Promise.all([
                supabase.from('doctor_sessions').select('*').order('created_at', { ascending: false }),
                supabase.from('note_generations').select('*').order('created_at', { ascending: false }),
                supabase.from('note_edits').select('*').order('created_at', { ascending: false }),
                supabase.from('section_diffs').select('*').order('created_at', { ascending: false }),
                supabase.from('learning_insights').select('*').order('created_at', { ascending: false })
            ]);

            setData({
                doctorSessions: doctorSessionsRes.data || [],
                noteGenerations: noteGenerationsRes.data || [],
                noteEdits: noteEditsRes.data || [],
                sectionDiffs: sectionDiffsRes.data || [],
                learningInsights: learningInsightsRes.data || []
            });

            if (doctorSessionsRes.error) throw doctorSessionsRes.error;
            if (noteGenerationsRes.error) throw noteGenerationsRes.error;
            if (noteEditsRes.error) throw noteEditsRes.error;
            if (sectionDiffsRes.error) throw sectionDiffsRes.error;
            if (learningInsightsRes.error) throw learningInsightsRes.error;

        } catch (err: any) {
            setError(err.message || 'Failed to fetch tracking data');
            console.error('Error fetching tracking data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrackingData();
    }, []);

    const TableSection = ({ title, data, icon: Icon }: { title: string; data: any[]; icon: any }) => (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {data.length} records
                    </span>
                </div>
            </div>
            <div className="p-6">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No data yet. Generate and edit some medical notes to see tracking data here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.slice(0, 3).map((record, index) => (
                            <div key={record.id || index} className="p-4 bg-gray-50 rounded-lg">
                                <div className="text-sm font-mono text-gray-600 mb-2">
                                    ID: {record.id}
                                </div>
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                    {JSON.stringify(record, null, 2)}
                                </pre>
                            </div>
                        ))}
                        {data.length > 3 && (
                            <div className="text-center text-sm text-gray-500">
                                ... and {data.length - 3} more records
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Change Tracking System Test
                    </h1>
                    <p className="text-gray-600">
                        Monitor medical note change tracking data in real-time. Generate and edit notes in the main app to see data appear here.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mb-8 flex gap-4">
                    <button
                        onClick={fetchTrackingData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Refresh Data
                    </button>

                    <a
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Eye className="h-4 w-4" />
                        Go to Main App
                    </a>
                </div>

                {/* Statistics Summary */}
                <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{data.doctorSessions.length}</div>
                            <div className="text-sm text-gray-600">Doctor Sessions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{data.noteGenerations.length}</div>
                            <div className="text-sm text-gray-600">Notes Generated</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">{data.noteEdits.length}</div>
                            <div className="text-sm text-gray-600">Notes Edited</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600">
                                {(() => {
                                    // Count unique note edits (not individual diffs)
                                    const uniqueEditIds = new Set(data.sectionDiffs.map((diff: any) => diff.note_edit_id));
                                    return uniqueEditIds.size > 0 ? data.sectionDiffs.length : 0;
                                })()}
                            </div>
                            <div className="text-sm text-gray-600">Section Changes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">{data.learningInsights.length}</div>
                            <div className="text-sm text-gray-600">Learning Insights</div>
                        </div>
                    </div>

                    {/* Validation Indicators */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Validation</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${data.noteEdits.every((edit: any) =>
                                    data.noteGenerations.some((gen: any) => gen.id === edit.note_generation_id)
                                ) ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                <span className="text-gray-600">
                                    Edit-Generation Links: {data.noteEdits.filter((edit: any) =>
                                        data.noteGenerations.some((gen: any) => gen.id === edit.note_generation_id)
                                    ).length}/{data.noteEdits.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${data.sectionDiffs.every((diff: any) =>
                                    data.noteEdits.some((edit: any) => edit.id === diff.note_edit_id)
                                ) ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                <span className="text-gray-600">
                                    Diff-Edit Links: {data.sectionDiffs.filter((diff: any) =>
                                        data.noteEdits.some((edit: any) => edit.id === diff.note_edit_id)
                                    ).length}/{data.sectionDiffs.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${data.noteGenerations.filter((gen: any) => gen.is_edited).length === data.noteEdits.length
                                        ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                                <span className="text-gray-600">
                                    Marked as Edited: {data.noteGenerations.filter((gen: any) => gen.is_edited).length}/{data.noteGenerations.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${new Set(data.noteGenerations.map((gen: any) => gen.doctor_anon_id)).size === data.doctorSessions.length
                                        ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                                <span className="text-gray-600">
                                    Unique Doctors: {new Set(data.noteGenerations.map((gen: any) => gen.doctor_anon_id)).size}
                                </span>
                            </div>
                        </div>

                        {/* Data Quality Metrics */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Data Quality Metrics</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${data.noteEdits.filter((edit: any) => edit.edit_duration_seconds > 0).length / Math.max(data.noteEdits.length, 1) > 0.5
                                            ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                    <span className="text-gray-600">
                                        Timed Edits: {data.noteEdits.filter((edit: any) => edit.edit_duration_seconds > 0).length}/{data.noteEdits.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${data.noteEdits.filter((edit: any) => Math.abs(edit.character_changes / Math.max(edit.word_changes, 1)) < 10).length / Math.max(data.noteEdits.length, 1) > 0.8
                                            ? 'bg-green-500' : 'bg-yellow-500'
                                        }`}></div>
                                    <span className="text-gray-600">
                                        Realistic Ratios: {data.noteEdits.filter((edit: any) => edit.word_changes !== 0 && Math.abs(edit.character_changes / edit.word_changes) < 10 && Math.abs(edit.character_changes / edit.word_changes) > 2).length}/{data.noteEdits.length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${data.noteEdits.filter((edit: any) => edit.total_changes > 0).length === data.noteEdits.length
                                            ? 'bg-green-500' : 'bg-red-500'
                                        }`}></div>
                                    <span className="text-gray-600">
                                        Substantial Edits: {data.noteEdits.filter((edit: any) => edit.total_changes > 0).length}/{data.noteEdits.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="text-red-800 font-medium mb-2">Database Connection Error</h3>
                        <p className="text-red-700 text-sm">{error}</p>
                        <p className="text-red-600 text-xs mt-2">
                            Make sure you've run the SQL migration in your Supabase project.
                        </p>
                    </div>
                )}

                {/* Consent Component */}
                <div className="mb-8">
                    <ChangeTrackingConsent />
                </div>

                {/* Data Tables */}
                <div className="space-y-8">
                    <TableSection
                        title="Doctor Sessions"
                        data={data.doctorSessions}
                        icon={Eye}
                    />

                    <TableSection
                        title="Note Generations"
                        data={data.noteGenerations}
                        icon={Database}
                    />

                    <TableSection
                        title="Note Edits"
                        data={data.noteEdits}
                        icon={Eye}
                    />

                    <TableSection
                        title="Section Diffs"
                        data={data.sectionDiffs}
                        icon={Database}
                    />

                    <TableSection
                        title="Learning Insights"
                        data={data.learningInsights}
                        icon={Eye}
                    />
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-blue-900 font-semibold mb-3">How to Test the Change Tracking System:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                        <li>Make sure you've run the SQL migration in your Supabase project</li>
                        <li>Go to the main app (/) and record or upload audio</li>
                        <li>Generate a medical note using AI</li>
                        <li>Edit the generated note (add/remove/modify content)</li>
                        <li>Come back to this page and click "Refresh Data"</li>
                        <li>You should see tracking data appear in the tables above</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
