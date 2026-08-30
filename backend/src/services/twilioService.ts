
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const makeEmergencyCall = async (to: string, name: string) => {
    try {
        if (!accountSid || !authToken || !fromNumber) {
            throw new Error("Twilio credentials missing in environment variables");
        }

        // Format number: default to +91 if no country code provided
        let formattedTo = to.trim();
        if (!formattedTo.startsWith('+')) {
            formattedTo = `+91${formattedTo}`;
        }

        const call = await client.calls.create({
            twiml: `<Response><Say>This is an emergency alert from Aal is Well platform. User ${name} has triggered an SOS. Please check the dashboard immediately.</Say></Response>`,
            to: formattedTo,
            from: fromNumber,
        });

        console.log(`Call initiated to ${to}. SID: ${call.sid}`);
        return call.sid;
    } catch (error) {
        console.error("Error making Twilio call:", error);
        throw error;
    }
};
