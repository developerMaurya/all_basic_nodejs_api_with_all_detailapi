import connection from '../index.js';

export const findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    connection.query(query, [email], callback);
};
export const createUser=(username, email, hashedPassword, userRole,callback)=>{
    const query='INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    connection.query(query,[username, email, hashedPassword, userRole],callback)
}
export const createKyc=(email_id, password, account_holder_name, account_number, confirm_account_number, ifsc_code, bank_name, branch, user_id,callback)=>{
    const query='INSERT INTO kyc_form (email_id, password, account_holder_name, account_number,confirm_account_number,ifsc_code,bank_name,branch,user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query,[email_id, password, account_holder_name, account_number, confirm_account_number, ifsc_code, bank_name, branch, user_id],callback)
}
export const logoutdata=(userId, token,callback)=>{
    const query='INSERT INTO logout (user_id, token) VALUES (?, ?)';
    connection.query(query,[userId,token],callback)
}
export const updateResetToken = (email, token, expiration, callback) => {
    const query = 'UPDATE users SET password_reset_token = ?, token_expiration = ? WHERE email = ?';
    connection.query(query, [token, expiration, email], callback);
};
