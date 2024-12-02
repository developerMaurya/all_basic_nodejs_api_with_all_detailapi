import express from "express";
import { create,login,createkYC,logout,resetPassword,updateProfile,forgotPassword,
    changePassword,sendEmailVerification,verifyEmail,deleteAccount,recoverAccount,getAllUsers,getSingleUser
} from "../controller/usercontroller.js";
import { isAdmin, verifyToken } from '../middleware/middleware.js';

// create api
const route = express.Router();

// registraion new user api  or add new user
route.post("/create", create);
// login api 
route.post("/login", login);
// add kyc or create kyc
route.post("/kyc",[verifyToken], createkYC);
// logout api 
route.post("/logout", logout);
// forget api 
route.post("/forgot-password", forgotPassword);
// reset password pai 
route.post("/reset-password", resetPassword);
// update profile api
route.post("/update-profile", updateProfile);
// change password api 
route.post("/change-password", changePassword);
// send verification email to user 
route.post("/send-verification-email", sendEmailVerification);
// verifiy users email from database like this math or not 
route.post("/verify-email", verifyEmail);
// delete user account api 
route.delete("/delete-account", deleteAccount);
// trying to recouver account like this if api >>>>>>>>>>>>>>>>> under processing ??????????????????????????
// ******************** if want to recover acount to i have to user temperay delete user accuount logic so based on it display and update all api then i can easly to it *************
route.post("/recover-account", recoverAccount);
// get all register users details 
// ************************************ here only admin can access it ****************
route.get("/users",[verifyToken,isAdmin], getAllUsers);
// ******************************** vafiy token middleware used i am her *****************************
// get user profile ( loged in user details ) based on token 
route.get("/user",[verifyToken], getSingleUser);
export default route;