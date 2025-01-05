import {
  AHAPPattern,
  extension,
  HapticaExtensionError,
  HapticaExtensionSettings,
  patterns,
} from "./index";

describe("HapticaKit tests", () => {
  describe("HapticExtension tests", () => {
    beforeEach(() => extension.reset());

    it("should use a uuid for the mocked extension id", () => {
      expect(isUUIDv7(extension.id)).toEqual(true);
    });

    it("should throw an error when trying to get settings for unregistered extension", () => {
      expect(() => extension.settings).toThrow(
        HapticaExtensionError.MANIFEST_NOT_REGISTERED,
      );
    });

    it("should not indicate that a manifest has been registered by default", () => {
      expect(extension.manifest).toEqual(undefined);
      expect(extension.isManifestRegistered).toEqual(false);
    });

    it("should indicate that a manifest has been registered", () => {
      const manifest = { name: "Test" };
      extension.registerManifest(manifest);
      expect(extension.manifest).toEqual(manifest);
      expect(extension.isManifestRegistered).toEqual(true);
    });

    it("should throw an error when trying to register a manifest after it has been registered", () => {
      extension.registerManifest({ name: "Test" });
      expect(() => extension.registerManifest({ name: "Another" })).toThrow(
        HapticaExtensionError.MANIFEST_ALREADY_REGISTERED,
      );
    });

    const isUUIDv7 = (uuid: string) => {
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidV4Regex.test(uuid);
    };
  });

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
          EventParameters: [
            { ParameterID: "AudioVolume", ParameterValue: 0.3 },
          ],
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
        const pattern = handle.create({
          name: "Test",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        const patterns = handle.fetchPatterns();
        expect(patterns).toEqual([pattern]);
      });
    });

    it("should edit a pattern when saving twice", async () => {
      await patterns.withTransaction((handle) => {
        const pattern = handle.create({
          name: "Test",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        handle.update({
          id: pattern.id,
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
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
          handle.update({
            id: "dkljldkjkldj",
            name: "Blob",
            ahapPattern: TEST_AHAP_PATTERN,
          });
        }).toThrow(HapticaExtensionError.patternWithIdNotFound("dkljldkjkldj"));
      });
    });

    it("should be able to conditionally fetch patterns", async () => {
      await patterns.withTransaction((handle) => {
        handle.create({
          name: "Test",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        const expectedPattern = handle.create({
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        const patterns = handle.fetchPatterns((p) => p.name === "Blob");
        expect(patterns).toEqual([expectedPattern]);
      });
    });

    it("should be able to delete patterns", async () => {
      await patterns.withTransaction((handle) => {
        const { id } = handle.create({
          name: "Test",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        const pattern2 = handle.create({
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        handle.deletePattern(id);
        const patterns = handle.fetchPatterns();
        expect(patterns).toEqual([pattern2]);
      });
    });

    it("should load audio associated with the pattern", async () => {
      const file = new HapticaAudioFile(
        "coins.caf",
        new Uint8Array([0x01, 0x02]),
      );
      const file2 = new HapticaAudioFile(
        "test.caf",
        new Uint8Array([0x03, 0x04]),
      );
      file.save();
      file2.save();
      await patterns.withTransaction((handle) => {
        const pattern = handle.create({
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        const patterns = handle.fetchPatterns();
        expect(pattern.audioFiles).toEqual([file]);
        expect(patterns).toEqual([pattern]);
      });
    });

    it("should load audio associated with the pattern after it has been saved", async () => {
      const file = new HapticaAudioFile(
        "coins.caf",
        new Uint8Array([0x01, 0x02]),
      );
      await patterns.withTransaction((handle) => {
        const pattern = handle.create({
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        file.save();
        const patterns = handle.fetchPatterns();
        expect(pattern.audioFiles).toEqual([]);
        expect(patterns[0].audioFiles).toEqual([file]);
      });
    });

    it("should not load audio associated with the pattern when it has been deleted", async () => {
      const file = new HapticaAudioFile(
        "coins.caf",
        new Uint8Array([0x01, 0x02]),
      );
      file.save();
      file.delete();
      await patterns.withTransaction((handle) => {
        const pattern = handle.create({
          name: "Blob",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        const patterns = handle.fetchPatterns();
        expect(pattern.audioFiles).toEqual([]);
        expect(patterns).toEqual([pattern]);
      });
    });

    it("should throw an error when trying to delete an unsaved audio file", () => {
      const file = new HapticaAudioFile(
        "coins.caf",
        new Uint8Array([0x01, 0x02]),
      );
      expect(() => file.delete()).toThrow(
        HapticaExtensionError.audioFileNotFound(file.filename),
      );
    });

    it("should be able to detect when a pattern is stored", async () => {
      await patterns.withTransaction((handle) => {
        expect(handle.containsPatternWithId("skljkldjkldj")).toEqual(false);
        const pattern = handle.create({
          name: "Test",
          ahapPattern: TEST_AHAP_PATTERN,
        });
        expect(handle.containsPatternWithId(pattern.id)).toEqual(true);
        handle.deletePattern(pattern.id);
        expect(handle.containsPatternWithId(pattern.id)).toEqual(false);
      });
    });
  });

  describe("HapticaExtensionSettings tests", () => {
    let settings: HapticaExtensionSettings;
    beforeEach(() => {
      extension.reset();
      extension.registerManifest({
        name: "Test",
        settingsSchemas: [
          { type: "toggle", name: "test", defaultValue: true },
          { type: "text-field", name: "blob", defaultValue: "hello world" },
        ],
      });
      settings = extension.settings;
    });

    it("should use the default value when no value for setting", () => {
      expect(settings.value("blob")).toEqual("hello world");
    });

    it("should use the set value when overriding value for setting", () => {
      settings.setValue("blob", "test");
      expect(settings.value("blob")).toEqual("test");
    });

    it("should not set a value for a setting that is not in the schema", () => {
      expect(() => settings.setValue("slkjslkjs", "test")).toThrow(
        HapticaExtensionError.settingNameNotFound("slkjslkjs", [
          "test",
          "blob",
        ]),
      );
      expect(() => settings.value("slkjslkjs")).toThrow(
        HapticaExtensionError.settingNameNotFound("slkjslkjs", [
          "test",
          "blob",
        ]),
      );
    });

    it("should be able to tell when a value is not in the schema", () => {
      expect(settings.has("slkjslkjs")).toEqual(false);
    });

    it("should be able to tell when a value is in the schema", () => {
      expect(settings.has("blob")).toEqual(true);
    });

    it("should reset all settings values to their defaults when resetting", () => {
      settings.setValue("blob", "test");
      settings.setValue("test", false);
      settings.reset();
      expect(settings.value("blob")).toEqual("hello world");
      expect(settings.value("test")).toEqual(true);
    });

    it("should be able to reset a single setting to its defaults", () => {
      settings.setValue("blob", "test");
      settings.setValue("test", false);
      settings.reset("blob");
      expect(settings.value("blob")).toEqual("hello world");
      expect(settings.value("test")).toEqual(false);
    });

    it("should be able to reset multiple settings to their defaults", () => {
      settings.setValue("blob", "test");
      settings.setValue("test", false);
      settings.reset(["blob", "test"]);
      expect(settings.value("blob")).toEqual("hello world");
      expect(settings.value("test")).toEqual(true);
    });

    it("should throw an error when attempting to set an invalid typed value for setting", () => {
      expect(() => settings.setValue("blob", 10)).toThrow(
        HapticaExtensionError.invalidSettingNameType(
          "blob",
          "number",
          "string | undefined",
        ),
      );
    });
  });
});
