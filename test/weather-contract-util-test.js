var expect = require("chai").expect;

const {
  getStringByByteCode,
  getByteCodeByString,
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
});
