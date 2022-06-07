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
npx run-with-hardhat-node --cmd testrpc-sc --sub '' -a 32 'truffle migrate && truffle test'
```

cmd - defaults to 'hardhat'
sub - defaults to 'node'
wait - defaults to 'Started HTTP'

