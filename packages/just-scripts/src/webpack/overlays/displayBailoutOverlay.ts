// WARNING: Careful about adding more imports - only import types from externals
import type { Configuration, StatsOptions } from 'webpack';

/**
 * Enable the display of optimization bailout reasons in the webpack stats output.
 */
export function displayBailoutOverlay(): Configuration {
  return {
    stats: {
      // Examine all modules
      maxModules: Infinity,
      // Display bailout reasons
      optimizationBailout: true,
    } as StatsOptions,
  };
}
