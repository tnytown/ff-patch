let chunks = [];
let stream = document.getElementsByTagName("video")[0].mozCaptureStream();
const mr = new MediaRecorder(stream, {
    videoBitsPerSecond: 6000000,
});
mr.ondataavailable = e => chunks.push(e.data);
mr.onstop = e => {
    console.log(mr.videoBitsPerSecond);
    saveFile(new Blob(chunks), "video.webm");
};
let start = mr.start;
let stop = mr.stop;
let resume = mr.resume;
function saveFile(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
        const a = document.createElement('a');
        document.body.appendChild(a);
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
	    }, 0)
    }
}
