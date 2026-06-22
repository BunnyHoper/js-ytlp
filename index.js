const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Command Line Interface Configuration (Cambiado a let para permitir reinicios limpios)
let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Control de flujo para la interrupción (Ctrl+C)
let currentResolver = null;
let insideSubMenu = false;
let activeChild = null;

const question = (query) => new Promise(resolve => {
    currentResolver = resolve;
    rl.question(query, (answer) => {
        currentResolver = null;
        resolve(answer);
    });
});

// Global Variables
const EXE_NAME = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const EXE_PATH = path.join(__dirname, EXE_NAME);

// ---------------------------------------------------------
// OUTPUT DIRECTORY SETUP
// ---------------------------------------------------------
let downloadPath = path.join(__dirname, 'output');

if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath, { recursive: true });
}
// ---------------------------------------------------------

// ANSI Color Palette
const C = {
    darkRed: '\x1b[38;5;88m',
    red: '\x1b[31m',
    brightRed: '\x1b[91m',
    gray: '\x1b[90m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    reset: '\x1b[0m'
};

// Base engine verification
function checkDependencies() {
    if (!fs.existsSync(EXE_PATH)) {
        console.log(`\n${C.brightRed}${C.bold}[ ᴄʀɪᴛɪᴄᴀʟ ᴇʀʀᴏʀ ]${C.reset} ${C.red}"${EXE_NAME}" ɴᴏᴛ ʟᴏᴄᴀᴛᴇᴅ ɪɴ ᴛʜᴇ ᴅɪʀᴇᴄᴛᴏʀʏ.${C.reset}`);
        console.log(`ᴘʟᴇᴀѕᴇ ᴍᴀᴋᴇ ѕᴜʀᴇ ᴛᴏ ᴘʟᴀᴄᴇ ᴛʜᴇ ʙɪɴᴀʀʏ ɪɴ:\n${C.gray}${__dirname}${C.reset}\n`);
        process.exit(1);
    }
}

// ---------------------------------------------------------
// LOADER ANIMATION LOGIC
// ---------------------------------------------------------
let spinnerInterval;

function startLoader(text) {
    const animations = ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'];
    let i = 0;
    process.stdout.write('\x1B[?25l'); // Hide terminal cursor
    spinnerInterval = setInterval(() => {
        process.stdout.write(`\r  ${C.brightRed}${animations[i]}${C.reset} ${C.bold}${text}${C.reset}`);
        i = (i + 1) % animations.length;
    }, 80);
}

function stopLoader() {
    clearInterval(spinnerInterval);
    process.stdout.write('\r\x1b[K');  // Clear the current line completely
    process.stdout.write('\x1B[?25h'); // Restore terminal cursor
}

// ---------------------------------------------------------
// YT-DLP EXECUTION WRAPPER
// ---------------------------------------------------------
function runYtDlp(args, loadingMessage = null) {
    return new Promise((resolve) => {
        if (loadingMessage) {
            startLoader(loadingMessage);
            
            const quietArgs = ['--quiet', '--no-warnings', ...args];
            const yt = spawn(EXE_PATH, quietArgs);
            activeChild = yt; 
            
            let errorMessage = '';
            yt.stderr.on('data', (data) => {
                errorMessage += data.toString();
            });

            yt.on('close', (code) => {
                stopLoader();
                activeChild = null;
                if (code === 0) {
                    console.log(`  ${C.brightRed}✔${C.reset} ${C.white}${loadingMessage.replace('...', ' ᴄᴏᴍᴘʟᴇᴛᴇᴅ!')}${C.reset}`);
                } else {
                    console.log(`  ${C.brightRed}× ᴛᴀѕᴋ ᴀʙᴏʀᴛᴇᴅ ᴏʀ ᴄᴀɴᴄᴇʟʟᴇᴅ.${C.reset}`);
                    if (errorMessage) console.log(`\n${C.gray}${errorMessage.trim()}${C.reset}\n`);
                }
                resolve(code);
            });
        } else {
            const yt = spawn(EXE_PATH, args, { stdio: 'inherit' });
            activeChild = yt; 
            yt.on('close', (code) => {
                activeChild = null;
                resolve(code);
            });
        }
    });
}

// Interceptor de Ctrl+C (SIGINT) optimizado
function handleSigInt() {
    const wasInsideSubMenu = insideSubMenu;
    insideSubMenu = false;

    if (activeChild) {
        activeChild.kill('SIGINT');
        activeChild = null;
        console.log(`\n\n  ${C.gray}↩ Descarga interrumpida. Volviendo al menú principal...${C.reset}`);
        return;
    }

    if (wasInsideSubMenu) {
        // Reinicio físico de readline para limpiar listeners corruptos del prompt anterior
        rl.close();
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('SIGINT', handleSigInt);

        if (currentResolver) {
            const resolve = currentResolver;
            currentResolver = null;
            resolve(''); 
        }
        console.log(`\n\n  ${C.gray}↩ Volviendo al menú principal...${C.reset}`);
    } else {
        rl.close();
        console.clear();
        console.log(`\n  ${C.brightRed}✔${C.reset} ${C.white}ᴄʟᴏѕɪɴɢ ʙᴜɴɴʏ ʏᴛ-ᴅʟᴘ ѕᴇᴄᴜʀᴇʟʏ. ɢᴏᴏᴅʙʏᴇ!${C.reset}\n`);
        process.exit(0);
    }
}

// Asignación inicial del evento
rl.on('SIGINT', handleSigInt);

// Professional UI Rendering
function drawMenu() {
    console.clear();
    console.log(`${C.brightRed}${C.bold}■ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ■${C.reset}`);
    console.log();
    console.log(`${C.darkRed}${C.bold}       ▓█████▄  █    ██  ███▄    █  ███▄    █ ▓██    ██▓${C.reset}`);
    console.log(`${C.darkRed}${C.bold}       ▒██▀ ██▌ ██  ▓██▒ ██ ▀█   █  ██ ▀█   █  ▒██  ██▒${C.reset}`);
    console.log(`${C.darkRed}${C.bold}       ░██   █▌▓██  ▒██░▓██  ▀█ ██▒▓██  ▀█ ██▒  ▒██ ██░${C.reset}`);
    console.log(`${C.darkRed}${C.bold}       ░▓█▄   ▌▓▓█  ░██░▓██▒  ▐▌██▒▓██▒  ▐▌██▒  ░ ▐██▓░${C.reset}`);
    console.log(`${C.darkRed}${C.bold}       ░▒████▓ ▒▒█████▓ ▒██░   ▓██░▒██░   ▓██░  ░ ██▒▓░${C.reset}`);
    console.log(`${C.darkRed}${C.bold}        ▒▒▓  ▒ ░▒▓▒ ▒ ▒ ░ ▒░   ▒ ▒ ░ ▒░   ▒ ▒    ██▒▒▒${C.reset}`);
    console.log(`${C.darkRed}${C.bold}        ░ ▒  ▒ ░░▒░ ░ ░ ░ ░░   ░ ▒░░ ░░   ░ ▒░ ▓██ ░▒░${C.reset}`);
    console.log(`${C.darkRed}${C.bold}        ░ ░  ░  ░░░ ░ ░    ░   ░ ░    ░   ░ ░  ▒ ▒ ░░${C.reset}`);
    console.log(`${C.darkRed}${C.bold}        ░       ░              ░          ░  ░ ░${C.reset}`);
    console.log(`${C.darkRed}${C.bold}        ░${C.reset}`);
    console.log();
    console.log(`${C.brightRed}${C.bold}■ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ■${C.reset}\n`);

    console.log(`  ${C.gray}► ᴛᴀʀɢᴇᴛ ᴘᴀᴛʜ:${C.reset} ${C.white}/output${C.reset}\n`);

    console.log(`${C.darkRed}          [ ѕᴍᴀʀᴛ ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴏᴅᴇ ]${C.reset}`);
    console.log(`    ${C.bold}1.${C.reset} ${C.brightRed}»${C.reset} ᴀᴜᴅɪᴏ ᴍᴏᴅᴇ            ${C.gray}(ᴍᴘ3 320ᴋ - ᴀᴜᴛᴏ-ᴅᴇᴛᴇᴄᴛ ѕɪɴɢʟᴇ/ᴘʟᴀʏʟɪѕᴛ)${C.reset}`);
    console.log(`    ${C.bold}2.${C.reset} ${C.red}»${C.reset} ᴠɪᴅᴇᴏ ᴍᴏᴅᴇ            ${C.gray}(ᴍᴘ4 ᴍᴀх ǫᴜᴀʟɪᴛʏ - ᴀᴜᴛᴏ-ᴅᴇᴛᴇᴄᴛ ѕɪɴɢʟᴇ/ᴘʟᴀʏʟɪѕᴛ)${C.reset}\n`);

    console.log(`${C.darkRed}           [ ᴀᴅᴠᴀɴᴄᴇᴅ ᴄᴏɴᴛʀᴏʟѕ ]${C.reset}`);
    console.log(`    ${C.bold}4.${C.reset} ${C.brightRed}♦${C.reset} ᴍᴀɴᴜᴀʟ ᴇхᴛʀᴀᴄᴛɪᴏɴ     ${C.gray}(ʟɪѕᴛ ᴀɴᴅ ᴄʜᴏᴏᴢᴇ ᴛʏᴘᴇ ᴍᴀɴᴜᴀʟʟʏ)${C.reset}`);
    console.log(`    ${C.bold}8.${C.reset} ${C.brightRed}⌂${C.reset} ᴄʜᴀɴɢᴇ ᴅᴇѕᴛɪɴᴀᴛɪᴏɴ    ${C.gray}(ᴇᴅɪᴛ ᴡᴏʀᴋɪɴɢ ᴅɪʀᴇᴄᴛᴏʀʏ)${C.reset}`);
    console.log(`    ${C.bold}9.${C.reset} ${C.brightRed}^${C.reset} ᴜᴘᴅᴀᴛᴇ ᴇɴɢɪɴᴇ         ${C.gray}(ɢᴇᴛ ʏᴛ-ᴅʟᴘ ᴜᴘᴅᴀᴛᴇѕ)${C.reset}`);
    console.log(`    ${C.bold}0.${C.reset} ${C.brightRed}×${C.reset} ᴇхɪᴛ                  \n`);
}

// Main application loop
async function appLoop() {
    checkDependencies();

    const titles = {
        '1': 'ѕᴍᴀʀᴛ ᴀᴜᴅɪᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴏᴅᴇ (ᴍᴘ3)',
        '2': 'ѕᴍᴀʀᴛ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴍᴏᴅᴇ (ᴍᴘ4)',
        '4': 'ᴍᴀɴᴜᴀʟ ᴇхᴛʀᴀᴄᴛɪᴏɴ ᴍᴏᴅᴇ'
    };

    while (true) {
        drawMenu();
        const option = await question(`  ${C.brightRed}>${C.reset} ${C.bold}ѕᴇʟᴇᴄᴛ ᴀɴ ᴏᴘᴛɪᴏɴ:${C.reset} `);

        if (option === '0') break;

        if (['1', '2', '4'].includes(option)) {
            console.clear();
            console.log(`\n${C.brightRed}${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
            console.log(`${C.red}${C.bold}   [ ${titles[option]} ]${C.reset}`);
            console.log(`${C.brightRed}${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);

            insideSubMenu = true;

            while (insideSubMenu) {
                const url = await question(`  ${C.brightRed}>${C.reset} ${C.bold}ᴘᴀѕᴛᴇ ᴜʀʟ:${C.reset} `);
                if (!url.trim() || !insideSubMenu) break;

                let args = [];
                let loaderMsg = "";
                
                console.log();

                const smartOutput = '%(playlist_title?%s/|)s%(playlist_index?%s - |)s%(channel)s - %(title)s.%(ext)s';
                
                switch (option) {
                    case '1':
                        loaderMsg = "ᴘʀᴏᴄᴇѕѕɪɴɢ ᴀᴜᴅɪᴏ (ᴍᴘ3 320ᴋ)...";
                        args = ['--yes-playlist', '-f', 'ba', '-x', '--audio-format', 'mp3', '--audio-quality', '320K', '-P', downloadPath, '-o', smartOutput, '--embed-metadata', '--embed-thumbnail', url];
                        await runYtDlp(args, loaderMsg);
                        break;
                    case '2':
                        loaderMsg = "ᴘʀᴏᴄᴇѕѕɪɴɢ ᴠɪᴅᴇᴏ (ᴍᴘ4 ᴍᴀх ǫᴜᴀʟɪᴛʏ)...";
                        args = ['--yes-playlist', '-f', 'bv*+ba/b', '--merge-output-format', 'mp4', '-P', downloadPath, '-o', smartOutput, '--embed-metadata', '--embed-thumbnail', url];
                        await runYtDlp(args, loaderMsg);
                        break;
                    case '4':
                        await runYtDlp(['-F', url]);
                        const typeId = await question(`\n  ${C.brightRed}>${C.reset} ${C.bold}ᴇɴᴛᴇʀ ᴛʜᴇ ɪᴅ (ᴇ.ɢ. 22, ᴏʀ 137+140):${C.reset} `);
                        if (!typeId.trim() || !insideSubMenu) {
                            console.log(`  ${C.gray}⚠ ᴄᴀɴᴄᴇʟʟᴇᴅ.${C.reset}`);
                        } else {
                            loaderMsg = `ѕᴛᴀʀᴛɪɴɢ ᴄᴜѕᴛᴏᴍ ᴅᴏᴡɴʟᴏᴀᴅ [${typeId}]...`;
                            args = ['-f', typeId, '-P', downloadPath, '-o', '%(channel)s - %(title)s.%(ext)s', '--embed-metadata', url];
                            console.log();
                            await runYtDlp(args, loaderMsg);
                        }
                        break;
                }
                
                if (insideSubMenu) {
                    console.log(`\n${C.gray}  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);
                }
            }
            
            insideSubMenu = false;
            
        } else if (option === '8') {
            const newPath = await question(`\n  ${C.brightRed}>${C.reset} ${C.bold}ᴇɴᴛᴇʀ ᴛʜᴇ ɴᴇᴡ ᴀʙѕᴏʟᴜᴛᴇ ᴘᴀᴛʜ:${C.reset} `);
            if (newPath.trim()) {
                downloadPath = newPath.trim();
                console.log(`\n  ${C.brightRed}✔${C.reset} ${C.white}ᴏᴜᴛᴘᴜᴛ ᴅɪʀᴇᴄᴛᴏʀʏ ᴜᴘᴅᴀᴛᴇᴅ.${C.reset}`);
            }
            await question(`\n  ${C.gray}ᴘʀᴇѕѕ ᴇɴᴛᴇʀ ᴛᴏ ʀᴇᴛᴜʀɴ ᴛᴏ ᴛʜᴇ ᴍᴇɴᴜ...${C.reset}`);
            
        } else if (option === '9') {
            console.log(`\n${C.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);
            await runYtDlp(['-U'], "ᴄʜᴇᴄᴋɪɴɢ ᴜᴘᴅᴀᴛᴇѕ...");
            console.log(`\n${C.brightRed}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
            await question(`\n  ${C.gray}ᴘʀᴇѕѕ ᴇɴᴛᴇʀ ᴛᴏ ʀᴇᴛᴜʀɴ ᴛᴏ ᴛʜᴇ ᴍᴇɴᴜ...${C.reset}`);
        }
    }

    rl.close();
    console.clear();
    console.log(`\n  ${C.brightRed}✔${C.reset} ${C.white}ᴄʟᴏѕɪɴɢ ʙᴜɴɴʏ ʏᴛ-ᴅʟᴘ ѕᴇᴄᴜʀᴇʟʏ. ɢᴏᴏᴅʙʏᴇ!${C.reset}\n`);
    process.exit(0);
}

// Initialize
appLoop();