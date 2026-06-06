import type { Configuration } from 'webpack';

export const displayBailoutOverlay = (): Partial<Configuration> => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  stats: {
    // Examine all modules
    maxModules: Infinity,
    // Display bailout reasons
    optimizationBailout: true,
  } as any,
});
