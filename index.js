var page = {};
var palette = {};

var mouse, id;

var a, b, c, d, grid, line, w, n;

var data = {
    a: {x: 0, y: 0},
    b: {x: 0, y: 0},
    c: {x: 0, y: 0},
    d: {x: 0, y: 0},
    grid: {},
    line: {},
    w: {},
    n: {},
    wc: {}
};

var count = {x: 0, y: 0};
var preferredCount = 10;

var number = 10;
var rayX, rayY;

/* helpers */

function bound(min, n, max) {
    return Math.min(Math.max(min, n), max);
}

function getPointer(e) {
    e.preventDefault();
    if (e.touches) {
        return {x: e.touches[0].clientX, y: e.touches[0].clientY};
    }
    return {x: e.clientX + scrollX, y: e.clientY + scrollY};
}

/* updaters */

function updateGrid() {
    var l, r, t, b;
    var minPixels = 10;
    var oldCount = count.x * count.y;

    if (data.a.x < data.b.x) {
        l = data.a;
        r = data.b;
    }
    else {
        l = data.b;
        r = data.a;
    }
    if (data.a.y < data.b.y) {
        t = data.a;
        b = data.b;
    }
    else {
        t = data.b;
        b = data.a;
    }
    count.x = bound(0, Math.round((r.x - l.x) / minPixels), preferredCount); // todo: maybe lower min should be 1?
    count.y = bound(0, Math.round(count.x * (b.y - t.y) / (r.x - l.x)), 64);

    l.e.classList.remove("right");
    l.e.classList.add("left");
    r.e.classList.remove("left");
    r.e.classList.add("right");
    t.e.classList.remove("bottom");
    t.e.classList.add("top");
    b.e.classList.remove("top");
    b.e.classList.add("bottom");

    data.grid.e.style.left = l.x + "px";
    data.grid.e.style.top = t.y + "px";
    data.grid.e.style.width = r.x - l.x + "px";
    data.grid.e.style.height = b.y - t.y + "px";
    data.grid.e.style.gridTemplateColumns = "repeat(" + count.x + ", 1fr)";
    if (oldCount != count.x * count.y) {
        data.grid.e.innerHTML = "<div></div>".repeat(count.x * count.y);
    }

    data.w.e.style.left = (l.x + r.x) / 2 + "px";
    data.w.e.style.top = t.y - 20 + "px";

    if (count.x == preferredCount) {
        data.w.e.classList.remove("not-wide-enough");
        data.wc.e.classList.add("gone");
    }
    else {
        data.w.e.classList.add("not-wide-enough");
        data.wc.e.classList.remove("gone");
        data.wc.e.style.left = data.w.e.style.left;
        data.wc.e.style.top = data.w.e.style.top;
        data.wc.e.dataset.truecount = count.x;
    }
}

function updateLine(force) {
    var oldRayX = rayX;
    var oldRayY = rayY;

    rayX = data.c.x < data.d.x;
    rayY = data.c.y < data.d.y;
    
    data.line.e.style.left = Math.min(data.c.x, data.d.x) + "px";
    data.line.e.style.top = Math.min(data.c.y, data.d.y) + "px";
    data.line.e.style.width = Math.abs(data.d.x - data.c.x) + "px";
    data.line.e.style.height = Math.abs(data.d.y - data.c.y) + "px";

    if (force || oldRayX != rayX || oldRayY != rayY) {
        var nM1 = number - 1;
        data.line.e.innerHTML = "";
        for (var i = 0; i < number; i++) {
            var letter = document.createElement("div");
            letter.style.left = 100 * (rayX ? i : (nM1 - i)) / nM1 + "%";
            letter.style.top = 100 * (rayY ? i : (nM1 - i)) / nM1 + "%";
            data.line.e.appendChild(letter);
        }
    }

    var m = (data.d.y - data.c.y) / (data.d.x - data.c.x);
    var lx = (data.d.x - data.c.x);
    var ly = (data.d.y - data.c.y);
    var l = Math.sqrt(Math.pow(lx, 2) + Math.pow(ly, 2));
    data.n.e.style.left = (data.c.x + data.d.x) / 2 - (Math.abs(m) < 1 ? ly : -ly) * 50 / l + "px";
    data.n.e.style.top = (data.c.y + data.d.y) / 2 + (Math.abs(m) < 1 ? lx : -lx) * 50 / l + "px";
}

function updateW() {
    preferredCount = bound(this.min, Math.round(this.value), this.max);
    this.value = preferredCount;
    updateGrid();
}

function updateN() {
    number = bound(this.min, Math.round(this.value), this.max);
    this.value = number;
    updateLine(true);
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
    mouse = getPointer(e);
    if (id == "a" || id == "b" || id == "c" || id == "d") {
        var imgrect = img.getBoundingClientRect();
        /* update data */
        data[id].x = bound(0, mouse.x - imgrect.x - scrollX, imgrect.width);
        data[id].y = bound(0, mouse.y - imgrect.y - scrollY, imgrect.height);
        /* update html */
        data[id].e.style.left = data[id].x + "px";
        data[id].e.style.top = data[id].y + "px";
        /* update dependent elements */
        if (id == "a" || id == "b") {
            updateGrid();
        }
        else if (id == "c" || id == "d") {
            updateLine();
        }
    }
}

function grabStart(e) {
    id = this.id;
    grabMove(e);
    document.documentElement.classList.add("moving");
    window.addEventListener("mousemove", grabMove);
    window.addEventListener("touchmove", grabMove, {"passive": false});
    window.addEventListener("mouseup", grabEnd);
    window.addEventListener("touchend", grabEnd);
}

/* image loading */

function updateImage(e) {
    console.log(this.width, this.height);
}

/* initialization */

function init() {
    container = document.getElementById("container");

    img = document.getElementById("img");
    img.addEventListener("load", updateImage);

    data.grid.e = document.getElementById("grid");
    data.line.e = document.getElementById("line");
    data.w.e = document.getElementById("w");
    data.n.e = document.getElementById("n");
    data.wc.e = document.getElementById("w-correction");
    for (var idea of "abcd") {
        data[idea].e = document.getElementById(idea);
        data[idea].e.addEventListener("mousedown", grabStart);
        data[idea].e.addEventListener("touchstart", grabStart);
    }
    data.w.e.addEventListener("input", updateW);
    data.n.e.addEventListener("input", updateN);

    /* sample */
    var dt = {
        a: {x: 0, y: 0},
        b: {x: innerWidth / 2, y: innerHeight},
        c: {x: innerWidth, y: 0},
        d: {x: innerWidth, y: innerHeight}
    };
    for (var i in dt) {
        id = i;
        grabMove({clientX: dt[i].x, clientY: dt[i].y, preventDefault: ()=>{}});
    }
    data.w.e.dispatchEvent(new InputEvent("input"));
    data.n.e.dispatchEvent(new InputEvent("input"));
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
