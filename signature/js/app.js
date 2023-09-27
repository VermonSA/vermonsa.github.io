let wrapper = document.getElementById("signature-pad");
let clearButton = wrapper.querySelector("[data-action=clear]");
let downloadButton = wrapper.querySelector("[data-action=download]");
let canvas = wrapper.querySelector("canvas");
let signaturePad = new SignaturePad(canvas);

window.onresize = resizeCanvas;
resizeCanvas();

clearButton.addEventListener("click", function (event) {
    signaturePad.clear();
});

downloadButton.addEventListener("click", function (event) {
    if (signaturePad.isEmpty()) {
        alert("Please provide a signature first.");
    } else {
        let croppedCanvas = cropSignatureCanvas(canvas);

        download(croppedCanvas, "signature.png");
    }
});

function resizeCanvas() {
    let ratio =  Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);

    signaturePad.clear();
}

function download(canvas, filename) {
    canvas.toBlob((blob) => {
        let a = document.createElement("a");
        let url = URL.createObjectURL(blob);

        a.href = url;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

// From: https://github.com/szimek/signature_pad/issues/49#issuecomment-260976909
function cropSignatureCanvas(canvas) {
    // First duplicate the canvas to not alter the original
    let croppedCanvas= document.createElement('canvas');
    let croppedContext= croppedCanvas.getContext('2d');

    croppedCanvas.width = canvas.width;
    croppedCanvas.height = canvas.height;
    croppedContext.drawImage(canvas, 0, 0);

    // Next do the actual cropping
    let width= croppedCanvas.width;
    let height= croppedCanvas.height;
    let pixels= { x: [], y: [] };
    let imageData= croppedContext.getImageData(0, 0, croppedCanvas.width, croppedCanvas.height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let index = (y * width + x) * 4;

            if (imageData.data[index + 3] > 0) {
                pixels.x.push(x);
                pixels.y.push(y);
            }
        }
    }
    pixels.x.sort((a, b) => a - b);
    pixels.y.sort((a, b) => a - b);

    let key= pixels.x.length - 1;
    width = pixels.x[key] - pixels.x[0];
    height = pixels.y[key] - pixels.y[0];

    let cut= croppedContext.getImageData(pixels.x[0], pixels.y[0], width, height);

    croppedCanvas.width = width;
    croppedCanvas.height = height;
    croppedContext.putImageData(cut, 0, 0);

    return croppedCanvas;
}
