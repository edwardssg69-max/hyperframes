import { describe, expect, it } from "vitest";
import { saveFault } from "./case.mjs";
import { score } from "./report.mjs";

const measured = (undoTimeout) => ({
  tracking: { max: 0.1 },
  pressJump: 0,
  teleport: null,
  drop: 0,
  reload: 0,
  render: 0,
  undo: { bytes: true, redoBytes: true, box: 0, redoBox: 0 },
  undoTimeout,
  smooth: { intervals: [16], work: [2], control: { intervals: [16], work: [2] } },
  unsettled: [],
});

describe("undo and redo saves", () => {
  it("names the first late or lost write, or none", () => {
    const ok = { reached: true, late: false };
    expect(
      saveFault([
        ["undo", ok],
        ["redo", ok],
      ]),
    ).toBe(null);
    expect(
      saveFault([
        ["undo", { reached: true, late: true }],
        ["redo", ok],
      ]),
    ).toBe("undo late");
    expect(
      saveFault([
        ["undo", ok],
        ["redo", { reached: false }],
      ]),
    ).toBe("redo lost");
  });

  it("fails undo on a late save even when the bytes come back right", () => {
    expect(score({}, measured(null)).checks.undo).toBe(true);
    expect(score({}, measured("undo late")).checks.undo).toBe(false);
    expect(score({}, measured("redo lost")).checks.undo).toBe(false);
  });
});
