import { clientFetch } from "@/lib/client-fetch";

export interface WebPushKeys {
    endpoint: string;
    p256dh: string;
    auth: string;
}

/** GET: VAPID application server key for pushManager.subscribe() */
export function getPushPublicKey(token?: string) {
    return clientFetch<{ public_key: string }>('/push/public-key', token);
}

/** POST: Register (or refresh) this device's push subscription */
export function subscribePush(payload: WebPushKeys, token?: string) {
    return clientFetch('/push/subscribe', token, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/** DELETE: Revoke this device's push subscription */
export function unsubscribePush(payload: WebPushKeys, token?: string) {
    return clientFetch('/push/subscribe', token, {
        method: "DELETE",
        body: JSON.stringify(payload),
    });
}
