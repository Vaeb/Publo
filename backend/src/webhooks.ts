import cp from 'child_process';
import path from 'path';
// import fs from 'fs';
import express from 'express';
import treeKill from 'tree-kill';

// if (!fs.existsSync('./scripts')) {
//     console.error('Cannot find directory ./scripts, not running with correct working directory?');
//     process.exit(1);
// }

const cwd = path.resolve('.');

const app = express();

app.use(express.json());

/** @type {cp.ChildProcess[]} */
let processes: cp.ChildProcess[] = [];

/**
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {cp.SpawnOptions} [options]
 * @returns {cp.ChildProcess}

 */
function spawn(cmd: string, args: string[], options: cp.SpawnOptionsWithoutStdio = {}) {
    const proc = cp.spawn(cmd, args, { cwd, stdio: 'inherit', ...options });
    processes.push(proc);
    const rem = () => {
        processes = processes.filter(p => p !== proc);
        return processes;
    };
    proc.on('close', rem);
    proc.on('exit', rem);
    return proc;
}

/**
 * @param {string} cmd
 * @param {string[]} [args]
 * @param {cp.SpawnOptions} [options]
 * @returns {Promise<cp.ChildProcess>}

 */
function spawnSync(cmd: string, args: string[], options: cp.SpawnOptionsWithoutStdio = {}) {
    const proc = spawn(cmd, args, options);
    return new Promise((resolve: (_: void) => void, reject) => {
        proc.on('exit', (code) => {
            if (code === 0) {
                resolve();
                return;
            }
            setImmediate(() => reject());
        });
        proc.on('error', reject);
    });
}

async function kill() {
    console.log(`-> Killing ${processes.length} spawned processes...`);
    processes.forEach(p => treeKill(p.pid, 'SIGTERM'));
    if (processes.length) await new Promise(r => setTimeout(r, 2e3));
    if (processes.length) {
        console.log(`-> Killing ${processes.length} spawned processes forcefully...`);
        processes.forEach(p => treeKill(p.pid, 'SIGKILL'));
    }
    processes = [];
}

async function update() {
    console.log('-> Performing git stash...');
    await spawnSync('git', ['stash']); // ['fetch']);
    console.log('-> Performing git pull...');
    await spawnSync('git', ['pull']); // ['checkout', '-f', 'origin/master']
    // console.log('-> Installing dependencies...');
    // await spawnSync('node', ['./scripts/install.js']);
    console.log('-> Starting project scripts...');
    await spawnSync('node', ['./scripts/dist/start.ts']);
}

async function start() {
    console.log('-> Starting server');
    // spawn('yarn', ['start'], {
    //     cwd: path.resolve(cwd, 'server'),
    // });
}

interface Payload {
    ref: string;
    deleted: boolean;
    after: string;
}

/**
 * @typedef {{
 *      ref: string;
 *      deleted: boolean;
 *      after: string;
 * }} Payload
 * @param {Payload} payload
 */
async function acceptPayload(payload: Payload) {
    const { ref, deleted, after } = payload;
    console.log('Detected a push:', ref);
    if (ref !== 'refs/heads/master') return;
    if (deleted) {
        console.log('-> Deleted, ignoring');
        return;
    }
    console.log('-> Starting update process');
    await kill();
    await update();
    await start();
}

app.get('/', (req, res) => {
    const lines = ['Running processes:'];
    for (const proc of processes) {
        lines.push(`- (PID ${proc.pid}) ${proc.spawnfile} [${proc.spawnargs.map(v => JSON.stringify(v))}]`);
    }
    res.status(200).send(lines.join('\n'));
});

app.post('/github', (req, res) => {
    acceptPayload(req.body).catch(console.error);
    res.status(200).json({ message: 'OK' });
});

app.get('/update', (req, res) => {
    kill().then(update).then(start).then(() => {
        res.status(200).send('OK');
    }, (err) => {
        res.status(500).send(`${err.message}\n${err.stack}`);
    });
});

app.get('/restart', (req, res) => {
    kill().then(start).then(() => {
        res.status(200).send('OK');
    }, (err) => {
        res.status(500).send(`${err.message}\n${err.stack}`);
    });
});

app.listen(process.env.PORT || 81);
console.log('Running on', process.env.PORT || 81);
