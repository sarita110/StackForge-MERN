import request from "supertest";
import app from "../app.js";

describe("Base API Path Integrations", () => {
  it("should return a 200 status and welcome message", async () => {
    const response = await request(app).get("/");

    // Assert status code matches 200 OK
    expect(response.statusCode).toBe(200);

    // Assert response content contains our welcome message
    expect(response.text).toContain("Welcome to the StackForge API!");
  });
});
