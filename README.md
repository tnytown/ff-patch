# ff-patch

Patch Firefox (XUL) in-memory with Frida to remove restrictions on `HTMLElement`'s captureStream.

Written for macOS 10.14 / Firefox 76 as an educational experiment, now non-functional and 
For Your Reference Only.

Want to fix this?
[Figure out how to change sandbox rules at runtime](https://github.com/mozilla/gecko-dev/blob/170547001c81e7ec05f2855d8349b6b7e97c2658/security/sandbox/mac/SandboxPolicyContent.h#L40)
or something, idk. Maybe breakpoint Firefox at some specific state before content processes launch,
then append to the sandbox profile string? Here's some interesting logs:

``` text
error	04:54:59.972604-0500	kernel	Sandbox: plugin-container(4964) deny(1) mach-lookup re.frida.piped.4989
default	04:55:03.800789-0500	kernel	Sandbox: 10 duplicate reports for plugin-container deny(1) mach-lookup re.frida.piped.4989
```

Interestingly enough, the main process is privileged enough for the Frida agent to do its IPC
without being explicitly sandbox allowlisted. Unfortunately, the interesting codepath that we target
does not run in the main process.

On recent macOS builds, it's also necessary to reconfigure SIP to allow debugging, as Firefox is
notarized and thus doesn't have the entitlement `com.apple.security.get-task-allow`.

``` sh
csrutil enable --without debug
```

You didn't want to turn SIP all the way off, did you? :P

Once you do that, there's a handy [demo](./demo.js) that you can paste into devtools. By the way,
MediaStream captures on Firefox are very low-res and basically useless.

Happy debugging!
