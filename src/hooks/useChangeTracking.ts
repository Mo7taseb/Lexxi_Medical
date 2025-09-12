// Change Tracking React Hook
// Client-side hook for managing change tracking

import { useState, useEffect, useCallback } from 'react';
import { ChangeTrackingConfig, TrackGenerationRequest, TrackEditRequest } from '@/types/changeTracking';

interface UseChangeTrackingProps {
  enabled?: boolean;
  consentGiven?: boolean;
}

interface ChangeTrackingHook {
  config: ChangeTrackingConfig;
  isTracking: boolean;
  updateConsent: (consent: boolean) => void;
  trackGeneration: (data: Omit<TrackGenerationRequest, 'sessionId'>) => Promise<string | null>;
  trackEdit: (generationId: string, data: Omit<TrackEditRequest, 'generationId'>) => Promise<boolean>;
  getStats: () => Promise<any>;
}

export function useChangeTracking(props: UseChangeTrackingProps = {}): ChangeTrackingHook {
  const [config, setConfig] = useState<ChangeTrackingConfig>({
    enabled: false,
    consentGiven: false,
    doctorAnonId: '',
    redactionLevel: 'standard',
    includeTimings: true
  });

  const [isTracking, setIsTracking] = useState(false);

  // Initialize tracking configuration
  useEffect(() => {
    initializeTracking();
  }, []);

  const initializeTracking = async () => {
    try {
      // Load saved configuration
      const saved = localStorage.getItem('lexxi-change-tracking');
      let newConfig: ChangeTrackingConfig;
      
      if (saved) {
        const parsedConfig = JSON.parse(saved);
        newConfig = {
          ...config,
          doctorAnonId: parsedConfig.doctorAnonId || crypto.randomUUID(),
          consentGiven: parsedConfig.consentGiven ?? (props.consentGiven || false),
          enabled: parsedConfig.consentGiven ?? (props.consentGiven || false),
          redactionLevel: 'standard',
          includeTimings: true
        };
      } else {
        // First time setup
        newConfig = {
          ...config,
          doctorAnonId: crypto.randomUUID(),
          consentGiven: props.consentGiven || false,
          enabled: props.consentGiven || false,
          redactionLevel: 'standard',
          includeTimings: true
        };
      }
      
      setConfig(newConfig);
      saveConfig(newConfig);
      
      console.log('🔧 Change tracking initialized:', {
        enabled: newConfig.enabled,
        consentGiven: newConfig.consentGiven,
        doctorAnonId: newConfig.doctorAnonId.slice(0, 8) + '...'
      });

    } catch (error) {
      console.warn('Failed to initialize change tracking:', error);
    }
  };

  const saveConfig = (newConfig: ChangeTrackingConfig) => {
    try {
      localStorage.setItem('lexxi-change-tracking', JSON.stringify({
        doctorAnonId: newConfig.doctorAnonId,
        consentGiven: newConfig.consentGiven,
        lastSync: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save tracking config:', error);
    }
  };

  const updateConsent = useCallback((consentGiven: boolean) => {
    const newConfig = {
      ...config,
      consentGiven,
      enabled: consentGiven
    };
    
    setConfig(newConfig);
    saveConfig(newConfig);
  }, [config]);

  const trackGeneration = useCallback(async (
    data: Omit<TrackGenerationRequest, 'sessionId'>
  ): Promise<string | null> => {
    if (!config.enabled || !config.consentGiven) {
      return null;
    }

    try {
      setIsTracking(true);
      
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/track-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          sessionId,
          doctorAnonId: config.doctorAnonId,
          deviceFingerprint: generateDeviceFingerprint()
        })
      });

      if (!response.ok) {
        throw new Error(`Tracking failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Note generation tracked:', result.generationId);
        return result.generationId;
      } else {
        console.warn('❌ Note generation tracking failed:', result.message);
        return null;
      }

    } catch (error) {
      console.error('Error tracking generation:', error);
      return null;
    } finally {
      setIsTracking(false);
    }
  }, [config]);

  const trackEdit = useCallback(async (
    generationId: string,
    data: Omit<TrackEditRequest, 'generationId'>
  ): Promise<boolean> => {
    if (!config.enabled || !config.consentGiven || !generationId) {
      return false;
    }

    try {
      setIsTracking(true);

      const response = await fetch('/api/track-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          generationId
        })
      });

      if (!response.ok) {
        throw new Error(`Edit tracking failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Note edit tracked:', result.editId, `(${result.changesDetected} changes)`);
        console.log('📊 Sections changed:', result.sectionsChanged.join(', '));
        return true;
      } else {
        console.warn('❌ Note edit tracking failed:', result.message);
        return false;
      }

    } catch (error) {
      console.error('Error tracking edit:', error);
      return false;
    } finally {
      setIsTracking(false);
    }
  }, [config]);

  const getStats = useCallback(async () => {
    if (!config.enabled || !config.doctorAnonId) {
      return null;
    }

    try {
      const response = await fetch(`/api/tracking-stats?doctorId=${config.doctorAnonId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to fetch tracking stats:', error);
    }
    return null;
  }, [config]);

  return {
    config,
    isTracking,
    updateConsent,
    trackGeneration,
    trackEdit,
    getStats
  };
}

// Helper function to generate device fingerprint
function generateDeviceFingerprint(): string {
  try {
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
  } catch {
    return 'unknown';
  }
}

// Helper hook for managing edit timing
export function useEditTimer() {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState<number>(0);

  const startTimer = useCallback(() => {
    setStartTime(Date.now());
  }, []);

  const stopTimer = useCallback(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setDuration(elapsed);
      setStartTime(null);
      return elapsed;
    }
    return 0;
  }, [startTime]);

  const resetTimer = useCallback(() => {
    setStartTime(null);
    setDuration(0);
  }, []);

  return {
    startTimer,
    stopTimer,
    resetTimer,
    duration,
    isRunning: startTime !== null
  };
}
