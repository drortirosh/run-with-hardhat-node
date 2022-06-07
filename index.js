const { spawn, execSync } = require('child_process');

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
    return new Promise((resolve, reject) => {
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
            if (verbose) { process.stdout.write(data) }
            if(data.includes(waitFor)) {
                resolve()
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
    }).then(() => {
        execSync(innerCmd, { stdio: 'inherit' })
    }).finally(()=>{
        if(testrpc) testrpc.kill()
    })
}

module.exports = { runWithCmd }
