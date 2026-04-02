import { apiGetText, apiPostVoid, apiDelete, ApiError } from './client';

/** Fetch current webhook URL. Returns null if none is set (204). */
export async function getWebhook(): Promise<string | null> {
  const text = await apiGetText('/auth/webhook');
  return text || null;
}

/** Set webhook URL. Throws ApiError with status 406 for non-bot accounts. */
export async function setWebhook(url: string): Promise<void> {
  try {
    await apiPostVoid('/auth/webhook', { WebHookUrl: url });
  } catch (err) {
    if (err instanceof ApiError && err.status === 406) {
      throw new ApiError(406, 'Webhooks are only available for bot accounts.');
    }
    throw err;
  }
}

export function deleteWebhook(): Promise<void> {
  return apiDelete('/auth/webhook');
}
