#!/usr/bin/env node

const frida = require("frida");
const fs = require("fs");
const { promisify } = require("util");
const exec = require("child_process").execSync;

const PROC_PARENT = "Firefox Nightly";
const PROC_CP = PROC_PARENT+"CP";

const SYMS = {};
["ContainsRestrictedContent", "MozCaptureStream", "MozCaptureStreamUntilEnded"]
    .forEach((x) => {
        // YOLO
        SYMS[x] = "0x"+parseInt(exec(`./sym.sh ${x}`), 16).toString(16);
    });
console.log(SYMS);

//const BASE = "0x"+parseInt(process.argv[2], 16).toString(16);
const AGENT = fs.readFileSync("agent.js").toString().replace(/@SYMS@/g, JSON.stringify(SYMS));

let device = null;
let done = 0;
let liabilities = [];

async function main() {
    console.log("[-] waiting for device..");
    device = await frida.getLocalDevice();
    console.log("[-] got device");
    
    let children = await getExtantChildren();
    console.log(`[*] ${children.length} candidates`);
    
    for(const c of children) {
        console.log(`[*] hooking ${c}`);
        try {
            let s = await device.attach(c);
            await patch(s);
            liabilities.push(s);
        } catch(e) { console.log(`[-] failed: ${e}`); }
        console.log(liabilities.length);
    }

    let s = await device.attach(PROC_PARENT);
    await patch(s);
    liabilities.push(s);

    while(done < liabilities.length)
        sleep(1000);
    console.log("[*] done!");
    for(let s of liabilities) {
        s.detach();
    }
    //    await showPendingChildren();
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function getExtantChildren() {
    return (await device.enumerateProcesses())
        .filter(x => x.name.includes(PROC_CP))
        .map(x => x.pid);
}

async function patch(s) {
    let a = await s.createScript(AGENT);
    a.message.connect(x => {
        switch(x.payload) {
            case "ok":
                console.log("[-] finished proc")
                done++;
                break;
        }});
    return a.load();
}

main().catch(console.error);

async function showPendingChildren() {
    const pending = await device.enumeratePendingChildren();
    console.log('[*] enumeratePendingChildren():', pending);
}
