export function requestNotificationPermission() {
  if ("Notification" in window && navigator.serviceWorker) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.log("Notification permission denied.");
      }
    });
  } else {
    console.log("Browser does not support notifications.");
  }
}

export function showNotification(title, options) {
  if ("Notification" in window && navigator.serviceWorker) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  }
}

export function playNotificationSound() {
  const audio = document.getElementById("notificationSound");
  if (audio) (audio as any).play();
}
