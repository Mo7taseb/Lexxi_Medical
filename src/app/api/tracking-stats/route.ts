// API Route: Get Tracking Statistics
// Endpoint to retrieve anonymous tracking statistics for a doctor

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Missing doctorId parameter' },
        { status: 400 }
      );
    }

    // Get statistics for this doctor
    const [
      generationsResult,
      editsResult,
      sectionsResult
    ] = await Promise.all([
      // Total generations
      supabase
        .from('note_generations')
        .select('id, created_at, edit_completed_at')
        .eq('doctor_anon_id', doctorId),
      
      // Total edits
      supabase
        .from('note_edits')
        .select('id, edit_duration_seconds')
        .eq('note_generation_id', doctorId),
      
      // Section changes
      supabase
        .from('section_diffs')
        .select('id, section_type, change_type')
    ]);

    const generations = generationsResult.data || [];
    const edits = editsResult.data || [];
    const sections = sectionsResult.data || [];

    // Calculate statistics
    const totalGenerations = generations.length;
    const totalEdits = edits.length;
    const averageEditTime = edits.length > 0 
      ? Math.round(edits.reduce((sum, edit) => sum + (edit.edit_duration_seconds || 0), 0) / edits.length)
      : 0;

    // Most edited section types
    const sectionCounts = sections.reduce((acc: Record<string, number>, section) => {
      if (section.section_type) {
        acc[section.section_type] = (acc[section.section_type] || 0) + 1;
      }
      return acc;
    }, {});

    const topSections = Object.entries(sectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([section, count]) => ({ section, count }));

    return NextResponse.json({
      totalGenerations,
      totalEdits,
      averageEditTime,
      topSections,
      editRate: totalGenerations > 0 ? Math.round((totalEdits / totalGenerations) * 100) : 0
    });

  } catch (error) {
    console.error('Error fetching tracking stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
