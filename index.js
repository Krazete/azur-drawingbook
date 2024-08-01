var image, gcBound, grid, line;
var loader, handle, dial;
var preview;

var id;
var imgrect;
var rayX, rayY;
var imgdata;

/* helpers */

function bound(n, min, max) {
    return Math.min(Math.max(n, min), max);
}

function getPointer(e) {
    e.preventDefault();
    if (e.touches) {
        return {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }
    return {
        x: e.clientX,
        y: e.clientY
    };
}

/* updaters */

function updatePreview() {
    if (!imgdata) {
        return;
    }
    preview.width = dial.gc.cBound;
    preview.height = dial.gc.r;
    var context = preview.getContext("2d");
    var x0 = imgdata.width * Math.min(handle.ga.x, handle.gb.x);
    var y0 = imgdata.height * Math.min(handle.ga.y, handle.gb.y);
    var w0 = imgdata.width * Math.abs(handle.gb.x - handle.ga.x);
    var h0 = imgdata.height * Math.abs(handle.gb.y - handle.ga.y);

    var newdata = context.createImageData(dial.gc.cBound, dial.gc.r);
    for (var r = 0; r < dial.gc.r; r++) {
        for (var c = 0; c < dial.gc.cBound; c++) {
            var x = Math.round(x0 + w0 * (c + 0.5) / dial.gc.cBound);
            var y = Math.round(y0 + h0 * (r + 0.5) / dial.gc.r);
            var i = imgdata.width * y + x;
            var j = dial.gc.cBound * r + c;
            newdata.data[4 * j] = imgdata.data[4 * i];
            newdata.data[4 * j + 1] = imgdata.data[4 * i + 1];
            newdata.data[4 * j + 2] = imgdata.data[4 * i + 2];
            newdata.data[4 * j + 3] = imgdata.data[4 * i + 3];
        }
    }
    context.putImageData(newdata, 0, 0);
}

function updateGrid() {
    if (!imgrect) {
        return;
    }
    var l, r, t, b;
    var minPixels = 5 / devicePixelRatio;
    var oldCount = dial.gc.cBound * dial.gc.r;

    if (handle.ga.x < handle.gb.x) {
        l = handle.ga;
        r = handle.gb;
    }
    else {
        l = handle.gb;
        r = handle.ga;
    }
    if (handle.ga.y < handle.gb.y) {
        t = handle.ga;
        b = handle.gb;
    }
    else {
        t = handle.gb;
        b = handle.ga;
    }
    dial.gc.cBound = bound(Math.round((r.x - l.x) * imgrect.width / minPixels), 1, dial.gc.c);
    dial.gc.r = bound(Math.round(dial.gc.cBound * (b.y - t.y) * imgrect.height / ((r.x - l.x) * imgrect.width)), 1, 64);

    l.e.classList.remove("right");
    l.e.classList.add("left");
    r.e.classList.remove("left");
    r.e.classList.add("right");
    t.e.classList.remove("bottom");
    t.e.classList.add("top");
    b.e.classList.remove("top");
    b.e.classList.add("bottom");

    grid.style.left = 100 * l.x + "%";
    grid.style.top = 100 * t.y + "%";
    grid.style.width = 100 * (r.x - l.x) + "%";
    grid.style.height = 100 * (b.y - t.y) + "%";
    grid.style.gridTemplateColumns = "repeat(" + dial.gc.cBound + ", 1fr)";
    if (oldCount != dial.gc.cBound * dial.gc.r) {
        grid.innerHTML = "<div></div>".repeat(dial.gc.cBound * dial.gc.r);
    }

    dial.gc.e.style.left = 100 * ((l.x + r.x) / 2) + "%";
    dial.gc.e.style.top = 100 * (t.y - 0.05) + "%";

    if (dial.gc.cBound == dial.gc.c) {
        dial.gc.e.classList.remove("not-wide-enough");
        gcBound.classList.add("hidden");
    }
    else {
        dial.gc.e.classList.add("not-wide-enough");
        gcBound.classList.remove("hidden");
        gcBound.style.left = dial.gc.e.style.left;
        gcBound.style.top = dial.gc.e.style.top;
        gcBound.dataset.truecount = dial.gc.cBound;
    }

    updatePreview();
}

function updateLine(force) {
    if (!imgrect) {
        return;
    }
    var oldRayX = rayX;
    var oldRayY = rayY;

    rayX = handle.la.x < handle.lb.x;
    rayY = handle.la.y < handle.lb.y;
    
    line.style.left = 100 * Math.min(handle.la.x, handle.lb.x) + "%";
    line.style.top = 100 * Math.min(handle.la.y, handle.lb.y) + "%";
    line.style.width = 100 * Math.abs(handle.lb.x - handle.la.x) + "%";
    line.style.height = 100 * Math.abs(handle.lb.y - handle.la.y) + "%";

    if (force || oldRayX != rayX || oldRayY != rayY) {
        var nM1 = dial.lc.c - 1;
        line.innerHTML = "";
        for (var i = 0; i < dial.lc.c; i++) {
            var letter = document.createElement("div");
            letter.style.left = 100 * (rayX ? i : (nM1 - i)) / nM1 + "%";
            letter.style.top = 100 * (rayY ? i : (nM1 - i)) / nM1 + "%";
            line.appendChild(letter);
        }
    }

    var m = ((handle.lb.y - handle.la.y) * imgrect.height) / ((handle.lb.x - handle.la.x) * imgrect.width);
    var lx = (handle.lb.x - handle.la.x) * imgrect.width;
    var ly = (handle.lb.y - handle.la.y) * imgrect.height;
    var l = Math.sqrt(Math.pow(lx, 2) + Math.pow(ly, 2));
    dial.lc.e.style.left = 100 * ((handle.la.x + handle.lb.x) / 2 - (Math.abs(m) < 1 ? ly : -ly) * 0.05 / l) + "%";
    dial.lc.e.style.top = 100 * ((handle.la.y + handle.lb.y) / 2 + (Math.abs(m) < 1 ? lx : -lx) * 0.05 / l) + "%";

    updatePreview();
}

function updateDial() {
    dial[this.id].c = bound(Math.round(this.value), this.min, this.max);
    this.value = dial[this.id].c;
    dial[this.id].f(true);
}

/* move listeners */

function grabEnd(e) {
    document.documentElement.classList.remove("moving");
    window.removeEventListener("mousemove", grabMove);
    window.removeEventListener("touchmove", grabMove);
    window.removeEventListener("mouseup", grabEnd);
    window.removeEventListener("touchend", grabEnd);
}

function grabMove(e) {
    var mouse = getPointer(e);

    handle[id].x = bound((mouse.x - imgrect.x) / imgrect.width, 0, 1);
    handle[id].y = bound((mouse.y - imgrect.y) / imgrect.height, 0, 1);

    handle[id].e.style.left = 100 * handle[id].x + "%";
    handle[id].e.style.top = 100 * handle[id].y + "%";

    handle[id].f();
}

function grabStart(e) {
    id = this.id;
    imgrect = image.getBoundingClientRect();
    grabMove(e);
    if (e.isTrusted) {
        document.documentElement.classList.add("moving");
        window.addEventListener("mousemove", grabMove);
        window.addEventListener("touchmove", grabMove, {"passive": false});
        window.addEventListener("mouseup", grabEnd);
        window.addEventListener("touchend", grabEnd);
    }
}

/* image loading */

function updateImgRect() {
    imgrect = image.getBoundingClientRect();
    updateGrid();
    updatePreview();
}

function invalid() {
    this.classList.add("invalid");
    console.log(this);
}

function valid() {
    // this.classList.remove("invalid");
    var canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    var context = canvas.getContext("2d");
    context.crossOrigin = "anonymous";
    context.drawImage(this, 0, 0);
    try {
        imgdata = context.getImageData(0, 0, this.width, this.height);
        image.src = this.src;
    }
    catch (e) {
        console.log(e);
    }
}

function loadURL() {
    var checker = new Image();
    checker.crossOrigin = "Anonymous";
    checker.addEventListener("load", valid);
    checker.addEventListener("error", invalid);
    checker.src = this.value || this.result;
}

function loadFile() {
    var file = this.files[0];
    if (file && file.type && file.type.startsWith("image/")) {
        var reader = new FileReader();
        reader.addEventListener("load", loadURL);
        reader.addEventListener("error", invalid);
        reader.readAsDataURL(file);
    }
    else {
        invalid();
    }
}

function onResize(e) {
    // img.width = innerWidth;
    
}

/* initialization */

function initSample() {
    function pD() {}

    handle.ga.x = 0.282;
    handle.ga.y = 0.171;
    handle.gb.x = 0.758;
    handle.gb.y = 0.786;
    handle.la.x = 0.9;
    handle.la.y = 0.11;
    handle.lb.x = 0.9;
    handle.lb.y = 0.9;

    handle.ga.e.style.left = 100 * handle.ga.x + "%";
    handle.ga.e.style.top = 100 * handle.ga.y + "%";
    handle.gb.e.style.left = 100 * handle.gb.x + "%";
    handle.gb.e.style.top = 100 * handle.gb.y + "%";
    handle.la.e.style.left = 100 * handle.la.x + "%";
    handle.la.e.style.top = 100 * handle.la.y + "%";
    handle.lb.e.style.left = 100 * handle.lb.x + "%";
    handle.lb.e.style.top = 100 * handle.lb.y + "%";

    dial.gc.e.dispatchEvent(new InputEvent("change"));
    dial.lc.e.dispatchEvent(new InputEvent("change"));

    loader.url.e.value = "sample.jpg";
    loader.url.e.dispatchEvent(new InputEvent("change"));
}

function init() {
    image = document.getElementById("image");
    gcBound = document.getElementById("gc-bound");
    grid = document.getElementById("grid");
    line = document.getElementById("line");
    handle = {
        ga: {e: document.getElementById("ga"), f: updateGrid},
        gb: {e: document.getElementById("gb"), f: updateGrid},
        la: {e: document.getElementById("la"), f: updateLine},
        lb: {e: document.getElementById("lb"), f: updateLine},
    };
    dial = {
        gc: {e: document.getElementById("gc"), f: updateGrid},
        lc: {e: document.getElementById("lc"), f: updateLine}
    };
    loader = {
        file: {e: document.getElementById("load-file"), f: loadFile},
        url: {e: document.getElementById("load-url"), f: loadURL}
    };
    preview = document.getElementById("preview");

    image.addEventListener("load", updateImgRect);
    for (var id in handle) {
        handle[id].e.addEventListener("mousedown", grabStart);
        handle[id].e.addEventListener("touchstart", grabStart);
    }
    for (var id in dial) {
        dial[id].e.addEventListener("change", updateDial);
    }
    for (var id in loader) {
        loader[id].e.addEventListener("change", loader[id].f);
    }
    // window.addEventListener("resize", onResize);

    initSample();
}

window.addEventListener("DOMContentLoaded", init);


// var paints = {
//     " ": {r: 185, g: 174, b: 168},
//     a: {r: 255, g: 255, b: 255},
//     b: {r: 49, g: 36, b: 33},
//     c: {r: 255, g: 211, b: 115},
//     d: {r: 247, g: 105, b: 90},
//     e: {r: 115, g: 130, b: 255},
//     f: {r: 255, g: 215, b: 198},
//     g: {r: 90, g: 40, b: 66},
//     h: {r: 82, g: 56, b: 90},
//     i: {r: 82, g: 97, b: 165}
// };

// function getClosestPaint(r, g, b) {
//     var minpid;
//     var mindp = Infinity;
//     for (var pid in paints) {
//         var p = paints[pid];
//         var dp = Math.pow(r - p.r, 2) + Math.pow(g - p.g, 2) + Math.pow(b - p.b, 2);
//         if (dp < mindp) {
//             minpid = pid;
//             mindp = dp;
//         }
//     }
//     return minpid;
// }

// var img = $("img");
// // img.crossOrigin="anonymous";
// var canvas = document.createElement("canvas");
// canvas.width = img.width;
// canvas.height = img.height;
// var context = canvas.getContext("2d");
// context.drawImage(img, 0, 0, canvas.width, canvas.height);

// // var rect = img.getBoundingClientRect();
// // function getPercentPosition(e) {
// //     console.log({
// //         x: (e.x - rect.x) / (rect.width),
// //         y: (e.y - rect.y) / (rect.height)
// //     });
// // }
// // window.addEventListener("click", getPercentPosition);



// var corners = [
//     {x: 0.23469387755102042, y: 0.1717557251908397},
//     {x: 0.8147153598281418, y: 0.7824427480916031}
// ];

// var gap = {
//     x: canvas.width * (corners[1].x - corners[0].x) / 37,
//     y: canvas.height * (corners[1].y - corners[0].y) / 22
// };

// var data = context.getImageData(
//     Math.round(canvas.width * corners[0].x),
//     Math.round(canvas.height * corners[0].y),
//     Math.round(canvas.width * (corners[1].x - corners[0].x)),
//     Math.round(canvas.height * (corners[1].y - corners[0].y))
// );
// var txt = "";
// for (var y = gap.y / 2; y < data.height; y += gap.y) {
//     txt += "|";
//     for (var x = gap.x / 2; x < data.width; x += gap.x) {
//         var i = 4 * (data.width * Math.round(y) + Math.round(x));
//         txt += getClosestPaint(data.data[i], data.data[i + 1], data.data[i + 2]);
//     }
//     txt += "\n";
// }

// console.log(txt);
// copy(txt);
