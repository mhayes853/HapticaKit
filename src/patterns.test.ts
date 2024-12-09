import { AHAPPattern } from "./ahap";
import { HapticaExtensionError } from "./error";
import { patterns } from "./patterns";

const TEST_AHAP_PATTERN: AHAPPattern = {
  Version: 1,
  Pattern: [
    {
      Event: {
        EventType: "HapticTransient",
        Time: 0,
        EventParameters: [
          { ParameterID: "HapticIntensity", ParameterValue: 0.5 },
          { ParameterID: "HapticSharpness", ParameterValue: 0.5 },
        ],
      },
    },
    {
      Event: {
        EventType: "HapticContinuous",
        Time: 0,
        EventDuration: 2,
        EventParameters: [
          { ParameterID: "HapticIntensity", ParameterValue: 0.5 },
          { ParameterID: "HapticSharpness", ParameterValue: 0.5 },
        ],
      },
    },
    {
      Event: {
        EventType: "AudioCustom",
        EventWaveformPath: "coins.caf",
        EventDuration: 3.0,
        Time: 0.5,
        EventParameters: [{ ParameterID: "AudioVolume", ParameterValue: 0.3 }],
      },
    },
    {
      Event: {
        EventType: "AudioContinuous",
        Time: 0.75,
        EventDuration: 2.0,
        EventParameters: [
          { ParameterID: "AudioVolume", ParameterValue: 0.5 },
          { ParameterID: "AudioPan", ParameterValue: 0.2 },
        ],
      },
    },
    {
      ParameterCurve: {
        ParameterID: "HapticIntensityControl",
        Time: 0,
        ParameterCurveControlPoints: [
          { ParameterValue: 0, Time: 0 },
          { ParameterValue: 1, Time: 0.1 },
          { ParameterValue: 0.5, Time: 2 },
        ],
      },
    },
    {
      ParameterCurve: {
        ParameterID: "HapticSharpnessControl",
        Time: 2,
        ParameterCurveControlPoints: [
          { ParameterValue: 0, Time: 0 },
          { ParameterValue: 1, Time: 0.1 },
          { ParameterValue: 0.5, Time: 2 },
        ],
      },
    },
  ],
};

describe("HapticaPatternsMock tests", () => {
  it("should return no patterns when empty", async () => {
    const values = await patterns.withTransaction((handle) => {
      return handle.fetchPatterns();
    });
    expect(values).toEqual([]);
  });

  it("should save and load patterns", async () => {
    await patterns.withTransaction((handle) => {
      const pattern = handle.save({
        name: "Test",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      const patterns = handle.fetchPatterns();
      expect(patterns).toEqual([pattern]);
    });
  });

  it("should edit a pattern when saving twice", async () => {
    await patterns.withTransaction((handle) => {
      const pattern = handle.save({
        name: "Test",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      handle.save({
        id: pattern.id,
        name: "Blob",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      const patterns = handle.fetchPatterns();
      expect(patterns).toEqual([
        { ...pattern, name: "Blob", lastEditedAt: expect.any(Date) },
      ]);
    });
  });

  it("should throw an error when attempting to edit a non-existent pattern", async () => {
    await patterns.withTransaction((handle) => {
      expect(() => {
        handle.save({
          id: "dkljldkjkldj",
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
          audioFiles: [],
        });
      }).toThrow(HapticaExtensionError.patternWithIdNotFound("dkljldkjkldj"));
    });
  });

  it("should be able to conditionally fetch patterns", async () => {
    await patterns.withTransaction((handle) => {
      handle.save({
        name: "Test",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      const expectedPattern = handle.save({
        name: "Blob",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      const patterns = handle.fetchPatterns((p) => p.name === "Blob");
      expect(patterns).toEqual([expectedPattern]);
    });
  });

  it("should be able to delete patterns", async () => {
    await patterns.withTransaction((handle) => {
      const { id } = handle.save({
        name: "Test",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      const pattern2 = handle.save({
        name: "Blob",
        ahapPattern: TEST_AHAP_PATTERN,
        audioFiles: [],
      });
      handle.deletePattern(id);
      const patterns = handle.fetchPatterns();
      expect(patterns).toEqual([pattern2]);
    });
  });
});
