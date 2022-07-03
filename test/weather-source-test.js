var expect = require("chai").expect;
const HttpRequestMock = require("http-request-mock");
const mocker = HttpRequestMock.setup();
const axios = require("axios");
const shenzhen = require("./weather/shenzhen");
const shenzhen1 = require("./weather/shenzhen1");

const {
  getTemperatureWithDecimalByCity,
  weatherSourceUrl,
  parseTemperature,
  impossibleTemperature,
  temperatureDecimal,
} = require("../weather-source");

describe("Weather source query and parse", function () {
  describe("parse weather source", function () {
    it("parseTemperature", function () {
      let temperatureStrList = [
        "+27 °C",
        "+27.2 °C",
        "",
        "-27.2 °C",
        "-27 °C",
        "invalid weather",
        "+10000 °C",
        "-10000.2 °C",
      ];
      let expectTemperatureList = [
        27,
        27.2,
        impossibleTemperature,
        -27.2,
        -27,
        impossibleTemperature,
        10000,
        -10000.2,
      ];
      for (let i = 0; i < temperatureStrList.length; i++) {
        expect(parseTemperature(temperatureStrList[i])).to.equal(
          expectTemperatureList[i]
        );
      }
    });
  });

  describe("query weather source", function () {
    beforeEach(function () {
      this.currentTest.cityList = ["shenzhen", "shenzhen1"];
      let cityList = this.currentTest.cityList;
      let cityWeatherList = [shenzhen, shenzhen1];
      for (let i = 0; i < cityList.length; i++) {
        mocker.get(
          `${weatherSourceUrl}/${cityList[i]}`,
          JSON.stringify(cityWeatherList[i])
        );
      }
    });

    it("getTemperatureWithDecimalByCity", async function () {
      let cityList = this.test.cityList;
      let expectTemperatureList = [2900, 100000];
      for (let i = 0; i < cityList.length; i++) {
        let temperature = await getTemperatureWithDecimalByCity(cityList[i]);
        expect(temperature).equal(expectTemperatureList[i]);
      }
    });
  });
});
