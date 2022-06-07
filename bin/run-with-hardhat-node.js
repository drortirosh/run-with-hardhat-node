#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const { basename } = require('path')
require('colors')

const ownName = basename(process.argv[1])

if(process.argv.length < 3) {
    console.error(
`run with '${ownName} [--cmd cmd] --wait [waitstring] --sub [node] [hardhat-node-options] inner-cmd'

cmd - a single file executable. better not be a shell script, otherwise, might leave orphan
  processes if stopped.
waitstring - a string to wait to indicate the node is up.
sub - subcommand. the first param to pass (defaults to "node")
options - more options to pass to "hardhat node"

inner-cmd - the inner command to run. wrap in quotes to run several commands.
Make sure that cmd is a standalone shell argument.
For example, if trying to 'truffle migrate && truffle test'
alongside a TestRPC sc fork instance with 2 addresses:

  ${ownName} --cmd testrpc-sc -a 2 'truffle migrate && truffle test'
`
    )
    process.exit(2)
}

let cmdVerbose = false
let cmdArgs = process.argv.slice(2, -1)

function getArg(name, isFlag=false) {
  if ( cmdArgs[0] == name ) {
    cmdArgs.shift()
    if (!isFlag) {
        arg = cmdArgs.shift()
    }
    return true 
  } else {
    return false
  }
}

let cmdCmd = 'hardhat'
let cmdSub = 'node'
let cmdWaitString = 'Started HTTP'
while (true) {
    console.log('args=', cmdArgs)
   if ( getArg('--cmd') ) {
      cmdCmd = arg
   } else
   if ( getArg('--sub') ) {
      cmdSub = arg
   } else
   if ( getArg('--verbose', true) ) {
      cmdVerbose=true
   } else
   if ( getArg('--wait') ) {
      cmdWaitString = arg
   } else {
      break
   }
}

const innerCmd = process.argv[process.argv.length - 1]

const cmdLine = [ cmdSub, ...cmdArgs ]
let testrpc
if ( cmdVerbose) {
    console.log({innerCmd, cmdCmd, cmdLine, cmdArgs})
}
new Promise((resolve, reject) => {
    const handleError = (err) => {
        if(err.code === 'ENOENT')
            return reject(new Error(`Could not find ${cmdCmd}`))
        if(err.code === 'EACCES')
            return reject(new Error(`Need permission to execute ${cmdCmd}`))
        return reject(err)
    }

    try {
        testrpc = spawn(cmdCmd, cmdLine)
    } catch(err) {
        return handleError(err)
    }

    testrpc.stdout.on('data', (data) => {
        if (cmdVerbose) { process.stdout.write(data) }
        if(data.includes(cmdWaitString)) {
            resolve()
        }
    })

    let error = ''

    testrpc.stderr.on('data', (data) => {
        if (cmdVerbose) { process.stderr.write(data) }
        error += data
    })

    testrpc.on('error', handleError)

    testrpc.on('close', (code) =>
        reject(new Error(`${cmdCmd} exited early with code ${code}`))
    )
}).then(() => {
    execSync(innerCmd, { stdio: 'inherit' })
}).then(() => {
    testrpc.kill()
    process.exit()
}).catch((err) => {
    if(testrpc) testrpc.kill()
    console.error(`\n  ${err.message.red}\n`)
    process.exit(1)
})
