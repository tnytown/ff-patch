var XUL = Module.getBaseAddress("XUL");
var t = JSON.parse('@SYMS@');

// rebase addrs
Object.keys(t).forEach(function(x) {
    t[x] = XUL.add(t[x]);
});

console.log(JSON.stringify(t));

//dump("pre", ptr(t.ContainsRestrictedContent).readByteArray(64));
Memory.patchCode(t.ContainsRestrictedContent, 16, function(x) {
    var w = new X86Writer(x, { pc: t.ContainsRestrictedContent });
    w.putMovRegU32('eax', 0);
    w.putRet();
    w.flush();
});

//dump("post", ptr(t.ContainsRestrictedContent).readByteArray(64));

[t.MozCaptureStream, t.MozCaptureStreamUntilEnded].forEach(patchInlineKeyChk);

function patchInlineKeyChk(x) {
    dump(ptr(x), x.readByteArray(128));
    // cmp mem register offset, probably (?) ContainsRestrictedContent member
    Memory.scan(ptr(x), 128, "48 83 b? ?? ?? 00 00 00", {
        onMatch: function(p, sz) {
            dump("<", p.readByteArray(8));
            Memory.patchCode(p, sz, (x) => {
                var w = new X86Writer(x, { pc: p });
                w.putCmpRegReg("eax", "eax"); // 2b
                w.putNopPadding(6);
                w.flush();
            });
            dump(">", p.readByteArray(8));
            return "stop"; // only patch 1
        },
        onComplete: function() {
        }
    });
}

send("ok");

function padStart(str, len, char) {
    if (str.length >= len) {
        return str;
    }

    return padStart((char + str), len, char);
}

function dump(a, x) {
    var o = "";
    var v = new DataView(x);
    for(var i = 0; i < v.byteLength; i++) {
        o += padStart(v.getUint8(i).toString(16), 2, "0");
    }
    console.log(a, o);
}
