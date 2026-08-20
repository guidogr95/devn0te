import { describe, it, expect } from "vitest";
import { NoteMapper } from "./notes.mapper";
import { NoteSharingTypeEnum } from "../../core/enums/note-sharing-type.enum";

describe("noteResponseToEntity", () => {
  it("maps all expected fields from NoteResponse to NoteEntity", () => {
    const response = {
      id: 42,
      connector_id: "abc-123",
      title: "Test Note",
      content: "Hello world",
      sharing_type: NoteSharingTypeEnum.PUBLIC as NoteSharingTypeEnum,
      user_id: 7,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-06-15T12:00:00.000Z",
      sharing_url: "https://example.com/shared/abc",
    };

    const mapped = NoteMapper.noteResponseToEntity(response);

    expect(mapped.id).toBe(42);
    expect(mapped.connectorId).toBe("abc-123");
    expect(mapped.title).toBe("Test Note");
    expect(mapped.content).toBe("Hello world");
    expect(mapped.sharingType).toBe(NoteSharingTypeEnum.PUBLIC);
    expect(mapped.userId).toBe(7);
    expect(mapped.createAt).toBe("2025-01-01T00:00:00.000Z");
    expect(mapped.updatedAt).toBe("2025-06-15T12:00:00.000Z");
    expect(mapped.sharingUrl).toBe("https://example.com/shared/abc");
  });

  it("does not carry sharingPassword key (N40 regression guard)", () => {
    const response = {
      id: 1,
      connector_id: "c",
      title: "t",
      content: "x",
      sharing_type: NoteSharingTypeEnum.PUBLIC as NoteSharingTypeEnum,
      user_id: 1,
      created_at: "c",
      updated_at: "u",
      sharing_url: "u",
    };

    const mapped = NoteMapper.noteResponseToEntity(response);
    expect("sharingPassword" in (mapped as unknown as Record<string, unknown>)).toBe(false);
  });
});
