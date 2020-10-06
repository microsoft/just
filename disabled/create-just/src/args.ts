export function convertToBypass(gen: any, args: any) {
  const prompts = gen.prompts;

  const bypassArgs = args._;

  prompts.forEach((prompt: any, index: number) => {
    if (prompt.name && args[prompt.name] !== undefined) {
      bypassArgs[index] = args[prompt.name];
    }
  });

  return bypassArgs;
}
