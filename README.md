## Assignment 1: Read a smart contract

read-oracle.js

```shell
node read-oracle.js
[7/3/2022, 11:36:51 PM] 19046.09857143
```

## Assignment 2: Write data to a smart contract

report-single-city-temperature.js

```shell
PRIVATE_KEY=xxxxxx node report-single-city-temperature.js
report temperature 2800 of shenzhen
confirmed tx id: 0xa021bd93225e550dcb8a4f0092238c4dffc8809dd7f971327011958dd4afd5f4
get temperature +28 °C of shenzhen from contract by batch id 1656864453
```

## Additional Task: multicall

get-multiple-city-temperature.js

need to compile and deploy the multicall contract first.

1. check solc version

```shell
solc --version
solc, the solidity compiler commandline interface
Version: 0.8.13+commit.abaa5c0e.Darwin.appleclang
```

2. compile

```shell
./compile.sh
```

3. deploy to get the multicall contract address

```shell
PRIVATE_KEY=xxxxxx node deploy.js
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
node get-multiple-city-temperature.js
get temperature -27.2 °C of shenzhen from contract by batch id 1656757414
get temperature +26 °C of shenzhen from contract by batch id 1656757389
```
