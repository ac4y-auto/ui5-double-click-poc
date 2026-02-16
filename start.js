#!/usr/bin/env node

/**
 * Smart Start — Port-aware fiori run launcher
 *
 * Checks if port is free, then starts fiori run.
 * Does NOT kill existing processes — use `npm run purge` for that.
 *
 * Usage:
 *   node start.js                    # Default (ui5.yaml)
 *   node start.js ui5-cdn.yaml       # CDN mode
 *   node start.js ui5-backend.yaml   # Backend proxy mode
 *   node start.js ui5-hybrid.yaml    # Hybrid mode (local UI5 + backend)
 */

const { execSync, spawn } = require('child_process');

// Configuration
const rawPort = process.env.PORT || '8200';
const DEFAULT_PORT = parseInt(rawPort, 10);

if (isNaN(DEFAULT_PORT) || DEFAULT_PORT < 1 || DEFAULT_PORT > 65535) {
    console.error(`❌ Invalid PORT: ${rawPort}`);
    console.error('   PORT must be a number between 1 and 65535');
    process.exit(1);
}

const PROJECT_MARKER = 'ui5-double-click-poc';
const configFile = process.argv[2];

console.log(`🚀 Smart Start`);
console.log(`   Port: ${DEFAULT_PORT}`);
if (configFile) {
    console.log(`   Config: ${configFile}`);
}
console.log('');

/**
 * Check if port is in use
 */
function getPortPID(port) {
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `netstat -ano | findstr :${port}`;
        } else {
            cmd = `lsof -ti:${port} -sTCP:LISTEN`;
        }

        const output = execSync(cmd, { encoding: 'utf8' });

        if (process.platform === 'win32') {
            const lines = output.trim().split('\n');
            for (const line of lines) {
                const match = line.match(/LISTENING\s+(\d+)/);
                if (match) return match[1];
            }
            return null;
        } else {
            return output.trim().split('\n')[0];
        }
    } catch (error) {
        return null;
    }
}

// --- Main ---

// 1. Check port
const pid = getPortPID(DEFAULT_PORT);

if (pid) {
    console.error(`❌ Port ${DEFAULT_PORT} is already in use (PID: ${pid})`);
    console.error(`   Run first:  npm run purge`);
    console.error(`   Or use:     PORT=9000 npm run smart-start`);
    process.exit(1);
}

console.log(`✓  Port ${DEFAULT_PORT} is available`);

// 2. Start fiori run
console.log(`🚀 Starting fiori run...\n`);

const args = ['fiori', 'run', '--port', DEFAULT_PORT.toString(), '--open', 'index.html'];
if (configFile) {
    args.push('--config', configFile);
}

const server = spawn('npx', args, {
    stdio: 'inherit',
    env: {
        ...process.env,
        UI5_DBLCLICK_PROJECT: PROJECT_MARKER,
        PORT: DEFAULT_PORT.toString()
    }
});

server.on('error', (error) => {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
});

server.on('exit', (code) => {
    if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        process.exit(code);
    }
});

process.on('SIGINT', () => {
    console.log(`\n\n👋 Stopping server...`);
    server.kill('SIGINT');
    process.exit(0);
});
