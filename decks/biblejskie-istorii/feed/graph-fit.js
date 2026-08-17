/* Колода: граф знаний — эпохи в круге, портреты героев/сюжетов,
   подсветка пройденных, перетаскивание узлов. Ядро не трогаем. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var BR = 8.8;

  function hrefOf(img) {
    return img.getAttribute("href") || img.getAttribute("xlink:href") || "";
  }
  function isSplash(href) {
    return /splash(_hero)?\.webp/i.test(href) || /book-cover\.webp/i.test(href);
  }
  function isChapterPhoto(href) {
    return /\/(plots_|heroes_|feed_)/i.test(href) && !/\/icons\//i.test(href);
  }
  function sliceOf(href) {
    return isSplash(href) ? "xMidYMin slice" : "xMidYMid slice";
  }
  function cardKnows(c) {
    var k = [].concat(c.knows || c.concepts || []);
    if (c.concept) k.push(c.concept);
    return k;
  }
  function fromCards(cards, id, preferScene) {
    var i, c, hit = "";
    for (i = 0; i < (cards || []).length; i++) {
      c = cards[i];
      if (!c || !c.img) continue;
      if (cardKnows(c).indexOf(id) < 0) continue;
      if (preferScene && (c.kind === "art" || c.kind === "scene")) return c.img;
      if (!hit) hit = c.img;
    }
    return hit;
  }
  function faceSrc(id) {
    var hit = fromCards(window.FEED_OPENING && FEED_OPENING.cards, id, true);
    if (hit) return hit;
    var chs = window.FEED_CHAPTERS || [], j;
    for (j = 0; j < chs.length; j++) {
      hit = fromCards(chs[j] && chs[j].cards, id, true);
      if (hit) return hit;
    }
    hit = fromCards(window.FEED_OPENING && FEED_OPENING.cards, id, false);
    if (hit) return hit;
    for (j = 0; j < chs.length; j++) {
      hit = fromCards(chs[j] && chs[j].cards, id, false);
      if (hit) return hit;
    }
    return "../img/icons/book-mark.webp";
  }
  function isKnown(id) {
    var ns = (window.FEED_OPENING && FEED_OPENING.deck) || "biblejskie-istorii";
    var known = {}, learned = {}, v;
    try { known = JSON.parse(localStorage.getItem(ns + "_feed_know")) || {}; } catch (e) {}
    try { learned = JSON.parse(localStorage.getItem(ns + "_feed_learned")) || {}; } catch (e) {}
    v = known[id];
    if (typeof v === "number") return v >= 0.6;
    return !!(v || learned[id]);
  }
  function layout() {
    var sys = (window.FEED_GRAPH && FEED_GRAPH.systems) || [];
    var N = sys.length || 1;
    var coreCx = 170, coreCy = 178, coreR1 = 118;
    var rC = 26, rZ = 15, rB = 10.2, gap = 4.5;
    var zones = [], birds = [];
    function birdRing(M) {
      M = Math.max(M, 1);
      var minD = rZ + rB + gap;
      if (M < 2) return minD;
      return Math.max(minD, (2 * rB + gap) / (2 * Math.sin(Math.PI / M)));
    }
    function clusterR(M) { return birdRing(Math.max(M, 1)) + rB; }
    var maxCR = 0;
    sys.forEach(function (sy) {
      maxCR = Math.max(maxCR, clusterR((sy.organs || []).length));
    });
    var need = 2 * maxCR + gap;
    var ang = 2 * Math.PI / N;
    var cosA = Math.cos(ang);
    function distRO(ri, ro) {
      return Math.sqrt(ri * ri + ro * ro - 2 * ri * ro * cosA);
    }
    var Ri = rC + maxCR + gap;
    var Ro = Ri + need;
    var guard = 0;
    while (guard++ < 80) {
      var dAdj = distRO(Ri, Ro);
      var dIn = 2 * Ri * Math.sin(ang);
      var dOut = 2 * Ro * Math.sin(ang);
      if (dAdj >= need && dIn >= need && dOut >= need && Ro - Ri >= need * 0.92) break;
      if (dIn < need) Ri += 5;
      Ro += 6;
    }
    sys.forEach(function (sy, i) {
      var a = -Math.PI / 2 + i / N * 2 * Math.PI;
      var ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux;
      var ox = coreCx + coreR1 * ux, oy = coreCy + coreR1 * uy;
      var R = (i % 2 === 0) ? Ri : Ro;
      var sx = coreCx + R * ux, sy2 = coreCy + R * uy;
      var M = (sy.organs || []).length;
      var d = birdRing(M);
      zones.push({
        id: sy.id, color: sy.color, name: sy.name, icon: sy.icon,
        ox: ox, oy: oy, x: sx, y: sy2
      });
      (sy.organs || []).forEach(function (o, j) {
        var off = (j - (M - 1) / 2) * 15;
        var bx, by;
        if (M <= 1) {
          bx = sx + ux * d;
          by = sy2 + uy * d;
        } else {
          var ba = a + (j / M) * 2 * Math.PI;
          bx = sx + Math.cos(ba) * d;
          by = sy2 + Math.sin(ba) * d;
        }
        birds.push({
          id: o.id, zone: sy.id, color: sy.color, name: o.name,
          ox: ox + ux * 20 + px * off,
          oy: oy + uy * 20 + py * off,
          x: bx, y: by
        });
      });
    });
    return { cx: coreCx, cy: coreCy, matchCx: coreCx, matchCy: coreCy, zones: zones, birds: birds };
  }
  function boundsOf(L) {
    var rC = 28, rZ = 16, rB = 12, pad = 16;
    var minX = L.cx - rC, maxX = L.cx + rC, minY = L.cy - rC, maxY = L.cy + rC;
    L.zones.forEach(function (z) {
      minX = Math.min(minX, z.x - rZ); maxX = Math.max(maxX, z.x + rZ);
      minY = Math.min(minY, z.y - rZ); maxY = Math.max(maxY, z.y + rZ);
    });
    L.birds.forEach(function (b) {
      minX = Math.min(minX, b.x - rB); maxX = Math.max(maxX, b.x + rB);
      minY = Math.min(minY, b.y - rB); maxY = Math.max(maxY, b.y + rB);
    });
    return { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
  }
  function visCircles(svg) {
    return [].filter.call(svg.querySelectorAll("circle"), function (c) {
      return !c.closest("clipPath");
    });
  }
  function nearest(list, x, y, maxd) {
    var best = null, bd = maxd, i, c, d;
    for (i = 0; i < list.length; i++) {
      c = list[i];
      if (c.getAttribute("data-gn")) continue;
      d = Math.hypot(parseFloat(c.getAttribute("cx")) - x, parseFloat(c.getAttribute("cy")) - y);
      if (d < bd) { bd = d; best = c; }
    }
    return best;
  }
  function imgAt(images, x, y, maxd) {
    var best = null, bd = maxd, i, im, ix, iy, d, w, h;
    for (i = 0; i < images.length; i++) {
      im = images[i];
      if (im.getAttribute("data-gn")) continue;
      w = parseFloat(im.getAttribute("width")) || 0;
      h = parseFloat(im.getAttribute("height")) || 0;
      ix = parseFloat(im.getAttribute("x")) + w / 2;
      iy = parseFloat(im.getAttribute("y")) + h / 2;
      d = Math.hypot(ix - x, iy - y);
      if (d < bd) { bd = d; best = im; }
    }
    return best;
  }
  function fillHubImage(img) {
    var href = hrefOf(img);
    if (!isSplash(href) && !isChapterPhoto(href)) return;
    img.setAttribute("preserveAspectRatio", sliceOf(href));
    var svg = img.ownerSVGElement;
    if (!svg || !svg.classList.contains("pgsvg")) return;
    var cx = parseFloat(img.getAttribute("x")) + parseFloat(img.getAttribute("width")) / 2;
    var cy = parseFloat(img.getAttribute("y")) + parseFloat(img.getAttribute("height")) / 2;
    var hub = null, hubR = 0;
    visCircles(svg).forEach(function (c) {
      var r = parseFloat(c.getAttribute("data-r") || c.getAttribute("r") || 0);
      if (r < 12) return;
      var x = parseFloat(c.getAttribute("cx")), y = parseFloat(c.getAttribute("cy"));
      if (Math.hypot(x - cx, y - cy) > r + 8) return;
      if (r > hubR) { hub = c; hubR = r; }
    });
    if (!hub) return;
    var clipRef = (img.getAttribute("clip-path") || "").replace(/^url\(["']?#([^)"']+)["']?\)$/, "$1");
    var clip = clipRef && (svg.getElementById(clipRef) || document.getElementById(clipRef));
    var clipC = clip && clip.querySelector("circle");
    var hx = parseFloat(hub.getAttribute("cx"));
    var hy = parseFloat(hub.getAttribute("cy"));
    var splash = isSplash(href);
    var ir = splash ? Math.max(hubR - 1, hubR * 0.96) : Math.max(hubR - 1.6, hubR * 0.9);
    if (clipC) {
      clipC.setAttribute("cx", hx);
      clipC.setAttribute("cy", hy);
      clipC.setAttribute("r", ir);
      clipC.setAttribute("data-r", ir);
    }
    img.setAttribute("x", hx - ir);
    img.setAttribute("y", hy - ir);
    img.setAttribute("width", ir * 2);
    img.setAttribute("height", ir * 2);
    img.setAttribute("data-hub", "1");
  }
  function el(name, attrs) {
    var n = document.createElementNS(NS, name), k;
    for (k in attrs) if (attrs.hasOwnProperty(k) && attrs[k] != null) n.setAttribute(k, attrs[k]);
    return n;
  }
  function coverCenter(svg, node) {
    if (!node || !node.circle || !svg) return;
    var x = parseFloat(node.circle.getAttribute("cx"));
    var y = parseFloat(node.circle.getAttribute("cy"));
    var R = parseFloat(node.circle.getAttribute("data-r") || 0);
    if (!(R >= 20)) {
      R = 26;
      node.circle.setAttribute("data-r", R);
    }
    node.circle.setAttribute("r", R);
    node.circle.setAttribute("fill", "#c0603a");
    node.circle.setAttribute("stroke", "#c0603a");
    node.circle.setAttribute("stroke-width", "1.5");
    [].forEach.call((node.g || svg).querySelectorAll("text"), function (t) {
      t.style.display = "none";
    });
    node.text = null;
    if (!node.img) return;
    var ir = R - 0.8;
    var cid = "bf_center";
    var old = svg.getElementById(cid) || document.getElementById(cid);
    if (old && old.parentNode) old.parentNode.removeChild(old);
    node.img.removeAttribute("clip-path");
    node.img.removeAttribute("clipPath");
    var clip = el("clipPath", { id: cid, clipPathUnits: "userSpaceOnUse" });
    var clipC = el("circle", { cx: String(x), cy: String(y), r: String(ir), "data-r": String(ir) });
    clip.appendChild(clipC);
    svg.insertBefore(clip, svg.firstChild);
    node.img.setAttribute("clip-path", "url(#" + cid + ")");
    node.img.setAttribute("preserveAspectRatio", "xMidYMin slice");
    node.img.setAttribute("x", String(x - ir));
    node.img.setAttribute("y", String(y - ir));
    node.img.setAttribute("width", String(ir * 2));
    node.img.setAttribute("height", String(ir * 2));
    node.clipC = clipC;
    node.x = x;
    node.y = y;
  }
  function setPos(node, x, y) {
    var r = parseFloat(node.circle.getAttribute("data-r") || node.circle.getAttribute("r") || BR);
    node.x = x; node.y = y;
    node.circle.setAttribute("cx", x);
    node.circle.setAttribute("cy", y);
    if (node.clipC) {
      node.clipC.setAttribute("cx", x);
      node.clipC.setAttribute("cy", y);
    }
    if (node.img) {
      var ir = node.clipC ? parseFloat(node.clipC.getAttribute("r")) : r;
      node.img.setAttribute("x", x - ir);
      node.img.setAttribute("y", y - ir);
      node.img.setAttribute("width", ir * 2);
      node.img.setAttribute("height", ir * 2);
    }
    if (node.text) {
      node.text.setAttribute("x", x);
      node.text.setAttribute("y", y + 19);
    }
    node.g.setAttribute("data-x", x);
    node.g.setAttribute("data-y", y);
  }
  function svgPt(svg, ev) {
    var p = svg.createSVGPoint();
    p.x = ev.clientX; p.y = ev.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function expandCanvas(svg) {
    if (!svg || !svg.classList.contains("pgsvg")) return;
    var b = svg._birdsVB;
    if (!b) return;
    var x = b.x, y = b.y, w = b.w, h = b.h;
    var sw = svg.clientWidth, sh = svg.clientHeight;
    if (sw > 20 && sh > 20) {
      var aspect = sw / sh, vbA = w / h;
      if (aspect > vbA) {
        var nw = h * aspect;
        x -= (nw - w) / 2;
        w = nw;
      } else {
        var nh = w / aspect;
        y -= (nh - h) / 2;
        h = nh;
      }
    }
    svg.setAttribute("viewBox", x + " " + y + " " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }
  function enhance(svg) {
    if (!svg || svg.getAttribute("data-bibi-graph")) return;
    svg.setAttribute("data-bibi-graph", "1");
    [].forEach.call(svg.querySelectorAll("image"), fillHubImage);

    var L = layout();
    var circles = visCircles(svg);
    var images = [].slice.call(svg.querySelectorAll("image"));
    var nodes = {};
    var centerC = nearest(circles.filter(function (c) {
      return parseFloat(c.getAttribute("data-r") || c.getAttribute("r") || 0) >= 20;
    }), L.matchCx, L.matchCy, 40);
    var centerImg = images.filter(function (im) { return isSplash(hrefOf(im)); })[0];
    if (!centerImg) {
      centerImg = imgAt(images, L.matchCx, L.matchCy, 40);
    }
    var centerText = svg.querySelector("text");
    var gCenter = el("g", { "class": "gnode gcenter", "data-kind": "center", "data-id": "center" });
    if (centerC) {
      centerC.setAttribute("data-gn", "center");
      svg.appendChild(gCenter);
      gCenter.appendChild(centerC);
      if (centerImg) {
        centerImg.setAttribute("data-gn", "center");
        gCenter.appendChild(centerImg);
      }
      if (centerText) gCenter.appendChild(centerText);
      nodes.center = {
        kind: "center", id: "center", g: gCenter, circle: centerC, img: centerImg,
        clipC: null, text: centerText,
        x: parseFloat(centerC.getAttribute("cx")), y: parseFloat(centerC.getAttribute("cy"))
      };
      coverCenter(svg, nodes.center);
      var nKeep = 0;
      var keep = setInterval(function () {
        coverCenter(svg, nodes.center);
        if (++nKeep > 15) clearInterval(keep);
      }, 70);
    }

    L.zones.forEach(function (z) {
      var c = nearest(circles.filter(function (cc) {
        var r = parseFloat(cc.getAttribute("data-r") || cc.getAttribute("r") || 0);
        return r >= 12 && r < 22 && !cc.getAttribute("data-gn");
      }), z.ox, z.oy, 28);
      if (!c) return;
      c.setAttribute("data-gn", z.id);
      var img = z.icon ? images.filter(function (im) {
        var h = hrefOf(im);
        return h && z.icon && h.indexOf(z.icon.replace(/^\.\.\//, "")) !== -1;
      })[0] : null;
      if (!img) img = imgAt(images, z.ox, z.oy, 22);
      if (!img && z.icon) {
        var zr = parseFloat(c.getAttribute("data-r") || c.getAttribute("r") || 15);
        var zir = Math.max(zr - 1.2, zr * 0.9);
        var zcid = "bf_z_" + String(z.id).replace(/[^a-z0-9_-]/gi, "_");
        var zclip = el("clipPath", { id: zcid, clipPathUnits: "userSpaceOnUse" });
        zclip.appendChild(el("circle", { cx: String(z.ox), cy: String(z.oy), r: String(zir), "data-r": String(zir) }));
        svg.insertBefore(zclip, svg.firstChild);
        img = el("image", {
          href: z.icon,
          x: String(z.ox - zir), y: String(z.oy - zir),
          width: String(zir * 2), height: String(zir * 2),
          "clip-path": "url(#" + zcid + ")",
          preserveAspectRatio: "xMidYMid slice"
        });
      }
      if (img) img.setAttribute("data-gn", z.id);
      var g = el("g", { "class": "gnode gzone", "data-kind": "zone", "data-id": z.id });
      var title = el("title", {});
      title.textContent = (typeof z.name === "string" ? z.name : (z.name && (z.name.ru || z.name.en))) || z.id;
      g.appendChild(title);
      svg.appendChild(g);
      g.appendChild(c);
      if (img) g.appendChild(img);
      var clipRef = img && (img.getAttribute("clip-path") || "").replace(/^url\(#(.+)\)$/, "$1");
      var clip = clipRef && (svg.getElementById(clipRef) || document.getElementById(clipRef));
      nodes[z.id] = {
        kind: "zone", id: z.id, g: g, circle: c, img: img,
        clipC: clip && clip.querySelector("circle"),
        x: parseFloat(c.getAttribute("cx")), y: parseFloat(c.getAttribute("cy")),
        color: z.color
      };
    });

    L.birds.forEach(function (b) {
      var c = nearest(circles.filter(function (cc) {
        var r = parseFloat(cc.getAttribute("data-r") || cc.getAttribute("r") || 0);
        return r < 12 && !cc.getAttribute("data-gn");
      }), b.ox, b.oy, 16);
      if (!c) return;
      var known = isKnown(b.id);
      var r = known ? BR + 1.2 : BR;
      c.setAttribute("data-gn", b.id);
      c.setAttribute("r", r);
      c.setAttribute("data-r", r);
      c.setAttribute("fill", known ? b.color : "#efe7d7");
      c.setAttribute("stroke", known ? "#fff" : "rgba(255,255,255,.85)");
      c.setAttribute("stroke-width", known ? "2.4" : "1.2");
      if (known) c.classList.add("lit");
      else c.classList.remove("lit");
      var cid = "bf_" + b.id.replace(/[^a-z0-9_-]/gi, "_");
      var clip = el("clipPath", { id: cid });
      var clipC = el("circle", { cx: b.x, cy: b.y, r: r - 1.2, "data-r": r - 1.2 });
      clip.appendChild(clipC);
      svg.insertBefore(clip, svg.firstChild);
      var img = el("image", {
        href: faceSrc(b.id),
        x: b.x - (r - 1.2), y: b.y - (r - 1.2),
        width: (r - 1.2) * 2, height: (r - 1.2) * 2,
        "clip-path": "url(#" + cid + ")",
        preserveAspectRatio: "xMidYMid slice"
      });
      var g = el("g", {
        "class": "gnode gbird" + (known ? " is-known" : " is-new"),
        "data-kind": "bird", "data-id": b.id, "data-zone": b.zone
      });
      var title = el("title", {});
      title.textContent = (typeof b.name === "string" ? b.name : (b.name && (b.name.ru || b.name.en))) || b.id;
      g.appendChild(title);
      g.appendChild(c);
      g.appendChild(img);
      svg.appendChild(g);
      nodes[b.id] = {
        kind: "bird", id: b.id, zone: b.zone, g: g, circle: c, img: img, clipC: clipC,
        x: parseFloat(c.getAttribute("cx")) || b.x, y: parseFloat(c.getAttribute("cy")) || b.y,
        color: b.color
      };
      setPos(nodes[b.id], nodes[b.id].x, nodes[b.id].y);
    });
    if (nodes.center) svg.appendChild(nodes.center.g);

    [].forEach.call(svg.querySelectorAll(":scope > line"), function (ln) {
      if (ln.parentNode) ln.parentNode.removeChild(ln);
    });
    var gLines = el("g", { "class": "glines" });
    var firstNode = svg.querySelector("g.gnode");
    if (firstNode) svg.insertBefore(gLines, firstNode);
    else svg.appendChild(gLines);
    L.zones.forEach(function (z) {
      var zn = nodes[z.id];
      if (!zn || !nodes.center) return;
      var ln = el("line", {
        fill: "none",
        stroke: zn.color || "#cbb89a",
        "stroke-width": "1.8",
        "stroke-opacity": "0.7",
        "stroke-linecap": "round"
      });
      gLines.appendChild(ln);
      zn.lineIn = ln;
    });
    L.birds.forEach(function (b) {
      var bn = nodes[b.id], zn = nodes[b.zone];
      if (!bn || !zn) return;
      var ln = el("line", {
        fill: "none",
        stroke: bn.color || "#cbb89a",
        "stroke-width": "1.25",
        "stroke-opacity": "0.55",
        "stroke-linecap": "round"
      });
      gLines.appendChild(ln);
      bn.lineIn = ln;
    });
    function syncLines() {
      var ctr = nodes.center;
      L.zones.forEach(function (z) {
        var zn = nodes[z.id];
        if (!zn || !zn.lineIn || !ctr) return;
        zn.lineIn.setAttribute("x1", ctr.x);
        zn.lineIn.setAttribute("y1", ctr.y);
        zn.lineIn.setAttribute("x2", zn.x);
        zn.lineIn.setAttribute("y2", zn.y);
      });
      L.birds.forEach(function (b) {
        var bn = nodes[b.id], zn = nodes[b.zone];
        if (!bn || !bn.lineIn || !zn) return;
        bn.lineIn.setAttribute("x1", zn.x);
        bn.lineIn.setAttribute("y1", zn.y);
        bn.lineIn.setAttribute("x2", bn.x);
        bn.lineIn.setAttribute("y2", bn.y);
      });
    }
    function applyPacked() {
      if (nodes.center) {
        setPos(nodes.center, L.cx, L.cy);
        coverCenter(svg, nodes.center);
      }
      L.zones.forEach(function (z) {
        var zn = nodes[z.id];
        if (zn) setPos(zn, z.x, z.y);
      });
      L.birds.forEach(function (b) {
        var bn = nodes[b.id];
        if (bn) setPos(bn, b.x, b.y);
      });
    }
    applyPacked();
    svg._birdsVB = boundsOf(L);
    syncLines();

    var drag = null;
    svg.addEventListener("pointerdown", function (ev) {
      var t = ev.target.closest("[data-kind]");
      if (!t || !svg.contains(t)) return;
      var id = t.getAttribute("data-id");
      var node = nodes[id];
      if (!node) return;
      ev.preventDefault();
      ev.stopPropagation();
      var p = svgPt(svg, ev);
      drag = { node: node, dx: p.x - node.x, dy: p.y - node.y };
      if (node.kind === "zone") {
        drag.kids = L.birds.filter(function (b) { return b.zone === node.id; }).map(function (b) {
          return nodes[b.id];
        }).filter(Boolean).map(function (bn) {
          return { n: bn, ox: bn.x - node.x, oy: bn.y - node.y };
        });
      }
      svg.classList.add("is-drag");
      t.classList.add("is-drag");
      try { t.setPointerCapture(ev.pointerId); } catch (e) {}
    });
    svg.addEventListener("pointermove", function (ev) {
      if (!drag) return;
      ev.preventDefault();
      var p = svgPt(svg, ev);
      var x = p.x - drag.dx, y = p.y - drag.dy;
      setPos(drag.node, x, y);
      if (drag.kids) {
        drag.kids.forEach(function (k) { setPos(k.n, x + k.ox, y + k.oy); });
      }
      syncLines();
    });
    function endDrag() {
      if (!drag) return;
      svg.classList.remove("is-drag");
      drag.node.g.classList.remove("is-drag");
      drag = null;
    }
    svg.addEventListener("pointerup", endDrag);
    svg.addEventListener("pointercancel", endDrag);
    function runExpand() {
      expandCanvas(svg);
    }
    runExpand();
    requestAnimationFrame(function () {
      runExpand();
      requestAnimationFrame(runExpand);
    });
    if (!svg._birdsResize) {
      svg._birdsResize = 1;
      window.addEventListener("resize", runExpand);
    }
  }

  function fitMini(root) {
    if (!root) return;
    [].forEach.call(root.querySelectorAll("image"), fillHubImage);
  }
  function watch(el, fn) {
    if (!el) return;
    fn(el);
    if (!window.MutationObserver) return;
    new MutationObserver(function () { fn(el); }).observe(el, { childList: true, subtree: true });
  }
  watch(document.getElementById("pgraph"), function (root) {
    var svg = root.querySelector("svg.pgsvg");
    if (svg) enhance(svg);
  });
  watch(document.getElementById("miniGraph"), fitMini);
})();
