'use client';

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

interface FeatureFlags {
  enableSandbox: boolean;
  enablePlugins: boolean;
  enableConnectors: boolean;
  enableAgents: boolean;
  enableAnalytics: boolean;
  enableKnowledgeBase: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableSandbox: false,
  enablePlugins: false,
  enableConnectors: false,
  enableAgents: true,
  enableAnalytics: true,
  enableKnowledgeBase: true,
};

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  isEnabled: (flag: keyof FeatureFlags) => boolean;
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

  const isEnabled = useCallback((flag: keyof FeatureFlags): boolean => {
    return flags[flag];
  }, [flags]);

  const setFlag = useCallback((flag: keyof FeatureFlags, value: boolean) => {
    setFlags((prev) => ({ ...prev, [flag]: value }));
  }, []);

  const value = useMemo<FeatureFlagContextValue>(() => ({
    flags,
    isEnabled,
    setFlag,
  }), [flags, isEnabled, setFlag]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagContextValue {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
