import admin from '../config/firebase';

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export const sendPushNotification = async (fcmToken: string, payload: NotificationPayload) => {
    try {
        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            token: fcmToken,
            android: {
                priority: 'high' as const,
                notification: {
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK', // Common convention for deep linking
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    }
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log(`Successfully sent push notification to ${fcmToken}:`, response);
        return { success: true, response };
    } catch (error) {
        console.error(`Error sending push notification to ${fcmToken}:`, error);
        return { success: false, error };
    }
};

export const sendMulticastNotification = async (tokens: string[], payload: NotificationPayload) => {
    if (tokens.length === 0) return { success: true, sentCount: 0 };

    try {
        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Sent multicast notification to ${tokens.length} tokens. Success: ${response.successCount}, Failure: ${response.failureCount}`);
        return {
            success: true,
            sentCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
        };
    } catch (error) {
        console.error('Error sending multicast notification:', error);
        return { success: false, error };
    }
};
