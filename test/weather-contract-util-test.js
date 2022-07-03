var expect = require("chai").expect;

const {
  getStringByByteCode,
  getByteCodeByString,
  encodeTemperatureWithSignBit,
  signBit,
} = require("../weather-contract-util");

describe("Weather contract util", function () {
  describe("convert between with bytecode and string", function () {
    it("convert bytecode to string", function () {
      expect(
        getStringByByteCode(
          "0x7368656e7a68656e000000000000000000000000000000000000000000000000"
        )
      ).equal("shenzhen");
    });

    it("convert string to bytecode", function () {
      expect(getByteCodeByString("shenzhen")).equal(
        "0x7368656e7a68656e000000000000000000000000000000000000000000000000"
      );
    });
  });

  describe("encode and decode temperature from contract", function () {
    it("encode", function () {
      let temperatureWithDecimalList = [2700, 0, -2700];
      let expectTemperatureList = [2700, 0, 2700 | signBit];
      for (let i = 0; i < temperatureWithDecimalList.length; i++) {
        expect(
          encodeTemperatureWithSignBit(temperatureWithDecimalList[i])
        ).equal(expectTemperatureList[i]);
      }
    });
  });
});
