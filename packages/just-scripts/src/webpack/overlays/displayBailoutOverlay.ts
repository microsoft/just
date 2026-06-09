// WARNING: Careful about adding more imports - only import types from externals
import type { Configuration } from 'webpack';

export function displayBailoutOverlay(): Configuration {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    stats: {
      // Examine all modules
      maxModules: Infinity,
      // Display bailout reasons
      optimizationBailout: true,
    } as any,
  };
}
