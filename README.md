All assignments are put into `assignments/first-week` dir.

run `npm install` first.

## Assignment 1: Read a smart contract

read-oracle.js

```shell
node assignments/first-week/read-oracle.js
[7/4/2022, 12:37:00 AM] 19082.83571429
```

## Assignment 2: Write data to a smart contract

report-single-city-temperature.js

```shell
PRIVATE_KEY=xxxxxx node ./assignments/first-week/report-single-city-temperature.js
report temperature 2800 of shenzhen
confirmed tx id: 0xa021bd93225e550dcb8a4f0092238c4dffc8809dd7f971327011958dd4afd5f4
get temperature +28 °C of shenzhen from contract by batch id 1656864453
```

## Additional Task
### Question 1 
If the API returns the temperature in a decimal form (like 27.5 C),
how to submit this decimal number to the smart contract while keeping its precision?

Pls check in `weather-source.js`, 
we can magnify the temperature from `27.5` to `2750`, 
and do the conversion when reading from the contract.
### Question 2
How to store a negative temperature while keeping the current smart contract interface unchanged?

Pls check in `weather-contract-util.js`,
Normally, temperature should be range from -100 to 100,
we can use a specific bit(0x10000) as a signal flag.

The encode function is:
```javascript
function encodeTemperatureBySignBit(temperature) {
  if (temperature < 0) return -temperature | signBit;
  return temperature;
}
```

The decode function is:
```javascript
function decodeTemperatureFromContract(temperature) {
  if (temperature == impossibleTemperature * 10 ** temperatureDecimal) {
    return "impossible";
  }
  let exactTemperature = temperature;
  let signFlag = "+";
  if (temperature & signBit) {
    signFlag = "-";
    exactTemperature = temperature & ~signBit;
  }
  return `${signFlag}${exactTemperature / 10 ** temperatureDecimal} °C`;
}
```

### Question 3
multicall

get-multiple-city-temperatures-by-multicall.js

need to compile and deploy the multicall contract first.

1. check solc version

```shell
solc --version
solc, the solidity compiler commandline interface
Version: 0.8.13+commit.abaa5c0e.Darwin.appleclang
```

2. compile

```shell
./assignments/first-week/tools/compile.sh
```

3. deploy to get the multicall contract address

```shell
PRIVATE_KEY=xxxxxx node ./assignments/first-week/deploy.js
0x6Fa034953e2e880A8f3F70707fb1483189B06879
...
...
```

4. replace the multicall contract address in `constants.js`

```javascript
const multicallAddress = "0xd2e17686dD5642318e182179081854C7eB32fB56";
```

5. use multicall to query

```shell
node ./assignments/first-week/get-multiple-city-temperatures-by-multicall.js
get temperature -27.2 °C of shenzhen from contract by batch id 1656757414
get temperature +26 °C of shenzhen from contract by batch id 1656757389
```

Question 3: During the "Step 3" in the task, it will take 3 JSON-RPC calls to
read weather info for 3 cities from smart contract. Is it possbile to reduce
that to only one request to get all the data back? (Hint: Google search
"makerdao multicall")