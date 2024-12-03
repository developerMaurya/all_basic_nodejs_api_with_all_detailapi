import { sendSms, storeOtpInDb, verifyOtpInDb } from "../models/otpModel.js";
// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
// Send OTP API
export const sendOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
    }
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    try {
        // Send SMS via Twilio
        await sendSms(phoneNumber, otp);
        // Store OTP in database
        await storeOtpInDb(phoneNumber, otp, expiresAt);
        res.status(200).json({ message: 'OTP sent successfully', phoneNumber });
    } catch (error) {
        console.error('Error sending OTP:', error.message);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
};

// Verify OTP API
export const verifyOtp = async (req, res) => {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required' });
    }
    try {
        const isValid = await verifyOtpInDb(phoneNumber, otp);
        if (isValid) {
            return res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
};
