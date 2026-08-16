import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { sendErrorResponse, throwError } from "../utils/errorHandling.js";


export const protectRoute = async (req, res, next) => {
  try {
    const authToken = req.cookies.jwt;
    const user = await findUserUsingAuthToken(authToken);

    req.user = user;
    next();
  } catch (error) {
    sendErrorResponse(res, error, "authentication middleware protectRoute");
  }
};

// Helper function
const findUserUsingAuthToken = async (authToken) => {
  if (!authToken) {
    throwError("Unauthorized, no token provided.", 401);
  }

  const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken.userId).select("-password"); // omit user password for security
  if (!user) {
    throwError("User not found.", 404);
  }

  return user;
};
