
// usercreate 
import {findUserByEmail,createUser,createKyc,logoutdata,getUsers,getUser} from '../models/usermodel.js';
import {STATUS_CODES} from '../statusCode/userStatusCode.js';
import  {USER_MESSAGES} from '../responseMessage/userResponseMessage.js';
import connection from '../index.js'; // Import MySQL connection
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        findUserByEmail(email, async (error, results) => {
            if (error) {
                return res.status(STATUS_CODES.SERVER_ERROR).json({ error: USER_MESSAGES.USER_CHECK_ERROR });
            }

            if (results.length === 0) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND });
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_MESSAGES.INVALID_PASSWORD });
            }

            const token = jwt.sign({ id: user.id,name:user.name,email:user.email, role: user.role }, 'your_jwt_secret', { expiresIn: '3d' });

            res.status(STATUS_CODES.SUCCESS).json({
                statusCode: STATUS_CODES.SUCCESS,
                message: USER_MESSAGES.LOGIN_SUCCESS,
                token,
                Role: user.role
            });
        });
    } catch (error) {
        res.status(STATUS_CODES.SERVER_ERROR).json({ error: error.message });
    }
};
export const create = async (req, res) => {
    try {
	const { username, email, password, role } = req.body;
	if (!username || !email || !password) {
            return res.status(STATUS_CODES.REQUIRED).json({ msg:USER_MESSAGES.ALL_FILD_REQUIRED });
        }
        const userRole = role || 'user';
                        try {
                            const hashedPassword = await bcrypt.hash(password, 10);
                            createUser(username, email, hashedPassword, userRole,(insertError,insertResults)=>{
                                if (insertError) {
                                                return res.status(STATUS_CODES.SERVER_ERROR).json({ error:USER_MESSAGES.FAILD_TO_CREATE_USER  });
                                            }
                                            res.status(STATUS_CODES.CREATED).json({
                                                statusCode: STATUS_CODES.CREATED,
                                                message: USER_MESSAGES.CREATEUSER
                                            });
                            })
                        } catch (hashError) {
                            res.status(STATUS_CODES.SERVER_ERROR).json({ error: USER_MESSAGES.FAILD_TO_HASHPASSWORD});
                        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    findUserByEmail(email, async (error, results) => {
        if (error || results.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const expiration = new Date(Date.now() + 3600000); // Token valid for 1 hour

        const query = 'UPDATE users SET password_reset_token = ?, token_expiration = ? WHERE email = ?';
        connection.query(query, [token, expiration, email], (err) => {
            if (err) {
                return res.status(STATUS_CODES.SERVER_ERROR).json({ message: USER_MESSAGES.DATABASE_ERROR });
            }
            res.status(STATUS_CODES.SUCCESS).json({statusCode:STATUS_CODES.SUCCESS, message: USER_MESSAGES.RESET_TOKEN_SENT, token });
        });
    });
};
export const createkYC = async (req, res) => {
    try {
        const { email_id, password, account_holder_name, account_number, confirm_account_number, ifsc_code, bank_name, branch } = req.body;
        const user_id = jwt.decode(req.headers.authorization.split(' ')[1]).id;
        if (!email_id || !password || !account_holder_name || !account_number || !confirm_account_number || !ifsc_code || !bank_name || !branch) {
            return res.status(STATUS_CODES.REQUIRED).json({ msg: USER_MESSAGES.ALL_FILD_REQUIRED});
        }
        createKyc(email_id, password, account_holder_name, account_number, confirm_account_number, ifsc_code, bank_name, branch, user_id,(error, results) => {
                if (error) {
                    return res.status(STATUS_CODES.SERVER_ERROR).json({ error: USER_MESSAGES.FAILD_TO_CREATE_USER});
                }
                res.status(STATUS_CODES.CREATED).json({ statusCode: STATUS_CODES.CREATED, message: USER_MESSAGES.KYC_CREATED });
            }
        );
    } catch (error) {
        res.status(STATUS_CODES.SERVER_ERROR).json({ error: error.message });
    }
};
export const logout = async (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.TOKEN_REQUIRED});
    }
    let decoded;
    try {
        decoded = jwt.verify(token, 'your_jwt_secret');
    } catch (err) {
        return res.status(STATUS_CODES.REQUIRED).json({ message:USER_MESSAGES.INVALID_TOKEN });
    }
    const userId = decoded.id;
    logoutdata(userId, token, (err, results) => {
        if (err) {
            return res.status(STATUS_CODES.SERVER_ERROR).json({ message:USER_MESSAGES.DATABASE_ERROR , error: err });
        }
        res.status(STATUS_CODES.SUCCESS).json({ message:USER_MESSAGES.LOGOUT});
    });
};
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    const query = 'SELECT * FROM users WHERE password_reset_token = ? AND token_expiration > NOW()';
    connection.query(query, [token], async (error, results) => {
        if (error || results.length === 0) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_MESSAGES.INVALID_TOKEN });
        }

        const user = results[0];
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updateQuery = 'UPDATE users SET password = ?, password_reset_token = NULL, token_expiration = NULL WHERE id = ?';
        connection.query(updateQuery, [hashedPassword, user.id], (err) => {
            if (err) {
                return res.status(STATUS_CODES.SERVER_ERROR).json({ message: USER_MESSAGES.DATABASE_ERROR });
            }
            res.status(STATUS_CODES.SUCCESS).json({ statusCode:STATUS_CODES.SUCCESS,message: USER_MESSAGES.PASSWORD_RESET_SUCCESS });
        });
    });
};
export const updateProfile = (req, res) => {
    const { id, name, email } = req.body;
    if (!id || (!name && !email)) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    const query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    connection.query(query, [name, email, id], (err, results) => {
        if (err) {
            return res.status(STATUS_CODES.SERVER_ERROR).json({ message: USER_MESSAGES.DATABASE_ERROR });
        }
        res.status(STATUS_CODES.SUCCESS).json({ statusCode:STATUS_CODES.SUCCESS,message: USER_MESSAGES.PROFILE_UPDATED });
    });
};
export const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [userId], async (error, results) => {
        if (error || results.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_MESSAGES.INVALID_PASSWORD });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
        connection.query(updateQuery, [hashedPassword, userId], (err) => {
            if (err) {
                return res.status(STATUS_CODES.SERVER_ERROR).json({ message: USER_MESSAGES.DATABASE_ERROR });
            }
            res.status(STATUS_CODES.SUCCESS).json({ message: USER_MESSAGES.PASSWORD_CHANGE_SUCCESS });
        });
    });
};
export const sendEmailVerification = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    findUserByEmail(email, async (error, results) => {
        if (error || results.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND });
        }

        const token = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '1h' });

        // Here, send the token as a link in an email (e.g., using Nodemailer).
        res.status(STATUS_CODES.SUCCESS).json({ message: USER_MESSAGES.VERIFICATION_EMAIL_SENT, token });
    });
};
export const verifyEmail = (req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const query = 'UPDATE users SET is_verified = TRUE WHERE email = ?';
        connection.query(query, [decoded.email], (error, results) => {
            if (error) {
                return res.status(STATUS_CODES.SERVER_ERROR).json({ message: USER_MESSAGES.DATABASE_ERROR });
            }
            res.status(STATUS_CODES.SUCCESS).json({ message: USER_MESSAGES.EMAIL_VERIFIED });
        });
    } catch (error) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: USER_MESSAGES.INVALID_TOKEN });
    }
};
export const deleteAccount = (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    const query = 'DELETE FROM users WHERE id = ?';
    connection.query(query, [userId], (error, results) => {
        if (error) {
            return res.status(STATUS_CODES.SERVER_ERROR).json({ message: USER_MESSAGES.DATABASE_ERROR });
        }
        res.status(STATUS_CODES.SUCCESS).json({ message: USER_MESSAGES.ACCOUNT_DELETED });
    });
};
export const recoverAccount = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(STATUS_CODES.REQUIRED).json({ message: USER_MESSAGES.ALL_FILD_REQUIRED });
    }

    const query = 'UPDATE users SET is_deleted = FALSE WHERE email = ? AND is_deleted = TRUE';
    connection.query(query, [email], (error, results) => {
        if (error || results.affectedRows === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.ACCOUNT_NOT_FOUND_OR_ACTIVE });
        }
        res.status(STATUS_CODES.SUCCESS).json({ message: USER_MESSAGES.ACCOUNT_RECOVERED });
    });
};
export const getAllUsers = (req, res) => {
    getUsers(async (error, results) => {
        if (error || results.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND });
        }
        res.status(STATUS_CODES.SUCCESS).json({ statusCode: STATUS_CODES.SUCCESS,results });
    });
};
export const getSingleUser = (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res
                .status(STATUS_CODES.UNAUTHORIZED)
                .json({ message: USER_MESSAGES.TOKEN_MISSING });
        }
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
    getUser(id,async (error, results) => {
        if (error || results.length === 0) {
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: USER_MESSAGES.USER_NOT_FOUND });
        }
        res.status(STATUS_CODES.SUCCESS).json({ statusCode: STATUS_CODES.SUCCESS,results });
    });
};