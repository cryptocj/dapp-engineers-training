var expect = require("chai").expect;
const HttpRequestMock = require("http-request-mock");
const mocker = HttpRequestMock.setup();
const shenzhen = require("./weather/shenzhen");
const shenzhen1 = require("./weather/shenzhen1");
const montevideo = require("./weather/montevideo");

const {
  getTemperatureWithDecimalByCity,
  weatherSourceUrl,
  parseTemperature,
  impossibleTemperature,
} = require("../assignments/first-week/weather-source");

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
        "27 °C",
        "0 °C",
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
        27,
        0,
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
      this.currentTest.cityList = ["shenzhen", "shenzhen1", "montevideo"];
      let cityList = this.currentTest.cityList;
      let cityWeatherList = [shenzhen, shenzhen1, montevideo];
      for (let i = 0; i < cityList.length; i++) {
        mocker.get(
          `${weatherSourceUrl}/${cityList[i]}`,
          JSON.stringify(cityWeatherList[i])
        );
      }
    });

    it("getTemperatureWithDecimalByCity", async function () {
      let cityList = this.test.cityList;
      let expectTemperatureList = [2900, 100000, -300];
      for (let i = 0; i < cityList.length; i++) {
        let temperature = await getTemperatureWithDecimalByCity(cityList[i]);
        expect(temperature).equal(expectTemperatureList[i]);
      }
    });
  });
});
