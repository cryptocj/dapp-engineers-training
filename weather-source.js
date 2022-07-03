const { default: axios } = require("axios");

const weatherSourceUrl = "https://goweather.herokuapp.com/weather";

const impossibleTemperature = 1000;
const temperatureDecimal = 2;

async function getTemperatureByCity(cityName) {
  const url = `${weatherSourceUrl}/${cityName}`;
  try {
    const { data } = await axios.get(url);
    if (!data.hasOwnProperty("temperature")) {
      return impossibleTemperature;
    }
    return parseTemperature(data.temperature);
  } catch (error) {
    console.log(error);
    return impossibleTemperature;
  }
}

async function getTemperatureWithDecimalByCity(cityName) {
  let temperature = await getTemperatureByCity(cityName);
  if (temperature != impossibleTemperature) {
    return temperature * 10 ** temperatureDecimal;
  }
  return impossibleTemperature;
}

// +27.2 °C
// -27.2 °C
function parseTemperature(temperatureStr) {
  return parseFloat(temperatureStr) || impossibleTemperature;
}

module.exports = {
  getTemperatureByCity: getTemperatureByCity,
  getTemperatureWithDecimalByCity: getTemperatureWithDecimalByCity,
  parseTemperature: parseTemperature,
  impossibleTemperature: impossibleTemperature,
  temperatureDecimal: temperatureDecimal,
};
