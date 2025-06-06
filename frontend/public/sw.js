// 1) Listen for "push" events (fired by web-push from your backend)
self.addEventListener("push", (event) => {
  // Default payload in case the server didn't send JSON or it's missing fields
  let data = {
    title: "New Message",
    body: "You have a new chat message.",
    url: "/",          // fallback if no URL provided
    groupId: "",       // the chat group ID
    messageId: "",     // optional: the exact message _id
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error("Push event data was not valid JSON:", err);
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.ico",          // or your own 192×192 icon in public/
    badge: "/favicon-192x192.png", // small badge (Android)
    data: {
      url: data.url,
      groupId: data.groupId,
      messageId: data.messageId,
    },
    tag: data.groupId,  // so multiple notifications from the same chat replace each other
    renotify: true,     // re-notify if a notification with the same tag already exists
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2) Handle “notificationclick” so that tapping the notification focuses/opens the chat URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickData = event.notification.data; // { url, groupId, messageId }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // If any open window’s URL contains the target URL, focus it
        if (client.url.includes(clickData.url) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window/tab to that URL
      if (clients.openWindow) {
        return clients.openWindow(clickData.url);
      }
    })
  );
});
