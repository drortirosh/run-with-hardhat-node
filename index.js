const { spawn, execSync } = require('child_process');

/**
 * launch command, and wait for it to start.
 * @param cmd
 * @param args
 * @param waitFor
 * @param verbose
 * @returns the started process.
 */
async function waitForCmdToStart({cmd, args, waitFor, verbose}) {
    let testrpc
    if (typeof cmd != 'string') throw new Error('missing {cmd:"..."} param')
    if (typeof waitFor != 'string') throw new Error('missing {waitFor:"..."} param')
    if (args && !Array.isArray(args)) throw new Error('args param is not an array')

    let lastData

    await new Promise((resolve, reject) => {
        const handleError = (err) => {
            if(err.code === 'ENOENT')
                return reject(new Error(`Could not find ${cmd}`))
            if(err.code === 'EACCES')
                return reject(new Error(`Need permission to execute ${cmd}`))
            return reject(err)
        }

        try {
            testrpc = spawn(cmd, args)
        } catch(err) {
            return handleError(err)
        }

        testrpc.stdout.on('data', (data) => {
            const dataFiltered = data.toString().replace(/\d+/g,'')
            if (verbose && dataFiltered != lastData) {
                process.stdout.write(data)
            }
            lastData = dataFiltered
            if(data.includes(waitFor)) {
                resolve(testrpc)
            }
        })

        let error = ''

        testrpc.stderr.on('data', (data) => {
            if (verbose) { process.stderr.write(data) }
            error += data
        })

        testrpc.on('error', handleError)

        testrpc.on('close', (code) =>
            reject(new Error(`${cmd} exited early with code ${code}`))
        )
    }) 
}
/**
 * 
 * @param cmd external command to run.
 * @param args parameters for external command
 * @param waitFor wait for this output string of command, before launching innerCmd
 * @param innerCmd inner command to launch, once cmd had reached the "waitFor" output string
 * @param verbose true to dump cmd's output. false to hide extenral cmd output
 *              note that innerCmd's output is always dumped to output
 */
async function runWithCmd({ cmd, args, waitFor, innerCmd, verbose }) {

    let testrpc
    try {
        testrpc = await waitForCmdToStart({cmd, args, waitFor, verbose})
        execSync(innerCmd, { stdio: 'inherit' })
    } finally {
        if(testrpc) testrpc.kill()
    }
}

module.exports = { waitForCmdToStart, runWithCmd }
