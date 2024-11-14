var shot, gcBound, grid, line; // editor elements
var handle = {}; // editor draggable elements
var dial = {}; // editor input elements
var data = { // editor position data and callbacks
    ga: {f: updateGrid, x: 0.282, y: 0.171},
    gb: {f: updateGrid, x: 0.758, y: 0.786},
    gc: {f: updateGrid, c: 37, cBound: 37},
    la: {f: updateLine, x: 0.9, y: 0.11},
    lb: {f: updateLine, x: 0.9, y: 0.9},
    lc: {f: updateLine, c: 9}
};
var fileLoader, errorLoader, urlLoader, preview, palette, result; // menu elements
var shotData, shotBox; // image data and bounding rect
var shotChanged = false;

var id;
var rayX, rayY;

var txt;
var colors = [];


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

/* menu updaters */

function updatePreview() {
    if (!shotData) {
        return;
    }
    preview.width = data.gc.cBound;
    preview.height = data.gc.r;
    var context = preview.getContext("2d");
    var x0 = shotData.width * Math.min(data.ga.x, data.gb.x);
    var y0 = shotData.height * Math.min(data.ga.y, data.gb.y);
    var w0 = shotData.width * Math.abs(data.gb.x - data.ga.x);
    var h0 = shotData.height * Math.abs(data.gb.y - data.ga.y);

    txt = "{{DrawingBook\n";
    for (var c in colors) {
        txt += "|" + String.fromCharCode(colors[c].c + 97) + "=rgb(" + [colors[c].r, colors[c].g, colors[c].b].join(", ") + ")\n";
    }
    var newdata = context.createImageData(data.gc.cBound, data.gc.r);
    for (var r = 0; r < data.gc.r; r++) {
        txt += "|";
        for (var c = 0; c < data.gc.cBound; c++) {
            var x = Math.round(x0 + w0 * (c + 0.5) / data.gc.cBound);
            var y = Math.round(y0 + h0 * (r + 0.5) / data.gc.r);
            var i = shotData.width * y + x;
            var j = data.gc.cBound * r + c;
            var thisColor = {
                r: shotData.data[4 * i],
                g: shotData.data[4 * i + 1],
                b: shotData.data[4 * i + 2],
                a: shotData.data[4 * i + 3]
            };
            if (colors.length) {
                var closestColor = getPaletteColor(thisColor);
            }
            else {
                var closestColor = thisColor;
            }
            newdata.data[4 * j] = closestColor.r;
            newdata.data[4 * j + 1] = closestColor.g;
            newdata.data[4 * j + 2] = closestColor.b;
            newdata.data[4 * j + 3] = closestColor.a;
            txt += String.fromCharCode(closestColor.c + 97);
            if (colors.includes(closestColor)) {
                palette.children[colors.indexOf(closestColor)].innerHTML = parseInt(palette.children[colors.indexOf(closestColor)].innerHTML || 0) + 1;
            }
        }
        txt += "\n";
    }
    txt += "}}\n";
    context.putImageData(newdata, 0, 0);
    result.value = txt;
}

function getPaletteColor(k) {
    var score = Infinity;
    var chosen;
    for (var c of colors) {
        var s = Math.pow(c.r - k.r, 2)
              + Math.pow(c.g - k.g, 2)
              + Math.pow(c.b - k.b, 2)
              + Math.pow(c.a - k.a, 2);
        if (s < score) {
            score = s;
            chosen = c;
        }
    }
    var tolerance = 32;
    if (score > 4 * Math.pow(tolerance, 2)) {
        chosen = {r: 0, g: 0, b: 0, a: 0, c: -65};
    }
    return chosen;
}

function updatePalette() {
    var x0 = shotData.width * data.la.x;
    var y0 = shotData.height * data.la.y;
    var w0 = shotData.width * (data.lb.x - data.la.x);
    var h0 = shotData.height * (data.lb.y - data.la.y);

    colors = [];
    for (var c = 0; c < data.lc.c; c++) {
        var x = Math.round(x0 + w0 * c / (data.lc.c - 1));
        var y = Math.round(y0 + h0 * c / (data.lc.c - 1));
        var i = shotData.width * y + x;
        colors[c] = {
            r: shotData.data[4 * i],
            g: shotData.data[4 * i + 1],
            b: shotData.data[4 * i + 2],
            a: shotData.data[4 * i + 3],
            c: c
        };
    }
    palette.innerHTML = colors.map(e => "<div style=\"background:rgba(" + [e.r, e.g, e.b, e.a].join(",") + ")\"></div>").join("");
    updatePreview();
}

/* editor updaters */

function updateGrid() {
    if (!shotBox) {
        return;
    }
    var l, r, t, b;
    var minPixels = 5 / devicePixelRatio;
    var oldCount = data.gc.cBound * data.gc.r;

    if (data.ga.x < data.gb.x) {
        l = "ga";
        r = "gb";
    }
    else {
        l = "gb";
        r = "ga";
    }
    if (data.ga.y < data.gb.y) {
        t = "ga";
        b = "gb";
    }
    else {
        t = "gb";
        b = "ga";
    }
    data.gc.cBound = bound(Math.round((data[r].x - data[l].x) * shotBox.width / minPixels), 1, data.gc.c);
    data.gc.r = bound(Math.round(data.gc.cBound * (data[b].y - data[t].y) * shotBox.height / ((data[r].x - data[l].x) * shotBox.width)), 1, 64);

    handle[l].classList.remove("right");
    handle[l].classList.add("left");
    handle[r].classList.remove("left");
    handle[r].classList.add("right");
    handle[t].classList.remove("bottom");
    handle[t].classList.add("top");
    handle[b].classList.remove("top");
    handle[b].classList.add("bottom");

    grid.style.left = 100 * data[l].x + "%";
    grid.style.top = 100 * data[t].y + "%";
    grid.style.width = 100 * (data[r].x - data[l].x) + "%";
    grid.style.height = 100 * (data[b].y - data[t].y) + "%";
    grid.style.gridTemplateColumns = "repeat(" + data.gc.cBound + ", 1fr)";
    if (oldCount != data.gc.cBound * data.gc.r) {
        grid.innerHTML = "<div></div>".repeat(data.gc.cBound * data.gc.r);
    }

    dial.gc.style.left = 100 * ((data[l].x + data[r].x) / 2) + "%";
    dial.gc.style.top = 100 * (data[t].y - 0.05) + "%";

    if (data.gc.cBound == data.gc.c) {
        dial.gc.classList.remove("not-wide-enough");
        gcBound.classList.add("hidden");
    }
    else {
        dial.gc.classList.add("not-wide-enough");
        gcBound.classList.remove("hidden");
        gcBound.style.left = dial.gc.style.left;
        gcBound.style.top = dial.gc.style.top;
        gcBound.dataset.truecount = data.gc.cBound;
    }

    updatePreview();
}

function updateLine(force) {
    if (!shotBox) {
        return;
    }
    var oldRayX = rayX;
    var oldRayY = rayY;

    rayX = data.la.x < data.lb.x;
    rayY = data.la.y < data.lb.y;
    
    line.style.left = 100 * Math.min(data.la.x, data.lb.x) + "%";
    line.style.top = 100 * Math.min(data.la.y, data.lb.y) + "%";
    line.style.width = 100 * Math.abs(data.lb.x - data.la.x) + "%";
    line.style.height = 100 * Math.abs(data.lb.y - data.la.y) + "%";

    if (force || oldRayX != rayX || oldRayY != rayY) {
        var nM1 = data.lc.c - 1;
        line.innerHTML = "";
        for (var i = 0; i < data.lc.c; i++) {
            var letter = document.createElement("div");
            letter.style.left = 100 * (rayX ? i : (nM1 - i)) / nM1 + "%";
            letter.style.top = 100 * (rayY ? i : (nM1 - i)) / nM1 + "%";
            line.appendChild(letter);
        }
    }

    var m = ((data.lb.y - data.la.y) * shotBox.height) / ((data.lb.x - data.la.x) * shotBox.width);
    var lx = (data.lb.x - data.la.x) * shotBox.width;
    var ly = (data.lb.y - data.la.y) * shotBox.height;
    var l = Math.sqrt(Math.pow(lx, 2) + Math.pow(ly, 2));
    dial.lc.style.left = 100 * ((data.la.x + data.lb.x) / 2 - (Math.abs(m) < 1 ? ly : -ly) * 0.05 / l) + "%";
    dial.lc.style.top = 100 * ((data.la.y + data.lb.y) / 2 + (Math.abs(m) < 1 ? lx : -lx) * 0.05 / l) + "%";

    updatePalette();
}

function updateDial() {
    data[this.id].c = bound(Math.round(this.value), this.min, this.max);
    this.value = data[this.id].c;
    data[this.id].f(true);
}

/* move listeners */

function grabEnd() {
    document.documentElement.classList.remove("moving");
    window.removeEventListener("mousemove", grabMove);
    window.removeEventListener("touchmove", grabMove);
    window.removeEventListener("mouseup", grabEnd);
    window.removeEventListener("touchend", grabEnd);
}

function grabMove(e) {
    var mouse = getPointer(e);
    data[id].x = bound((mouse.x - shotBox.x) / shotBox.width, 0, 1);
    data[id].y = bound((mouse.y - shotBox.y) / shotBox.height, 0, 1);
    handle[id].style.left = 100 * data[id].x + "%";
    handle[id].style.top = 100 * data[id].y + "%";
    data[id].f();
}

function grabStart(e) {
    id = this.id;
    shotBox = shot.getBoundingClientRect();
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

function updateShotBox() {
    shotBox = shot.getBoundingClientRect();
    updateGrid();
    updateLine();
    // updatePreview();
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
        shotData = context.getImageData(0, 0, this.width, this.height);
        shot.src = this.src;
            shotChanged = true;
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

/* initialization */

function initShot() {
    if (shot.complete && shot.naturalWidth > 0) {
        updateShot();
        // updateShotBox(); // redundant?
    }
    else {
        requestAnimationFrame(initShot);
    }
}

function init() {
    shot = document.getElementById("shot");
    handle.ga = document.getElementById("ga");
    handle.gb = document.getElementById("gb");
    dial.gc = document.getElementById("gc");
    gcBound = document.getElementById("gc-bound");
    grid = document.getElementById("grid");
    handle.la = document.getElementById("la");
    handle.lb = document.getElementById("lb");
    dial.lc = document.getElementById("lc");
    line = document.getElementById("line");
    fileLoader = document.getElementById("load-file");
    errorLoader = document.getElementById("load-error");
    urlLoader = document.getElementById("load-url");
    preview = document.getElementById("preview");
    palette = document.getElementById("palette");
    result = document.getElementById("result");

    initShot();
    shot.addEventListener("load", updateShotBox);
    for (var id in handle) {
        handle[id].style.left = 100 * data[id].x + "%";
        handle[id].style.top = 100 * data[id].y + "%";
        handle[id].addEventListener("mousedown", grabStart);
        handle[id].addEventListener("touchstart", grabStart);
    }
    for (var id in dial) {
        dial[id].addEventListener("change", updateDial);
        dial[id].dispatchEvent(new InputEvent("change"));
    }
    fileLoader.addEventListener("change", loadFile);
    urlLoader.addEventListener("change", loadURL);
}

function resetInputs() { // negate input restoration upon history.back()
    for (var id in dial) {
        dial[id].value = data[id].c;
    }
    fileLoader.value = "";
    urlLoader.value = "";
    result.value = "";
    updatePreview();
}

function holup(e) {
    if (shotChanged) {
        e.preventDefault();
        e.returnValue = "Changes you made may not be saved.";
        return e.returnValue;    
    }
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", resetInputs);
window.addEventListener("beforeunload", holup);
