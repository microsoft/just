import { Configuration } from 'webpack';

export const displayBailoutOverlay = (): Partial<Configuration> => ({
  stats: {
    // Examine all modules
    maxModules: Infinity,
    // Display bailout reasons
    optimizationBailout: true,
  } as any,
});
