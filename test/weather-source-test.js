var expect = require("chai").expect;
const {
  getTemperatureWithDecimalByCity,
  parseTemperature,
  impossibleTemperature,
  temperatureDecimal,
} = require("../weather-source");

describe("Weather source query and parse", function () {
  describe("query weather source", function () {
    it("converts the basic colors", function () {});
  });

  describe("parse weather source", function () {
    it("parseTemperature", function () {
      let temperatureStrList = ["+27 °C", "+27.2 °C", "", "-27.2 °C", "-27 °C"];
      let expectTemperature = [27, 27.2, impossibleTemperature, -27.2, -27];
      for (let i = 0; i < temperatureStrList.length; i++) {
        expect(parseTemperature(temperatureStrList[i])).to.equal(
          expectTemperature[i]
        );
      }
    });
  });
});
