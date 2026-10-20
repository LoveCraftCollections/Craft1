import { describe, expect, it } from "vitest";
import { demoWedding, findPublishedWedding, getCeremonyTimestamp, getCountdownParts, switchWeddingTemplate, templates, weddingConfigSchema } from "./wedding";
import { rsvpSchema } from "./validation";

describe("demo wedding configuration", () => {
  it("validates the fictional Telugu invitation", () => {
    expect(weddingConfigSchema.parse(demoWedding).couple.names.te).toBe("శ్రావణి & కార్తిక్");
  });

  it("rejects public URLs with an invalid slug", () => {
    expect(weddingConfigSchema.safeParse({ ...demoWedding, slug: "not a slug" }).success).toBe(false);
  });

  it("does not expose drafts or unrelated weddings through public slug lookup", () => {
    const draft = { ...demoWedding, id: "draft", slug: "private-wedding", published: false };
    expect(findPublishedWedding([draft, demoWedding], "sravani-karthik")).toBe(demoWedding);
    expect(findPublishedWedding([draft, demoWedding], "private-wedding")).toBeNull();
    expect(findPublishedWedding([demoWedding], "unknown-wedding")).toBeNull();
  });

  it("calculates the ceremony countdown in its venue time zone", () => {
    const ceremony = getCeremonyTimestamp(demoWedding);
    const parts = getCountdownParts(demoWedding, ceremony - 86_400_000 - 61_000);
    expect(parts).toEqual({ days: 1, hours: 0, minutes: 1, seconds: 1 });
    expect(getCountdownParts(demoWedding, ceremony)).toBeNull();
  });

  it("switches design while preserving invitation and RSVP data", () => {
    for (const template of templates) {
      const preview = switchWeddingTemplate(demoWedding, template);
      expect(preview.theme.template).toBe(template);
      expect(preview.events).toBe(demoWedding.events);
      expect(preview.rsvp).toBe(demoWedding.rsvp);
      expect(preview.venue).toBe(demoWedding.venue);
      expect(preview.theme.palette).toBe(demoWedding.theme.palette);
      expect(preview.theme.typography).toBe(demoWedding.theme.typography);
    }
  });

  it("validates guest RSVPs and rejects missing names and unreasonable party sizes", () => {
    expect(rsvpSchema.parse({ name: "  Sita Rao  ", attending: "yes", guests: 2, message: "Best wishes" }).name).toBe("Sita Rao");
    expect(rsvpSchema.parse({ name: "Kiran", attending: "no", guests: 1, message: "" }).attending).toBe("no");
    expect(rsvpSchema.safeParse({ name: " ", attending: "yes", guests: 2, message: "" }).success).toBe(false);
    expect(rsvpSchema.safeParse({ name: "Kiran", attending: "yes", guests: 11, message: "" }).success).toBe(false);
  });
});