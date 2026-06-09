import {
  createEvent,
  getEvent,
  addParticipant,
  addExpense,
  getSettlement,
} from "@/lib/client-api";

// Mock global fetch
global.fetch = jest.fn();

describe("Client API Wrapper", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an event", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "123",
          name: "Test Event",
          urlSlug: "test-event-abc",
        },
      }),
    });

    const result = await createEvent("Test Event");
    expect(result.urlSlug).toBe("test-event-abc");
  });

  it("should handle API errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: "Validation failed",
      }),
    });

    try {
      await createEvent("");
      fail("Should have thrown");
    } catch (error: any) {
      expect(error.message).toContain("Validation failed");
    }
  });

  it("should fetch event by slug", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: "123",
          name: "Test Event",
          participants: [],
          expenses: [],
        },
      }),
    });

    const result = await getEvent("test-event-abc");
    expect(result.name).toBe("Test Event");
  });
});
