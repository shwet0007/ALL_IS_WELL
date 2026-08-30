importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyB8hQVtgcSemxPie-tk6z5oK7WyDDte0xQ",
    authDomain: "aal-is-well-2a625.firebaseapp.com",
    projectId: "aal-is-well-2a625",
    storageBucket: "aal-is-well-2a625.appspot.com",
    messagingSenderId: "427075283888",
    appId: "1:427075283888:web:55610a86eb5d023b7e4475"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png', // Update with actual icon path
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
