// Medical Note Change Tracking Service
// Main service for tracking AI-generated notes and doctor edits

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  ChangeTrackingConfig, 
  NoteGeneration, 
  NoteEdit, 
  SectionDiff,
  TrackGenerationRequest,
  TrackGenerationResponse,
  TrackEditRequest,
  TrackEditResponse,
  MedicalSection,
  ChangeTrackingState
} from '@/types/changeTracking';
import { DataRedactionService } from './dataRedaction';
import { DiffAnalysisService } from './diffAnalysis';

export class ChangeTrackingService {
  private static instance: ChangeTrackingService;
  private supabase: SupabaseClient;
  private redactionService: DataRedactionService;
  private diffService: DiffAnalysisService;
  private config: ChangeTrackingConfig;
  
  private constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    this.redactionService = DataRedactionService.getInstance();
    this.diffService = DiffAnalysisService.getInstance();
    this.config = this.loadConfig();
  }

  public static getInstance(): ChangeTrackingService {
    if (!ChangeTrackingService.instance) {
      ChangeTrackingService.instance = new ChangeTrackingService();
    }
    return ChangeTrackingService.instance;
  }

  /**
   * Initialize doctor session and get anonymous ID
   */
  public async initializeDoctorSession(): Promise<string> {
    let state = this.getStoredState();
    
    if (!state.doctorAnonId) {
      // Generate new anonymous ID
      state.doctorAnonId = crypto.randomUUID();
      state.deviceFingerprint = this.generateDeviceFingerprint();
      state.sessionCount = 1;
      state.lastSync = new Date().toISOString();
      
      // Store in database
      await this.supabase
        .from('doctor_sessions')
        .insert({
          doctor_anon_id: state.doctorAnonId,
          device_fingerprint: state.deviceFingerprint,
          session_count: state.sessionCount
        });
    } else {
      // Update existing session
      state.sessionCount += 1;
      state.lastSync = new Date().toISOString();
      
      await this.supabase
        .from('doctor_sessions')
        .update({
          last_seen_at: new Date().toISOString(),
          session_count: state.sessionCount
        })
        .eq('doctor_anon_id', state.doctorAnonId);
    }
    
    this.saveState(state);
    this.config.doctorAnonId = state.doctorAnonId;
    
    return state.doctorAnonId;
  }

  /**
   * Track initial note generation
   */
  public async trackNoteGeneration(request: TrackGenerationRequest): Promise<TrackGenerationResponse> {
    try {
      if (!this.config.enabled || !this.config.consentGiven) {
        return { success: false, generationId: '', message: 'Tracking disabled or consent not given' };
      }

      // Ensure doctor session is initialized
      if (!this.config.doctorAnonId) {
        await this.initializeDoctorSession();
      }

      // Redact PHI from transcript and note
      const redactedTranscript = this.redactionService.redactTranscript(request.transcript, request.language);
      const redactedNote = this.redactionService.redactMedicalNote(request.generatedNote, request.language);
      const redactedSections = this.redactionService.redactMedicalSections(request.generatedSections, request.language);

      // Validate redaction
      const transcriptValidation = this.redactionService.validateRedaction(redactedTranscript, request.language);
      const noteValidation = this.redactionService.validateRedaction(redactedNote, request.language);

      if (!transcriptValidation.isValid || !noteValidation.isValid) {
        console.warn('Potential PHI detected after redaction:', {
          transcript: transcriptValidation.potentialLeaks,
          note: noteValidation.potentialLeaks
        });
      }

      // Store in database
      const { data, error } = await this.supabase
        .from('note_generations')
        .insert({
          session_id: request.sessionId,
          doctor_anon_id: this.config.doctorAnonId,
          transcript_redacted: redactedTranscript,
          note_type: request.noteType,
          language: request.language,
          generated_note: redactedNote,
          generated_sections: redactedSections,
          generation_source: request.generationSource,
          generation_confidence: request.generationConfidence,
          template_used: request.templateUsed,
          processing_time_ms: request.processingTimeMs,
          model_version: this.getModelVersion(request.generationSource)
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to track note generation:', error);
        return { success: false, generationId: '', message: error.message };
      }

      return {
        success: true,
        generationId: data.id,
        message: 'Note generation tracked successfully'
      };

    } catch (error) {
      console.error('Error tracking note generation:', error);
      return { 
        success: false, 
        generationId: '', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Track note edit (when doctor saves)
   */
  public async trackNoteEdit(request: TrackEditRequest): Promise<TrackEditResponse> {
    try {
      if (!this.config.enabled || !this.config.consentGiven) {
        return { 
          success: false, 
          editId: '', 
          changesDetected: 0, 
          sectionsChanged: [],
          message: 'Tracking disabled or consent not given' 
        };
      }

      // Get original note generation
      const { data: generation, error: fetchError } = await this.supabase
        .from('note_generations')
        .select('*')
        .eq('id', request.generationId)
        .single();

      if (fetchError || !generation) {
        return { 
          success: false, 
          editId: '', 
          changesDetected: 0, 
          sectionsChanged: [],
          message: 'Original generation not found' 
        };
      }

      // Redact PHI from final content
      const redactedFinalNote = this.redactionService.redactMedicalNote(request.finalNote, generation.language);
      const redactedFinalSections = this.redactionService.redactMedicalSections(request.finalSections, generation.language);

      // Analyze differences
      const noteDiff = this.diffService.analyzeMedicalNoteDiff(
        generation.generated_note,
        redactedFinalNote,
        generation.language
      );

      const sectionDiffs = this.diffService.analyzeSectionDiffs(
        generation.generated_sections,
        redactedFinalSections,
        generation.language
      );

      // Calculate summary statistics
      const changeSummary = this.diffService.generateChangeSummary(noteDiff);
      const sectionsChanged = Object.keys(sectionDiffs).filter(
        sectionId => sectionDiffs[sectionId].similarity < 0.95 // Less than 95% similar
      );

      // Create changes by section summary
      const changesBySection: Record<string, { added: number; removed: number }> = {};
      for (const [sectionId, diff] of Object.entries(sectionDiffs)) {
        changesBySection[sectionId] = {
          added: diff.additions.length,
          removed: diff.deletions.length
        };
      }

      // Store note edit
      const { data: noteEditData, error: editError } = await this.supabase
        .from('note_edits')
        .insert({
          note_generation_id: request.generationId,
          final_note: redactedFinalNote,
          final_sections: redactedFinalSections,
          sections_changed: sectionsChanged,
          total_changes: changeSummary.totalChanges,
          changes_by_section: changesBySection,
          edit_duration_seconds: request.editDurationSeconds,
          character_changes: changeSummary.characterDifference,
          word_changes: changeSummary.additionsCount - changeSummary.deletionsCount
        })
        .select()
        .single();

      if (editError) {
        console.error('Failed to store note edit:', editError);
        return { 
          success: false, 
          editId: '', 
          changesDetected: 0, 
          sectionsChanged: [],
          message: editError.message 
        };
      }

      // Store detailed section diffs
      const sectionDiffInserts = Object.entries(sectionDiffs).map(([sectionId, diff]) => {
        const originalSection = generation.generated_sections.find((s: any) => s.id === sectionId);
        const finalSection = redactedFinalSections.find(s => s.id === sectionId);
        
        return {
          note_edit_id: noteEditData.id,
          section_id: sectionId,
          section_title: finalSection?.title || originalSection?.title,
          section_type: finalSection?.type || originalSection?.type,
          original_content: originalSection?.content || '',
          final_content: finalSection?.content || '',
          content_diff: diff,
          change_type: this.categorizeChange(diff),
          medical_terms_changed: this.diffService.extractChangedMedicalTerms(
            originalSection?.content || '',
            finalSection?.content || '',
            generation.language
          )
        };
      });

      if (sectionDiffInserts.length > 0) {
        const { error: sectionError } = await this.supabase
          .from('section_diffs')
          .insert(sectionDiffInserts);

        if (sectionError) {
          console.warn('Failed to store section diffs:', sectionError);
        }
      }

      // Update generation status
      await this.supabase
        .from('note_generations')
        .update({
          is_edited: true,
          edit_completed_at: new Date().toISOString()
        })
        .eq('id', request.generationId);

      return {
        success: true,
        editId: noteEditData.id,
        changesDetected: changeSummary.totalChanges,
        sectionsChanged,
        message: 'Note edit tracked successfully'
      };

    } catch (error) {
      console.error('Error tracking note edit:', error);
      return { 
        success: false, 
        editId: '', 
        changesDetected: 0, 
        sectionsChanged: [],
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update consent status
   */
  public updateConsent(consentGiven: boolean): void {
    this.config.consentGiven = consentGiven;
    this.config.enabled = consentGiven;
    
    const state = this.getStoredState();
    state.consentGiven = consentGiven;
    this.saveState(state);
  }

  /**
   * Get current tracking configuration
   */
  public getConfig(): ChangeTrackingConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable tracking
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled && this.config.consentGiven;
  }

  /**
   * Get tracking statistics
   */
  public async getTrackingStats(): Promise<{
    totalGenerations: number;
    totalEdits: number;
    averageEditTime: number;
    topEditedSections: Array<{ section: string; frequency: number }>;
  }> {
    try {
      // Get generation count
      const { count: generationsCount } = await this.supabase
        .from('note_generations')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_anon_id', this.config.doctorAnonId);

      // Get edit count and average time
      const { data: edits } = await this.supabase
        .from('note_edits')
        .select('edit_duration_seconds')
        .not('edit_duration_seconds', 'is', null);

      const averageEditTime = edits && edits.length > 0
        ? edits.reduce((sum: number, edit: any) => sum + (edit.edit_duration_seconds || 0), 0) / edits.length
        : 0;

      // Get most edited sections
      const { data: sectionStats } = await this.supabase
        .from('section_diffs')
        .select('section_type')
        .not('section_type', 'is', null);

      const sectionFrequency: Record<string, number> = {};
      sectionStats?.forEach((stat: any) => {
        sectionFrequency[stat.section_type] = (sectionFrequency[stat.section_type] || 0) + 1;
      });

      const topEditedSections = Object.entries(sectionFrequency)
        .map(([section, frequency]) => ({ section, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5);

      return {
        totalGenerations: generationsCount || 0,
        totalEdits: edits?.length || 0,
        averageEditTime: Math.round(averageEditTime),
        topEditedSections
      };

    } catch (error) {
      console.error('Error getting tracking stats:', error);
      return {
        totalGenerations: 0,
        totalEdits: 0,
        averageEditTime: 0,
        topEditedSections: []
      };
    }
  }

  // Private helper methods

  private loadConfig(): ChangeTrackingConfig {
    const state = this.getStoredState();
    return {
      enabled: state.consentGiven,
      consentGiven: state.consentGiven,
      doctorAnonId: state.doctorAnonId,
      redactionLevel: 'standard',
      includeTimings: true
    };
  }

  private getStoredState(): ChangeTrackingState {
    try {
      const stored = localStorage.getItem('lexxi-change-tracking');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored tracking state:', error);
    }

    return {
      doctorAnonId: '',
      consentGiven: false,
      deviceFingerprint: '',
      sessionCount: 0,
      lastSync: new Date().toISOString(),
      pendingChanges: []
    };
  }

  private saveState(state: ChangeTrackingState): void {
    try {
      localStorage.setItem('lexxi-change-tracking', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save tracking state:', error);
    }
  }

  private generateDeviceFingerprint(): string {
    const components = [
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.language,
      navigator.platform
    ];
    
    return btoa(components.join('|')).slice(0, 16);
  }

  private getModelVersion(source: string): string {
    const versions: Record<string, string> = {
      'groq': 'llama-3.1-70b-versatile',
      'openai': 'gpt-3.5-turbo',
      'fallback': 'template-v1.0'
    };
    return versions[source] || 'unknown';
  }

  private categorizeChange(diff: any): 'addition' | 'deletion' | 'modification' | 'no_change' {
    if (diff.additions.length > 0 && diff.deletions.length > 0) return 'modification';
    if (diff.additions.length > 0) return 'addition';
    if (diff.deletions.length > 0) return 'deletion';
    return 'no_change';
  }
}
