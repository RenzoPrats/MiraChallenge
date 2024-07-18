// route.test.ts
import request from "supertest";
import express from "express";
import router from "./chat.route";

const app = express();
app.use(express.json());
app.use("/api/chat", router);

describe("POST /api/chat", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle missing location", async () => {
    const response = await request(app).post("/api/chat").send({}).expect(500);
    expect(response.body.message).toContain("No location provided");
  });

  it("should return bad_weather or good_weather based on conditions", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({
        location: "London, UK",
      })
      .expect(200);
    expect(response.body.message).toMatch(/(good_weather|bad_weather)/i);
  });

  it("should return error, location not valid", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({
        location: "undefined location",
      })
      .expect(500);
    expect(response.body.message).toContain(
      "Internal server error: Request failed with status code 404"
    );
  });

  it("should return error, location not well formatted", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({
        location: "New york usa",
      })
      .expect(500);
    expect(response.body.message).toContain(
      "Internal server error: Request failed with status code 404"
    );
  });
});
