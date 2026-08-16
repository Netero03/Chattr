import jwt from "jsonwebtoken";


const TOKEN_LIFESPAN_IN_DAYS = 7;
const MILLISECONDS_IN_ONE_DAY = 24 * 60 * 60 * 1000;

export const setJwtCookie = (userId, res) => {
    const token = jwt.sign(
        { userId }, 
        process.env.JWT_SECRET,
        { expiresIn: `${TOKEN_LIFESPAN_IN_DAYS}d` }
    );

    res.cookie(
        "jwt",
        token, 
        {
            maxAge: TOKEN_LIFESPAN_IN_DAYS * MILLISECONDS_IN_ONE_DAY,
            // Prevents XSS attacks
            httpOnly: true,
            // Prevents CSRF attacks
            sameSite: "strict",
            // During development, localhost uses http. The final production app will use https instead.
            secure: process.env.NODE_ENV !== "development"
        }
    );
};