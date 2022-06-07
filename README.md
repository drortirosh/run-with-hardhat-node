# run-with-hardhat-node
Runs commands with "Hatdhat node" in the background. Install with:

```
npm i --save-dev run-with-hardhat-node
```

Basic usage example:

```
npx run-with-hardhat-node 'truffle test'
```

Note that the command is one shell argument.


You can run a TestRPC sc fork instance using 32 addresses with:

```
npx run-with-hardhat-node --cmd testrpc-sc -a 32 'truffle migrate && truffle test'
```

- `--cmd` - command to launch in the background. defaults to 'hardhat'
- `--sub` - subcommand (first arg) defaults to 'node' (but defaults to '' if `--cmd` specified)
- `--wait` - String to wait for. defaults to 'Started HTTP'

