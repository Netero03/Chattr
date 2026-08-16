import { setJwtCookie } from "../lib/authToken.js";
import {
  validateSignupInput,
  hashPassword,
  createAndSaveUser,
  validateLoginInput,
  uploadProfilePicture,
  updateUserProfilePicture
} from "../services/auth.service.js";
import { sendErrorResponse } from "../utils/errorHandling.js";
import { parseUserToJSON } from "../utils/jsonFormatting.js";
import { normalizeSignupData, normalizeLoginData } from "../../../shared/auth.utils.js";


export const signup = async (req, res) => {
  const { fullName, email, password } = normalizeSignupData(req.body);
  try {
    await validateSignupInput(fullName, email, password);

    const hashedPassword = await hashPassword(password);

    const newUser = await createAndSaveUser(fullName, email, hashedPassword);
    
    setJwtCookie(newUser._id, res);
    res.status(201).json(parseUserToJSON(newUser));
  } catch (error) {
    sendErrorResponse(res, error, "auth controller signup");
  }
};

export const login = async (req, res) => {
  const { email, password } = normalizeLoginData(req.body);

  try {
    const user = await validateLoginInput(email, password);
    
    setJwtCookie(user._id, res);
    res.status(200).json(parseUserToJSON(user));
  } catch (error) {
    sendErrorResponse(res, error, "auth controller login");
  }
};

export const logout = (req, res) => {
  try {
    // Expires the user's JWT token to log them out.
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    sendErrorResponse(res, error, "auth controller logout");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    const secure_url = await uploadProfilePicture(profilePic);
    const updatedUser = await updateUserProfilePicture(secure_url, userId);
    
    res.status(200).json(updatedUser);
  } catch (error) {
    sendErrorResponse(res, error, "auth controller update profile");
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    sendErrorResponse(res, error, "auth controller check auth");
  }
};
