import { describe, it, expect } from "vitest";
import {
  SHARED_PASSWORD_MISSING_CODE,
  SHARED_PASSWORD_WRONG_CODE,
  SHARED_PRIVATE_CODE,
  TITLE_TAKEN_CODE,
  CONNECTOR_ID_COLLISION_CODE,
} from "./note-error-codes";

describe("note error codes", () => {
  it("exports the five canonical codes", () => {
    expect(SHARED_PASSWORD_MISSING_CODE).toBeDefined();
    expect(SHARED_PASSWORD_WRONG_CODE).toBeDefined();
    expect(SHARED_PRIVATE_CODE).toBeDefined();
    expect(TITLE_TAKEN_CODE).toBeDefined();
    expect(CONNECTOR_ID_COLLISION_CODE).toBeDefined();
  });

  it.each([
    [SHARED_PASSWORD_MISSING_CODE, 1001, "SHARED_PASSWORD_MISSING"],
    [SHARED_PASSWORD_WRONG_CODE, 1002, "SHARED_PASSWORD_WRONG"],
    [SHARED_PRIVATE_CODE, 1003, "SHARED_PRIVATE"],
    [TITLE_TAKEN_CODE, 1004, "TITLE_TAKEN"],
    [CONNECTOR_ID_COLLISION_CODE, 1005, "CONNECTOR_ID_COLLISION"],
  ])("code %s maps to %s (%s)", (actual, expected, _label) => {
    expect(actual).toBe(expected);
  });
});
