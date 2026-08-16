import mongoose from "mongoose";
import { MIN_PASSWORD_LENGTH } from "../../../shared/auth.constants.js";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minlength: MIN_PASSWORD_LENGTH
        },
        profilePic: {
            type: String,
            default: ""
        },
        pinnedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;