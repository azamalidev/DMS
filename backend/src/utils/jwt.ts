import jwt, { SignOptions } from "jsonwebtoken";

// src/utils/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}


export const signToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn:  124 * 60 * 60, // default to 1 day
  };

  return jwt.sign(payload, JWT_SECRET, options);
};
