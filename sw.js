self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil((async function () {
        const appUrl = new URL('/', self.location.origin).href;
        const windows = await clients.matchAll({
            includeUncontrolled: true,
            type: 'window'
        });

        for (const client of windows) {
            if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                return client.focus();
            }
        }

        if (clients.openWindow) {
            return clients.openWindow(appUrl);
        }
    })());
});
