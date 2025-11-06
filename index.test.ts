import {
  HapticaExtensionSettingsSchema,
  HapticaExtensionSettingsValue,
  hapticaValidateSetting,
} from "./index";

describe("HapticaKit tests", () => {
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
