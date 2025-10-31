import React, { createContext, useContext, useState } from 'react';

/**
 * Enhanced FX context to toggle expensive visual effects such as meteor streaks
 * and wave distortions. Defaults to enabled. Use the provider at the top of
 * the application and the hook to read or toggle the state.
 */
interface EnhancedFxContextValue {
  /** When true, heavy visual effects like meteor streaks and wave distortions are enabled */
  isEnhanced: boolean;
  /** Toggle the enhanced effects on or off */
  toggleEnhanced: () => void;
}

const EnhancedFxContext = createContext<EnhancedFxContextValue | undefined>(undefined);

export const EnhancedFxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with enhanced effects enabled. Users can disable via the switch in the AppBar.
  const [isEnhanced, setIsEnhanced] = useState<boolean>(true);
  const toggleEnhanced = () => setIsEnhanced((prev) => !prev);
  return (
    <EnhancedFxContext.Provider value={{ isEnhanced, toggleEnhanced }}>
      {children}
    </EnhancedFxContext.Provider>
  );
};

/**
 * Hook to access enhanced FX settings. Throws if used outside of provider.
 */
export const useEnhancedFx = (): EnhancedFxContextValue => {
  const ctx = useContext(EnhancedFxContext);
  if (!ctx) {
    throw new Error('useEnhancedFx must be used within an EnhancedFxProvider');
  }
  return ctx;
};