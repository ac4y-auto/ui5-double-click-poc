#!/usr/bin/env node

/**
 * Purge — Kill existing fiori run process on the configured port
 *
 * Safely kills only processes that belong to this project.
 * Refuses to kill unrelated processes.
 *
 * Usage:
 *   node purge.js          # Kill process on default port (8200)
 *   PORT=9000 node purge.js # Kill process on custom port
 *   npm run purge           # Via npm script
 */

const { execSync } = require('child_process');

// Configuration
const rawPort = process.env.PORT || '8200';
const PORT = parseInt(rawPort, 10);

if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    console.error(`❌ Invalid PORT: ${rawPort}`);
    process.exit(1);
}

const PROJECT_MARKER = 'ui5-double-click-poc';

console.log(`🧹 Purge`);
console.log(`   Port: ${PORT}`);
console.log(`   Project: ${PROJECT_MARKER}`);
console.log('');

/**
 * Get PID of process listening on port
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

/**
 * Check if process belongs to this project
 */
function isProjectProcess(pid) {
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `wmic process where "ProcessId=${pid}" get CommandLine /format:list`;
        } else {
            cmd = `ps -p ${pid} -o command=`;
        }

        const cmdLine = execSync(cmd, { encoding: 'utf8' });

        return cmdLine.includes(PROJECT_MARKER) ||
               cmdLine.includes('fiori') ||
               cmdLine.includes('ui5 serve');
    } catch (error) {
        return false;
    }
}

/**
 * Kill process by PID
 */
function killProcess(pid) {
    try {
        if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        }
        return true;
    } catch (error) {
        return false;
    }
}

// --- Main ---

const pid = getPortPID(PORT);

if (!pid) {
    console.log(`✓  Port ${PORT} is free — nothing to purge`);
    process.exit(0);
}

console.log(`⚠️  Port ${PORT} is in use (PID: ${pid})`);

if (!isProjectProcess(pid)) {
    console.error(`❌ Process does NOT belong to ${PROJECT_MARKER}`);
    console.error(`   Refusing to kill. Stop it manually or use a different port:`);
    console.error(`   PORT=9000 npm run smart-start`);
    process.exit(1);
}

console.log(`✓  Process belongs to ${PROJECT_MARKER}`);
console.log(`🔄 Killing PID ${pid}...`);

if (!killProcess(pid)) {
    console.error(`❌ Failed to kill process`);
    process.exit(1);
}

// Wait for port release
const start = Date.now();
while (Date.now() - start < 3000) {
    if (!getPortPID(PORT)) break;
}

if (getPortPID(PORT)) {
    console.error(`❌ Port ${PORT} still in use after 3s`);
    process.exit(1);
}

console.log(`✅ Purged — port ${PORT} is free`);
