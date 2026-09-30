import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import {
  authenticateToken,
  requireAdmin,
} from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedCategories = [
  "Streetlight",
  "Garbage Collection",
  "Pothole",
  "Water Supply",
  "Drainage",
  "Road Damage",
  "Public Safety",
  "Other",
];

const allowedPriorities = ["Low", "Medium", "High"];

const allowedStatuses = [
  "Pending",
  "In Progress",
  "Resolved",
  "Rejected",
];

const allowedDepartments = [
  "Sanitation",
  "Public Works",
  "Electricity",
  "Water Supply",
  "Roads and Transport",
  "Public Safety",
  "Parks and Recreation",
];

const allowedOrigins = [
  "http://localhost:3000",
  "https://smart-civic-frontend-p3gc.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("/{*splat}", cors());

app.use(express.json({ limit: "100kb" }));

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Smart Civic Operations API is running successfully.",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.status(200).json({
      message: "Database connected successfully.",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

app.post("/api/complaints", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      priority,
      citizenName,
      citizenEmail,
      latitude,
      longitude,
    } = req.body;

    if (
      typeof title !== "string" ||
      title.trim().length < 5 ||
      title.trim().length > 150
    ) {
      return res.status(400).json({
        message: "Title must contain between 5 and 150 characters.",
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 10 ||
      description.trim().length > 5000
    ) {
      return res.status(400).json({
        message: "Description must contain between 10 and 5000 characters.",
      });
    }

    if (
      typeof category !== "string" ||
      !allowedCategories.includes(category.trim())
    ) {
      return res.status(400).json({
        message: "Please select a valid complaint category.",
      });
    }

    if (
      typeof location !== "string" ||
      location.trim().length < 3 ||
      location.trim().length > 250
    ) {
      return res.status(400).json({
        message: "Location must contain between 3 and 250 characters.",
      });
    }

    const normalizedPriority = priority || "Medium";

    if (!allowedPriorities.includes(normalizedPriority)) {
      return res.status(400).json({
        message: "Please select a valid priority.",
      });
    }

    if (latitude !== undefined && latitude !== null && latitude !== "") {
      const numericLatitude = Number(latitude);

      if (
        !Number.isFinite(numericLatitude) ||
        numericLatitude < -90 ||
        numericLatitude > 90
      ) {
        return res.status(400).json({
          message: "Latitude must be a valid number between -90 and 90.",
        });
      }
    }

    if (longitude !== undefined && longitude !== null && longitude !== "") {
      const numericLongitude = Number(longitude);

      if (
        !Number.isFinite(numericLongitude) ||
        numericLongitude < -180 ||
        numericLongitude > 180
      ) {
        return res.status(400).json({
          message:
            "Longitude must be a valid number between -180 and 180.",
        });
      }
    }

    const normalizedLatitude =
      latitude !== undefined &&
      latitude !== null &&
      latitude !== ""
        ? Number(latitude)
        : null;

    const normalizedLongitude =
      longitude !== undefined &&
      longitude !== null &&
      longitude !== ""
        ? Number(longitude)
        : null;

    if (
      citizenName !== undefined &&
      citizenName !== null &&
      (typeof citizenName !== "string" ||
        citizenName.trim().length > 100)
    ) {
      return res.status(400).json({
        message: "Citizen name must not exceed 100 characters.",
      });
    }

    if (
      citizenEmail !== undefined &&
      citizenEmail !== null &&
      citizenEmail !== ""
    ) {
      if (
        typeof citizenEmail !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(citizenEmail.trim()) ||
        citizenEmail.trim().length > 150
      ) {
        return res.status(400).json({
          message: "Please enter a valid citizen email address.",
        });
      }
    }

    const query = `
      INSERT INTO complaints (
        title,
        description,
        category,
        location,
        priority,
        citizen_name,
        citizen_email,
        latitude,
        longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      title.trim(),
      description.trim(),
      category.trim(),
      location.trim(),
      normalizedPriority,
      citizenName?.trim() || null,
      citizenEmail?.trim().toLowerCase() || null,
      normalizedLatitude,
      normalizedLongitude,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Complaint created successfully.",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("Create complaint error:", error.message);

    res.status(500).json({
      message: "Failed to create complaint.",
    });
  }
});

app.get(
  "/api/complaints",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          c.*,
          u.name AS assigned_user_name,
          u.email AS assigned_user_email,
          u.role AS assigned_user_role
        FROM complaints c
        LEFT JOIN users u ON c.assigned_to = u.id
        ORDER BY c.created_at DESC;
      `);

      res.status(200).json({
        count: result.rows.length,
        complaints: result.rows,
      });
    } catch (error) {
      console.error("Fetch complaints error:", error.message);

      res.status(500).json({
        message: "Failed to fetch complaints.",
      });
    }
  }
);

app.get(
  "/api/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          id,
          name,
          email,
          role
        FROM users
        WHERE LOWER(role) IN ('citizen', 'staff', 'admin')
        ORDER BY name ASC;
      `);

      res.status(200).json({
        users: result.rows,
      });
    } catch (error) {
      console.error("Fetch users error:", error.message);

      res.status(500).json({
        message: "Failed to fetch users.",
      });
    }
  }
);

app.get("/api/complaints/track/:id", async (req, res) => {
  try {
    const complaintId = Number(req.params.id);
    const { email } = req.query;

    if (!Number.isInteger(complaintId) || complaintId <= 0) {
      return res.status(400).json({
        message: "A valid complaint ID is required.",
      });
    }

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "A valid email is required.",
      });
    }

    const result = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          category,
          location,
          priority,
          citizen_name,
          citizen_email,
          latitude,
          longitude,
          status,
          department,
          assigned_to,
          resolution_notes,
          created_at,
          updated_at
        FROM complaints
        WHERE id = $1
          AND LOWER(citizen_email) = LOWER($2);
      `,
      [complaintId, email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No complaint found with this ID and email.",
      });
    }

    res.status(200).json({
      message: "Complaint details fetched successfully.",
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error("Citizen complaint tracking error:", error.message);

    res.status(500).json({
      message: "Failed to track complaint.",
    });
  }
});

app.get(
  "/api/complaints/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const complaintId = Number(req.params.id);

      if (!Number.isInteger(complaintId) || complaintId <= 0) {
        return res.status(400).json({
          message: "A valid complaint ID is required.",
        });
      }

      const result = await pool.query(
        `
          SELECT
            c.*,
            u.name AS assigned_user_name,
            u.email AS assigned_user_email,
            u.role AS assigned_user_role
          FROM complaints c
          LEFT JOIN users u ON c.assigned_to = u.id
          WHERE c.id = $1;
        `,
        [complaintId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Complaint not found.",
        });
      }

      res.status(200).json({
        complaint: result.rows[0],
      });
    } catch (error) {
      console.error("Fetch complaint details error:", error.message);

      res.status(500).json({
        message: "Failed to fetch complaint details.",
      });
    }
  }
);

app.patch(
  "/api/complaints/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const complaintId = Number(req.params.id);
      const { status } = req.body;

      if (!Number.isInteger(complaintId) || complaintId <= 0) {
        return res.status(400).json({
          message: "A valid complaint ID is required.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message:
            "Invalid status. Use Pending, In Progress, Resolved, or Rejected.",
        });
      }

      const result = await pool.query(
        `
          UPDATE complaints
          SET
            status = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *;
        `,
        [status, complaintId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Complaint not found.",
        });
      }

      res.status(200).json({
        message: "Complaint status updated successfully.",
        complaint: result.rows[0],
      });
    } catch (error) {
      console.error("Update complaint status error:", error.message);

      res.status(500).json({
        message: "Failed to update complaint status.",
      });
    }
  }
);

app.patch(
  "/api/complaints/:id/assignment",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const complaintId = Number(req.params.id);

      const {
        department,
        assignedTo,
        assignedUserId,
        resolutionNotes,
        status,
      } = req.body;

      if (!Number.isInteger(complaintId) || complaintId <= 0) {
        return res.status(400).json({
          message: "A valid complaint ID is required.",
        });
      }

      if (
        typeof department !== "string" ||
        !allowedDepartments.includes(department.trim())
      ) {
        return res.status(400).json({
          message: "Please select a valid department.",
        });
      }

      if (
        resolutionNotes !== undefined &&
        resolutionNotes !== null &&
        (typeof resolutionNotes !== "string" ||
          resolutionNotes.trim().length > 2000)
      ) {
        return res.status(400).json({
          message: "Resolution notes must not exceed 2000 characters.",
        });
      }

      if (
        status !== undefined &&
        status !== null &&
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          message:
            "Invalid status. Use Pending, In Progress, Resolved, or Rejected.",
        });
      }

      const receivedAssignedUser =
        assignedTo !== undefined ? assignedTo : assignedUserId;

      let normalizedAssignedUserId = null;

      if (
        receivedAssignedUser !== undefined &&
        receivedAssignedUser !== null &&
        receivedAssignedUser !== "" &&
        receivedAssignedUser !== "unassigned"
      ) {
        normalizedAssignedUserId = Number(receivedAssignedUser);

        if (
          !Number.isInteger(normalizedAssignedUserId) ||
          normalizedAssignedUserId <= 0
        ) {
          return res.status(400).json({
            message: "Assigned user ID must be a valid number.",
          });
        }

        const userResult = await pool.query(
          `
            SELECT
              id,
              name,
              email,
              role
            FROM users
            WHERE id = $1
              AND LOWER(role) IN ('citizen', 'staff', 'admin');
          `,
          [normalizedAssignedUserId]
        );

        if (userResult.rows.length === 0) {
          return res.status(404).json({
            message: "Assigned user was not found.",
          });
        }
      }

      const result = await pool.query(
        `
          UPDATE complaints
          SET
            department = $1,
            assigned_to = $2,
            resolution_notes = $3,
            status = COALESCE($4, status),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
          RETURNING *;
        `,
        [
          department.trim(),
          normalizedAssignedUserId,
          resolutionNotes?.trim() || null,
          status || null,
          complaintId,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "Complaint not found.",
        });
      }

      const complaintResult = await pool.query(
        `
          SELECT
            c.*,
            u.name AS assigned_user_name,
            u.email AS assigned_user_email,
            u.role AS assigned_user_role
          FROM complaints c
          LEFT JOIN users u ON c.assigned_to = u.id
          WHERE c.id = $1;
        `,
        [complaintId]
      );

      res.status(200).json({
        message: "Complaint assignment updated successfully.",
        complaint: complaintResult.rows[0],
      });
    } catch (error) {
      console.error("Update complaint assignment error:", error.message);

      res.status(500).json({
        message: "Failed to update complaint assignment.",
      });
    }
  }
);

app.get(
  "/api/dashboard/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const summaryQuery = `
        SELECT
          COUNT(*)::int AS total_complaints,
          COUNT(*) FILTER (
            WHERE status = 'Pending'
          )::int AS pending_complaints,
          COUNT(*) FILTER (
            WHERE status = 'In Progress'
          )::int AS in_progress_complaints,
          COUNT(*) FILTER (
            WHERE status = 'Resolved'
          )::int AS resolved_complaints,
          COUNT(*) FILTER (
            WHERE status = 'Rejected'
          )::int AS rejected_complaints,
          COUNT(*) FILTER (
            WHERE priority = 'High'
          )::int AS high_priority_complaints
        FROM complaints;
      `;

      const categoryQuery = `
        SELECT
          category,
          COUNT(*)::int AS complaint_count
        FROM complaints
        GROUP BY category
        ORDER BY complaint_count DESC;
      `;

      const [summaryResult, categoryResult] = await Promise.all([
        pool.query(summaryQuery),
        pool.query(categoryQuery),
      ]);

      res.status(200).json({
        message: "Dashboard statistics fetched successfully.",
        summary: summaryResult.rows[0],
        complaintsByCategory: categoryResult.rows,
      });
    } catch (error) {
      console.error("Dashboard statistics error:", error.message);

      res.status(500).json({
        message: "Failed to fetch dashboard statistics.",
      });
    }
  }
);

app.get(
  "/api/dashboard/departments",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          COALESCE(department, 'Unassigned') AS department,
          COUNT(*)::int AS total_complaints,
          COUNT(*) FILTER (
            WHERE status = 'Pending'
          )::int AS pending_complaints,
          COUNT(*) FILTER (
            WHERE status = 'In Progress'
          )::int AS in_progress_complaints,
          COUNT(*) FILTER (
            WHERE status = 'Resolved'
          )::int AS resolved_complaints,
          COUNT(*) FILTER (
            WHERE status = 'Rejected'
          )::int AS rejected_complaints
        FROM complaints
        GROUP BY department
        ORDER BY total_complaints DESC;
      `);

      res.status(200).json({
        message: "Department statistics fetched successfully.",
        departments: result.rows,
      });
    } catch (error) {
      console.error("Department statistics error:", error.message);

      res.status(500).json({
        message: "Failed to fetch department statistics.",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});