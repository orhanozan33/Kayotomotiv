/**
 * Helper function to resolve async params in Next.js App Router
 * In Next.js 15+, params can be a Promise, so we need to await it
 */
export async function resolveParams<T extends Record<string, string>>(
  params: Promise<T> | T
): Promise<T> {
  return await Promise.resolve(params);
}

