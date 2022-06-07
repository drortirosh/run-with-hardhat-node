# run-with-hardhat-node
Runs commands with "Hatdhat node" in the background, running on port 8545 (unless `--port` is used)

Use when internal "hardhat" network can't be used (e.g. when external processes needs to inteact with the blockchain)

Install with:

```
npm i --save-dev run-with-hardhat-node
```

Basic usage example:

```
npx run-with-hardhat-node 'truffle test'
```

Note that the command is one shell argument.

```
npx run-with-hardhat-node --port 12345 'truffle migrate && truffle test'
```

These parameters can appear just after the command. Anything after them is passed as parameters to the "hardhat node" command.
- `--cmd` - command to launch in the background. defaults to 'hardhat'
- `--sub` - subcommand (first arg) defaults to 'node' (but defaults to '' if `--cmd` specified)
- `--wait` - String to wait for. defaults to 'Started HTTP'

To launch "ganache" (just like `run-with-testrpc`):

```
npx run-with-hardhat-node --cmd 'gaanche-cli' --wait Listening --verbose 'truffle test'
```
