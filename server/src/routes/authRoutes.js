import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidText(value, minimumLength, maximumLength) {
  return (
    typeof value === "string" &&
    value.trim().length >= minimumLength &&
    value.trim().length <= maximumLength
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !isValidText(name, 2, 100) ||
      !isValidEmail(email) ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Name must contain 2-100 characters, and a valid email and password are required.",
      });
    }

    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({
        message: "Password must contain between 6 and 100 characters.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at;
      `,
      [normalizedName, normalizedEmail, passwordHash, "citizen"]
    );

    res.status(201).json({
      message: "User registered successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Failed to register user.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({
        message: "A valid email and password are required.",
      });
    }

    if (password.length < 1 || password.length > 100) {
      return res.status(400).json({
        message: "Password length is invalid.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
        SELECT
          id,
          name,
          email,
          password_hash,
          role
        FROM users
        WHERE LOWER(email) = LOWER($1);
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error("JWT_SECRET is missing from the environment.");

      return res.status(500).json({
        message: "Authentication configuration is missing.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: "8h",
      }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Failed to log in.",
    });
  }
});

export default router;