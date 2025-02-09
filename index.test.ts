import {
  _hapticaAHAPJSONParseReviver,
  _hapticaAHAPJSONStringifyReplacer,
  AHAPAudioCustomEvent,
  AHAPPattern,
  audioFilesDirectory,
  extension,
  HapticaAudioFileID,
  HapticaAudioFilesDirectoryTransaction,
  HapticaExtensionError,
  HapticaExtensionSettings,
  HapticaExtensionSettingsSchema,
  HapticaExtensionSettingsValue,
  HapticaResourceAccessLevel,
  hapticaValidateSetting,
  patterns,
} from "./index";

describe("HapticaKit tests", () => {
  describe("HapticExtension tests", () => {
    beforeEach(() => extension.reset());

    it("should use a uuid for the mocked extension id", () => {
      expect(
        HapticaAudioFileID.__HAPTICA_UUID_V7_REGEX.test(extension.id),
      ).toEqual(true);
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

  describe("AudioFiles tests", () => {
    it("should load audio associated with the pattern", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        const file2 = new HapticaAudioFile("test.caf");
        file.save(new Uint8Array([0x01, 0x02]), tx);
        file2.save(new Uint8Array([0x03, 0x04]), tx);
        const files = tx.savedFilesForPattern(TEST_AHAP_PATTERN);
        expect(files).toEqual([file]);
      });
    });

    it("should be able to load all audio files based on edit time", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(0));
      const file = await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        file.save(new Uint8Array([0x01, 0x02]), tx);
        return file;
      });
      jest.setSystemTime(new Date(1000));
      await audioFilesDirectory.withTransaction((tx) => {
        const file2 = new HapticaAudioFile("test.caf");
        file2.save(new Uint8Array([0x03, 0x04]), tx);
        const files = tx.savedFiles();
        expect(files).toEqual([file2, file]);
      });
      jest.useRealTimers();
    });

    it("should load audio data", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        file.save(new Uint8Array([0x01, 0x02]), tx);
        const files = tx.savedFilesForPattern(TEST_AHAP_PATTERN);
        expect(files[0].bytes(tx)).toEqual(new Uint8Array([0x01, 0x02]));
      });
    });

    it("should overwrite existing audio", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        file.save(new Uint8Array([0x01, 0x02]), tx);
        file.save(new Uint8Array([0x03, 0x04]), tx);
        const files = tx.savedFilesForPattern(TEST_AHAP_PATTERN);
        expect(files[0].bytes(tx)).toEqual(new Uint8Array([0x03, 0x04]));
      });
    });

    it("should not load unsaved audio files", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const __ = new HapticaAudioFile("coins.caf");
        const _ = new HapticaAudioFile("test.caf");
        expect(tx.savedFiles()).toEqual([]);
      });
    });

    it("should not load audio associated with the pattern when it has been deleted", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        file.save(new Uint8Array([0x01, 0x02]), tx);
        file.delete(tx);
        const files = tx.savedFilesForPattern(TEST_AHAP_PATTERN);
        expect(files).toEqual([]);
      });
    });

    it("should throw an error when trying to delete an unsaved audio file", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        expect(() => file.delete(tx)).toThrow(
          HapticaExtensionError.audioFileNotFound(file.filename),
        );
      });
    });

    it("should throw an error when trying to load bytes from an unsaved audio file", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        expect(() => file.bytes(tx)).toThrow(
          HapticaExtensionError.audioFileNotFound(file.filename),
        );
      });
    });

    it("should throw a permissions error when trying to read an unowned file", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const owner = { type: "main-application" } as const;
        const file = new HapticaAudioFile(
          new HapticaAudioFileID("coins.caf", owner),
        );
        expect(() => file.bytes(tx)).toThrow(
          HapticaExtensionError.audioFileInvalidPermissions(
            file.filename,
            owner,
          ),
        );
      });
    });

    it("should throw a permissions error when trying to save an unowned file", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const owner = { type: "main-application" } as const;
        const file = new HapticaAudioFile(
          new HapticaAudioFileID("coins.caf", owner),
        );
        expect(() => file.save(new Uint8Array([0x01, 0x02]), tx)).toThrow(
          HapticaExtensionError.audioFileInvalidPermissions(
            file.filename,
            owner,
          ),
        );
      });
    });

    it("should throw a permissions error when trying to delete an unowned file", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const owner = { type: "main-application" } as const;
        const file = new HapticaAudioFile(
          new HapticaAudioFileID("coins.caf", owner),
        );
        expect(() => file.delete(tx)).toThrow(
          HapticaExtensionError.audioFileInvalidPermissions(
            file.filename,
            owner,
          ),
        );
      });
    });

    it("should be able to read an unowned file if it has read only access", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const owner = { type: "main-application" } as const;
        const file = new HapticaAudioFile(
          new HapticaAudioFileID("coins.caf", owner),
        ) as any;
        file.level = HapticaResourceAccessLevel.ReadWrite;
        file.accessLevel = () => file.level;
        const bytes = new Uint8Array([0x01, 0x02]);
        file.save(bytes, tx);
        file.level = HapticaResourceAccessLevel.ReadOnly;
        expect(file.bytes(tx)).toEqual(bytes);
      });
    });

    it("should return no access level when not owned by the extension", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile(
          new HapticaAudioFileID("coins.caf", { type: "main-application" }),
        );
        expect(file.accessLevel(tx)).toEqual(
          HapticaResourceAccessLevel.NoAccess,
        );
      });
    });

    it("should return a read-write access level when owned by the extension", async () => {
      await audioFilesDirectory.withTransaction((tx) => {
        const file = new HapticaAudioFile("coins.caf");
        expect(file.accessLevel(tx)).toEqual(
          HapticaResourceAccessLevel.ReadWrite,
        );
      });
    });
  });

  describe("HapticaAudioFileID tests", () => {
    it("should stringify itself into json", () => {
      let id = new HapticaAudioFileID("test.caf", {
        type: "main-application",
      });
      expect(JSON.stringify(id)).toEqual('"main-application|test.caf"');

      id = new HapticaAudioFileID("test.caf", {
        type: "extension",
        id: "8A5DFE4A-B10A-4D5A-931B-EAA4D23347E4",
      });
      expect(JSON.stringify(id)).toEqual(
        '"extension-8A5DFE4A-B10A-4D5A-931B-EAA4D23347E4|test.caf"',
      );
    });

    it("should be able to be used to construct Audio Files", () => {
      const id = new HapticaAudioFileID("test.caf", {
        type: "main-application",
      });
      const file = new HapticaAudioFile(id);
      expect(file.owner).toEqual({ type: "main-application" });
    });

    class X {}

    it.each([
      "",
      "sklslhjdklhdkjh",
      "main|test",
      "extension|test",
      "dkljdlkjdl.mp3",
      "foo|bar.mp3",
      "extension|bar.mp3",
      "extension-not-a-valid-uuid|bar.mp3",
      "extension-|bar.mp3",
      "main-|bar.mp",
      ,
      10,
      true,
      {},
      [1, 2, 3, 4],
      new X(),
    ])("should not parse %s", (s) => {
      expect(HapticaAudioFileID.parse(s as any)).toEqual(undefined);
    });

    it.each([
      new HapticaAudioFileID("test.caf"),
      new HapticaAudioFileID("foo.mp3", { type: "main-application" }),
    ])("should be able to be parsed from a string from $name", (id) => {
      expect(HapticaAudioFileID.parse(id.toString())).toEqual(id);
    });

    it("should be JSON Parseable when parsing an AHAP Pattern", () => {
      const index = TEST_AHAP_PATTERN.Pattern.findIndex((e) => {
        return "Event" in e && e.Event.EventType == "AudioCustom";
      });
      const baseEvent = TEST_AHAP_PATTERN.Pattern[index] as {
        Event: AHAPAudioCustomEvent;
      };
      const id = new HapticaAudioFileID("test.caf", {
        type: "main-application",
      });
      const newEvent = {
        Event: { ...baseEvent.Event, EventWaveformPath: id },
      };
      const pattern = {
        ...TEST_AHAP_PATTERN,
        Pattern: arrayWith(TEST_AHAP_PATTERN.Pattern, index, newEvent),
      };
      expect(
        JSON.parse(JSON.stringify(pattern), _hapticaAHAPJSONParseReviver),
      ).toEqual(pattern);
    });

    it("should stringify string pattern waveform paths to audio file ids", () => {
      const index = TEST_AHAP_PATTERN.Pattern.findIndex((e) => {
        return "Event" in e && e.Event.EventType == "AudioCustom";
      });
      const baseEvent = TEST_AHAP_PATTERN.Pattern[index] as {
        Event: AHAPAudioCustomEvent;
      };
      const newEvent = {
        Event: { ...baseEvent.Event, EventWaveformPath: "foo.mp3" },
      };
      const pattern = {
        ...TEST_AHAP_PATTERN,
        Pattern: arrayWith(TEST_AHAP_PATTERN.Pattern, index, newEvent),
      };
      expect(
        JSON.parse(
          JSON.stringify(pattern, _hapticaAHAPJSONStringifyReplacer),
          _hapticaAHAPJSONParseReviver,
        ),
      ).toEqual({
        ...TEST_AHAP_PATTERN,
        Pattern: arrayWith(TEST_AHAP_PATTERN.Pattern, index, {
          ...newEvent,
          Event: {
            ...newEvent.Event,
            EventWaveformPath: new HapticaAudioFileID("foo.mp3"),
          },
        }),
      });
    });

    const arrayWith = <T>(arr: T[], index: number, element: T) => {
      return arr.map((e, i) => (i === index ? element : e));
    };
  });

  describe("HapticaExtensionSettings tests", () => {
    let settings: HapticaExtensionSettings;
    beforeEach(() => {
      extension.reset();
      extension.registerManifest({
        name: "Test",
        settingsSchemas: [
          { type: "toggle", key: "test", defaultValue: true },
          { type: "text-field", key: "blob", defaultValue: "hello world" },
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
        HapticaExtensionError.invalidSetting(
          "blob",
          "Expected type 'string', but received 'number'.",
        ),
      );
    });
  });

  describe("HapticaValidateSetting tests", () => {
    it.each([
      [
        { type: "date-picker", key: "date", defaultValue: new Date() } as const,
        new Date(),
      ],
      [
        {
          type: "stepper",
          key: "stepper",
          defaultValue: 0,
          step: 1,
          min: 0,
          max: 20,
        } as const,
        10,
      ],
      [
        {
          type: "slider",
          key: "slider",
          defaultValue: 0,
          step: 1,
          min: 0,
          max: 20,
        } as const,
        10,
      ],
      [
        {
          type: "toggle",
          key: "toggle",
          defaultValue: false,
        } as const,
        false,
      ],
      [
        {
          type: "text-field",
          key: "basic text",
          defaultValue: "",
        } as const,
        "hello",
      ],
      [
        {
          type: "text-field",
          key: "validated text",
          defaultValue: "",
          validate: (s: string) =>
            ({
              status: s === "hello" ? "success" : "error",
              message: "Bad",
            }) as const,
        } as const,
        "hello",
      ],
    ])(
      "should return a success for %s",
      (
        schema: HapticaExtensionSettingsSchema,
        value: HapticaExtensionSettingsValue,
      ) => {
        expect(hapticaValidateSetting(schema, value)).toEqual({
          status: "success",
          value,
        });
      },
    );

    it.each([
      [
        {
          type: "date-picker",
          key: "date",
          defaultValue: new Date(),
          min: new Date(0),
        } as const,
        new Date(-1000),
        "The received value (1969-12-31T23:59:59.000Z) is below the minimum value of 1970-01-01T00:00:00.000Z.",
      ],
      [
        {
          type: "date-picker",
          key: "date",
          defaultValue: new Date(),
          max: new Date(1000),
        } as const,
        new Date(2000),
        "The received value (1970-01-01T00:00:02.000Z) is above the maximum value of 1970-01-01T00:00:01.000Z.",
      ],
      [
        {
          type: "stepper",
          key: "stepper",
          defaultValue: 0,
          step: 1,
          min: 0,
          max: 20,
        } as const,
        21,
        "The received value (21) is above the maximum value of 20.",
      ],
      [
        {
          type: "slider",
          key: "slider",
          defaultValue: 0,
          step: 1,
          min: 0,
          max: 20,
        } as const,
        -1,
        "The received value (-1) is below the minimum value of 0.",
      ],
      [
        {
          type: "slider",
          key: "string slider",
          defaultValue: 0,
          step: 1,
          min: 0,
          max: 20,
        } as const,
        "some string",
        "Expected type 'number', but received 'string'.",
      ],
      [
        {
          type: "slider",
          key: "array slider",
          defaultValue: 0,
          step: 1,
          min: 0,
          max: 20,
        } as const,
        ["foo"],
        "Expected type 'number', but received 'Array'.",
      ],
      [
        {
          type: "date-picker",
          key: "invalid date",
          defaultValue: new Date(),
        } as const,
        ["foo"],
        "Expected type 'Date', but received 'Array'.",
      ],
      [
        {
          type: "text-field",
          key: "validated text",
          defaultValue: "",
          validate: (s: string | undefined) =>
            ({
              status: s === "hello" ? "success" : "error",
              message: "Bad",
            }) as const,
        } as const,
        "bar",
        "Bad",
      ],
    ])(
      "should return a failure for %s",
      (
        schema: HapticaExtensionSettingsSchema,
        value: any,
        errorMessage: string,
      ) => {
        expect(hapticaValidateSetting(schema, value)).toEqual({
          status: "error",
          message: errorMessage,
        });
      },
    );
  });
});
