import express from "express";
import { create,login,createkYC,logout,resetPassword,updateProfile,forgotPassword,
    changePassword,sendEmailVerification,verifyEmail,deleteAccount,recoverAccount
} from "../controller/usercontroller.js";
import { isAdmin, verifyToken } from '../middleware/middleware.js';

// create api
const route = express.Router();


route.post("/create", create);
route.post("/login", login);
route.post("/kyc",[verifyToken], createkYC);
route.post("/logout", logout);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.post("/update-profile", updateProfile);

route.post("/change-password", changePassword);
route.post("/send-verification-email", sendEmailVerification);
route.post("/verify-email", verifyEmail);
route.delete("/delete-account", deleteAccount);
route.post("/recover-account", recoverAccount);

export default route;