import request from "supertest";
import app from "../app.js";
import pool from "../db/config.js";

describe("Authentication API Integrations", () => {
  const testUser = {
    username: "jest_tester",
    email: "test_jest@example.com",
    password: "secure_test_password",
  };

  // Utility function to delete our test user
  const cleanTestUser = async () => {
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
  };

  // Run before test execution begins
  beforeAll(async () => {
    await cleanTestUser();
  });

  // Run after all tests finish
  afterAll(async () => {
    await cleanTestUser();
    await pool.end(); // Crucial: Closes active db pool connections so Jest can terminate cleanly
  });

  it("should register a new user successfully and return a JWT", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    // Assert correct status code and message
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "User registered successfully",
    );
    expect(response.body).toHaveProperty("token");

    // Assert sensitive parameters are hidden
    expect(response.body.user).toHaveProperty("username", testUser.username);
    expect(response.body.user).not.toHaveProperty("password_hash");

    // Database Assertion: Query Postgres directly to verify the record was written
    const dbCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      testUser.email,
    ]);
    expect(dbCheck.rows.length).toBe(1);
    expect(dbCheck.rows[0].username).toBe(testUser.username);
  });

  it("should fail to register if email or username is already taken", async () => {
    // Attempting a duplicate registration
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Username or Email is already registered",
    );
  });
});
