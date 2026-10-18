/*
 * Push + click handling for web push notifications.
 *
 * The backend web-push payload (channels/push.py) is:
 *   { title, body, url, scope }
 * URL is origin-relative (e.g. "/items/<id>/matches"); resolved against the
 * app origin here. Read nothing else from the network - payload is verbatim.
 */

self.addEventListener("install", () => {
    // No precaching - activate immediately.
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (err) {
        // Malformed payload - still show something rather than nothing.
        console.error("Push: malformed payload", err);
    }

    const title = typeof data.title === "string" && data.title ? data.title : "Retrievo";
    const body = typeof data.body === "string" ? data.body : "";
    const url = typeof data.url === "string" && data.url ? data.url : "/";

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            // A push must always show something visible; undefined icon falls
            // back to the browser default.
            tag: url,
            renotify: false,
            data: { url },
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const raw = event.notification.data && event.notification.data.url;
    const target = new URL(typeof raw === "string" && raw ? raw : "/", self.location.origin).href;

    event.waitUntil(
        (async () => {
            const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });

            // Focus an existing tab if the app is already open there.
            for (const client of windowClients) {
                if (new URL(client.url).origin === self.location.origin && "focus" in client) {
                    await client.focus();
                    // Reuse the app's own router for the deep link when possible.
                    if ("postMessage" in client) {
                        client.postMessage({ type: "PUSH_NAVIGATE", url: target });
                    }
                    return;
                }
            }

            if (self.clients.openWindow) {
                await self.clients.openWindow(target);
            }
        })()
    );
});
