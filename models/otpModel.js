import connection from '../index.js';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send SMS
export const sendSms = async (phoneNumber, otp) => {
    return client.messages.create({
        body: `Your OTP is ${otp}. It will expire in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
    });
};

// Store OTP in database
export const storeOtpInDb = async (phoneNumber, otp, expiresAt) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO otp (phone_number, otp_code, expires_at) VALUES (?, ?, ?)';
        connection.query(query, [phoneNumber, otp, expiresAt], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Verify OTP in database
export const verifyOtpInDb = async (phoneNumber, otp) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM otp WHERE phone_number = ? AND otp_code = ? AND expires_at > NOW()';
        connection.query(query, [phoneNumber, otp], (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length > 0) {
                // Delete OTP after verification
                const deleteQuery = 'DELETE FROM otp WHERE phone_number = ?';
                connection.query(deleteQuery, [phoneNumber], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting OTP:', deleteErr.message);
                    }
                });
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};
