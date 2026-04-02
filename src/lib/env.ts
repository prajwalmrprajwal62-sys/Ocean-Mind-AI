const normalize = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export const getGeminiApiKey = () => {
  const viteEnv = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env;

  return (
    normalize(viteEnv?.VITE_GEMINI_API_KEY) ||
    normalize(viteEnv?.GEMINI_API_KEY) ||
    normalize(process.env.GEMINI_API_KEY)
  );
};
