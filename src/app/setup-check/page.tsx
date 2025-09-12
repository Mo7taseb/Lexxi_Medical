'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Database, Settings, Play } from 'lucide-react';

export default function SetupCheckPage() {
    const [checks, setChecks] = useState({
        envVars: false,
        supabaseConnection: false,
        databaseTables: false,
        changeTrackingService: false
    });
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<any>({});

    useEffect(() => {
        runSetupChecks();
    }, []);

    const runSetupChecks = async () => {
        setLoading(true);
        const results = {
            envVars: false,
            supabaseConnection: false,
            databaseTables: false,
            changeTrackingService: false
        };
        const checkDetails: any = {};

        try {
            // Check 1: Environment variables
            const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
            const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            results.envVars = hasSupabaseUrl && hasSupabaseKey;
            checkDetails.envVars = {
                hasUrl: hasSupabaseUrl,
                hasKey: hasSupabaseKey,
                url: hasSupabaseUrl ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'Missing',
                keyPreview: hasSupabaseKey ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)}...` : 'Missing'
            };

            if (results.envVars) {
                // Check 2: Supabase connection
                try {
                    const { createClient } = await import('@supabase/supabase-js');
                    const supabase = createClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    );

                    // Try a simple query to test connection
                    const { error: connectionError } = await supabase.from('doctor_sessions').select('count').limit(1);

                    if (!connectionError) {
                        results.supabaseConnection = true;
                        checkDetails.supabaseConnection = { status: 'Connected successfully' };

                        // Check 3: Database tables
                        try {
                            const tableChecks = await Promise.all([
                                supabase.from('doctor_sessions').select('count').limit(1),
                                supabase.from('note_generations').select('count').limit(1),
                                supabase.from('note_edits').select('count').limit(1),
                                supabase.from('section_diffs').select('count').limit(1),
                                supabase.from('learning_insights').select('count').limit(1)
                            ]);

                            const allTablesExist = tableChecks.every(result => !result.error);
                            results.databaseTables = allTablesExist;
                            checkDetails.databaseTables = {
                                tables: {
                                    doctor_sessions: !tableChecks[0].error,
                                    note_generations: !tableChecks[1].error,
                                    note_edits: !tableChecks[2].error,
                                    section_diffs: !tableChecks[3].error,
                                    learning_insights: !tableChecks[4].error
                                },
                                errors: tableChecks.map(result => result.error?.message).filter(Boolean)
                            };

                            // Check 4: Change tracking service
                            try {
                                const changeTrackingModule = await import('@/services/changeTracking');
                                results.changeTrackingService = true;
                                checkDetails.changeTrackingService = {
                                    status: 'Service imported successfully',
                                    exports: Object.keys(changeTrackingModule)
                                };
                            } catch (err: any) {
                                checkDetails.changeTrackingService = { error: err.message };
                            }

                        } catch (err: any) {
                            checkDetails.databaseTables = { error: err.message };
                        }
                    } else {
                        checkDetails.supabaseConnection = { error: connectionError.message };
                    }
                } catch (err: any) {
                    checkDetails.supabaseConnection = { error: err.message };
                }
            }

        } catch (err: any) {
            checkDetails.general = { error: err.message };
        }

        setChecks(results);
        setDetails(checkDetails);
        setLoading(false);
    };

    const CheckItem = ({ title, description, passed, details: itemDetails }: {
        title: string;
        description: string;
        passed: boolean;
        details: any;
    }) => (
        <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    {passed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                        <XCircle className="h-6 w-6 text-red-600" />
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{description}</p>

                    {itemDetails && (
                        <div className="bg-gray-50 rounded-md p-3">
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(itemDetails, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className={`mt-3 text-sm font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}>
                        {passed ? '✓ Passed' : '✗ Failed'}
                    </div>
                </div>
            </div>
        </div>
    );

    const allPassed = Object.values(checks).every(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Change Tracking Setup Check
                    </h1>
                    <p className="text-gray-600">
                        Verify that your change tracking system is properly configured and ready to use.
                    </p>
                </div>

                {/* Overall Status */}
                <div className={`mb-8 p-6 rounded-lg border-2 ${loading ? 'border-yellow-200 bg-yellow-50' :
                        allPassed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <AlertCircle className="h-8 w-8 text-yellow-600 animate-pulse" />
                        ) : allPassed ? (
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                            <XCircle className="h-8 w-8 text-red-600" />
                        )}
                        <div>
                            <h2 className={`text-xl font-bold ${loading ? 'text-yellow-800' :
                                    allPassed ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {loading ? 'Checking Setup...' :
                                    allPassed ? 'Setup Complete!' : 'Setup Issues Found'}
                            </h2>
                            <p className={`text-sm ${loading ? 'text-yellow-700' :
                                    allPassed ? 'text-green-700' : 'text-red-700'
                                }`}>
                                {loading ? 'Running configuration checks...' :
                                    allPassed ? 'Your change tracking system is ready to use.' :
                                        'Please fix the issues below before using the system.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-8 flex gap-4">
                    <button
                        onClick={runSetupChecks}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Settings className="h-4 w-4" />
                        Re-run Checks
                    </button>

                    {allPassed && (
                        <>
                            <a
                                href="/tracking-test"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Database className="h-4 w-4" />
                                View Tracking Data
                            </a>

                            <a
                                href="/"
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                <Play className="h-4 w-4" />
                                Start Using App
                            </a>
                        </>
                    )}
                </div>

                {/* Individual Checks */}
                <div className="space-y-6">
                    <CheckItem
                        title="Environment Variables"
                        description="Checking if Supabase URL and API key are configured in environment variables."
                        passed={checks.envVars}
                        details={details.envVars}
                    />

                    <CheckItem
                        title="Supabase Connection"
                        description="Testing connection to your Supabase database."
                        passed={checks.supabaseConnection}
                        details={details.supabaseConnection}
                    />

                    <CheckItem
                        title="Database Tables"
                        description="Verifying that all required tracking tables exist in the database."
                        passed={checks.databaseTables}
                        details={details.databaseTables}
                    />

                    <CheckItem
                        title="Change Tracking Service"
                        description="Checking if the change tracking service can be imported and used."
                        passed={checks.changeTrackingService}
                        details={details.changeTrackingService}
                    />
                </div>

                {/* Setup Instructions */}
                {!allPassed && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-blue-900 font-semibold mb-3">Setup Instructions:</h3>
                        <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                            <li>Create a Supabase project at <a href="https://supabase.com" className="underline">supabase.com</a></li>
                            <li>Copy your project URL and API key</li>
                            <li>Add them to your .env.local file as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                            <li>Go to SQL Editor in Supabase and run the migration from supabase/migrations/001_create_note_tracking_tables.sql</li>
                            <li>Restart your development server</li>
                            <li>Re-run this setup check</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}
