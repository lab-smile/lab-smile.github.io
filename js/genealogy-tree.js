/**
 * D3.js Academic Genealogy Tree
 * Interactive DAG visualization for SMILE Lab genealogy pages.
 * Usage: initGenealogyTree('container-id', themeConfig)
 */
(function () {
  'use strict';

  // ── Scholar data ──────────────────────────────────────────────────────
  // x: column (-1 = Gauss/left, 0 = center, +1 = Euler/right)
  // y: row index (vertical position — kept tight, no large gaps)

  var NODES = [
    // Shared root
    { id: 'f_leibniz',   name: 'Friedrich Leibniz',       sub: 'Leipzig, 1622 \u00b7 1597\u20131652',                     branch: 'root',    badge: null,   x: 0, y: 0 },
    { id: 'thomasius',   name: 'Jakob Thomasius',          sub: 'Leipzig, 1643 \u00b7 1622\u20131684',                     branch: 'root',    badge: null,   x: 0, y: 1 },

    // Gauss branch (left)
    { id: 'mencke',      name: 'Otto Mencke',              sub: 'Leipzig, 1666 \u00b7 1644\u20131707',                     branch: 'gauss',   badge: null,   x: -1, y: 2.6 },
    { id: 'wichmanns',   name: 'J. C. Wichmannshausen',    sub: 'Leipzig, 1685 \u00b7 1663\u20131727',                     branch: 'gauss',   badge: null,   x: -1, y: 3.6 },
    { id: 'hausen',      name: 'Christian A. Hausen',       sub: 'Halle-Wittenberg, 1713 \u00b7 1693\u20131743',           branch: 'gauss',   badge: null,   x: -1, y: 4.6 },
    { id: 'kastner',     name: 'Abraham G. K\u00e4stner',  sub: 'Leipzig, 1739 \u00b7 1719\u20131800',                     branch: 'gauss',   badge: null,   x: -1, y: 5.6 },
    { id: 'pfaff',       name: 'Johann Friedrich Pfaff',    sub: 'G\u00f6ttingen, 1786 \u00b7 1765\u20131825',             branch: 'gauss',   badge: null,   x: -1, y: 6.6 },
    { id: 'gauss',       name: 'Carl Friedrich Gauss',      sub: 'Helmstedt, 1799 \u00b7 1777\u20131855',                  branch: 'gauss',   badge: 'star', x: -1, y: 7.6 },
    { id: 'gerling',     name: 'Christian L. Gerling',      sub: 'G\u00f6ttingen, 1812 \u00b7 1788\u20131864',             branch: 'gauss',   badge: null,   x: -1, y: 8.6 },
    { id: 'plucker',     name: 'Julius Pl\u00fccker',       sub: 'Marburg, 1823 \u00b7 1801\u20131868',                    branch: 'gauss',   badge: null,   x: -1, y: 9.6 },

    // Euler branch (right)
    { id: 'gw_leibniz',  name: 'Gottfried W. Leibniz',     sub: 'Altdorf, 1666 \u00b7 1646\u20131716',                    branch: 'euler',   badge: 'star', x: 1, y: 2.6 },
    { id: 'j_bernoulli', name: 'Jacob Bernoulli',           sub: 'Basel, 1684 \u00b7 1655\u20131705',                      branch: 'euler',   badge: null,   x: 1, y: 3.6 },
    { id: 'joh_bernoulli', name: 'Johann Bernoulli',        sub: 'Basel, 1694 \u00b7 1667\u20131748',                      branch: 'euler',   badge: null,   x: 1, y: 4.6 },
    { id: 'euler',       name: 'Leonhard Euler',            sub: 'Basel, 1726 \u00b7 1707\u20131783',                      branch: 'euler',   badge: 'star', x: 1, y: 5.6 },
    { id: 'lagrange',    name: 'Joseph-Louis Lagrange',     sub: 'Turin, ~1754 \u00b7 1736\u20131813',                     branch: 'euler',   badge: 'star', x: 1, y: 6.6 },
    { id: 'fourier',     name: 'Fourier',                    sub: '~1800 \u00b7 1768\u20131830',                             branch: 'euler',   badge: 'star', x: 0.62, y: 7.6, w: 150 },
    { id: 'poisson',     name: 'Poisson',                   sub: '~1800 \u00b7 1781\u20131840',                             branch: 'euler',   badge: 'star', x: 1.38, y: 7.6, w: 150 },
    { id: 'dirichlet',   name: 'G. Lejeune Dirichlet',      sub: 'Bonn, 1827 \u00b7 1805\u20131859',                      branch: 'euler',   badge: 'star', x: 1, y: 8.6 },
    { id: 'lipschitz',   name: 'Rudolf Lipschitz',          sub: 'Berlin, 1853 \u00b7 1832\u20131903',                     branch: 'euler',   badge: null,   x: 1, y: 9.6 },

    // Merged (center)
    { id: 'klein',       name: 'Felix Klein',               sub: 'Bonn, 1868 \u00b7 1849\u20131925',                      branch: 'merged',  badge: 'star', x: 0, y: 11.2 },
    { id: 'lindemann',   name: 'F. von Lindemann',          sub: 'Erlangen, 1873 \u00b7 1852\u20131939',                  branch: 'merged',  badge: 'star', x: 0, y: 12.2 },
    { id: 'sommerfeld',  name: 'Arnold Sommerfeld',         sub: 'K\u00f6nigsberg, 1891 \u00b7 1868\u20131951',            branch: 'merged',  badge: 'star', x: 0, y: 13.2 },

    // EE / Signal Processing
    { id: 'guillemin',   name: 'Ernst A. Guillemin',        sub: 'Munich, 1926 \u00b7 1898\u20131970',                     branch: 'ee',      badge: 'star', x: 0, y: 14.6 },
    { id: 'tuttle',      name: 'David F. Tuttle, Jr.',      sub: 'MIT, 1948 \u00b7 1914\u2013?',                             branch: 'ee',      badge: null,   x: 0, y: 15.6 },
    { id: 'kuh',         name: 'Ernest S. Kuh',             sub: 'Stanford, 1952 \u00b7 1928\u20132015',                   branch: 'ee',      badge: 'nae',  x: 0, y: 16.6 },
    { id: 'mitra',       name: 'Sanjit K. Mitra',           sub: 'UC Berkeley, 1962 \u00b7 1935\u2013present',             branch: 'ee',      badge: 'nae',  x: 0, y: 17.6 },
    { id: 'vaidyanathan', name: 'P. P. Vaidyanathan',       sub: 'UCSB, 1982 \u00b7 1954\u2013present',                   branch: 'ee',      badge: 'nae',  x: 0, y: 18.6 },
    { id: 'chen',        name: 'Tsuhan Chen',               sub: 'Caltech, 1993 \u00b7 1966\u2013present',                branch: 'ee',      badge: null,   x: 0, y: 19.6 },

    // Current
    { id: 'fang',        name: 'Ruogu Fang',                sub: 'Cornell, 2014 \u00b7 University of Florida',             branch: 'current', badge: null,   x: 0, y: 20.6 },
  ];

  var EDGES = [
    { source: 'f_leibniz', target: 'thomasius' },
    // Fork
    { source: 'thomasius', target: 'mencke' },
    { source: 'thomasius', target: 'gw_leibniz' },
    // Gauss
    { source: 'mencke',    target: 'wichmanns' },
    { source: 'wichmanns', target: 'hausen' },
    { source: 'hausen',    target: 'kastner' },
    { source: 'kastner',   target: 'pfaff' },
    { source: 'pfaff',     target: 'gauss' },
    { source: 'gauss',     target: 'gerling' },
    { source: 'gerling',   target: 'plucker' },
    // Euler
    { source: 'gw_leibniz',   target: 'j_bernoulli' },
    { source: 'j_bernoulli',  target: 'joh_bernoulli' },
    { source: 'joh_bernoulli', target: 'euler' },
    { source: 'euler',        target: 'lagrange' },
    { source: 'lagrange',     target: 'fourier' },
    { source: 'lagrange',     target: 'poisson' },
    { source: 'fourier',      target: 'dirichlet' },
    { source: 'poisson',      target: 'dirichlet' },
    { source: 'dirichlet',    target: 'lipschitz' },
    // Merge
    { source: 'plucker',   target: 'klein' },
    { source: 'lipschitz', target: 'klein' },
    // Merged chain
    { source: 'klein',      target: 'lindemann' },
    { source: 'lindemann',  target: 'sommerfeld' },
    // EE chain
    { source: 'sommerfeld',  target: 'guillemin' },
    { source: 'guillemin',   target: 'tuttle' },
    { source: 'tuttle',      target: 'kuh' },
    { source: 'kuh',         target: 'mitra' },
    { source: 'mitra',       target: 'vaidyanathan' },
    { source: 'vaidyanathan', target: 'chen' },
    { source: 'chen', target: 'fang' },
  ];

  var SECTION_LABELS = [
    { text: 'Common Ancestor',              y: -0.55, x: 0 },
    { text: 'Gauss Branch',                 y: 1.9,   x: -1 },
    { text: 'Euler Branch',                 y: 1.9,   x: 1 },
    { text: 'Branches Merge',               y: 10.5,  x: 0 },
    { text: 'EE & Signal Processing',       y: 14.0,  x: 0 },
  ];

  var DEFAULT_BRANCHES = {
    root:    { color: '#a8a29e', bg: '#fafaf9' },
    gauss:   { color: '#0d7a5f', bg: '#f0fdf8' },
    euler:   { color: '#b5850a', bg: '#fffbf0' },
    merged:  { color: '#6c4ecf', bg: '#f8f5ff' },
    ee:      { color: '#1a65b0', bg: '#f0f5ff' },
    current: { color: '#b04a28', bg: '#fef5f2' },
  };

  // ── Main init function ────────────────────────────────────────────────
  window.initGenealogyTree = function (containerId, theme) {
    theme = theme || {};
    var fontFamily = theme.fontFamily || 'Inter, system-ui, sans-serif';
    var fontDisplay = theme.fontFamilyDisplay || fontFamily;
    var accentColor = theme.accentColor || '#0021A5';
    var textColor = theme.textColor || '#1c1917';
    var subtextColor = theme.subtextColor || '#78716c';
    var branches = {};
    for (var b in DEFAULT_BRANCHES) {
      branches[b] = (theme.branches && theme.branches[b]) || DEFAULT_BRANCHES[b];
    }

    var container = document.getElementById(containerId);
    if (!container) return;

    // ── Layout constants ────────────────────────────────────────────────
    var NODE_W = 260;
    var NODE_H = 56;
    var COL_GAP = 300;
    var ROW_GAP = 72;
    var MARGIN = { top: 60, right: 40, bottom: 40, left: 40 };

    var minY = d3.min(NODES, function (d) { return d.y; });
    var maxY = d3.max(NODES, function (d) { return d.y; });
    var totalH = MARGIN.top + (maxY - minY) * ROW_GAP + NODE_H + MARGIN.bottom;
    var totalW = MARGIN.left + COL_GAP * 2 + NODE_W + MARGIN.right;
    var centerX = totalW / 2;

    function nw(node) { return node.w || NODE_W; }

    function px(node) {
      return {
        x: centerX + node.x * COL_GAP,
        y: MARGIN.top + (node.y - minY) * ROW_GAP,
      };
    }

    var nodeMap = {};
    NODES.forEach(function (n) { nodeMap[n.id] = n; });

    // ── SVG ─────────────────────────────────────────────────────────────
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.minHeight = totalH * 0.55 + 'px';

    var svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('viewBox', '0 0 ' + totalW + ' ' + totalH)
      .attr('preserveAspectRatio', 'xMidYMin meet')
      .style('font-family', fontFamily);

    // Defs
    var defs = svg.append('defs');

    // Shadow
    var shadow = defs.append('filter').attr('id', 'gs-' + containerId)
      .attr('x', '-8%').attr('y', '-8%').attr('width', '120%').attr('height', '130%');
    shadow.append('feDropShadow').attr('dx', 0).attr('dy', 1.5).attr('stdDeviation', 3)
      .attr('flood-color', '#000').attr('flood-opacity', 0.07);

    var shadowHover = defs.append('filter').attr('id', 'gsh-' + containerId)
      .attr('x', '-12%').attr('y', '-12%').attr('width', '130%').attr('height', '140%');
    shadowHover.append('feDropShadow').attr('dx', 0).attr('dy', 3).attr('stdDeviation', 6)
      .attr('flood-color', '#000').attr('flood-opacity', 0.12);

    // Glow
    var glow = defs.append('filter').attr('id', 'gg-' + containerId)
      .attr('x', '-20%').attr('y', '-20%').attr('width', '150%').attr('height', '150%');
    glow.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 2.5).attr('result', 'b');
    var gm = glow.append('feMerge');
    gm.append('feMergeNode').attr('in', 'b');
    gm.append('feMergeNode').attr('in', 'SourceGraphic');

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arr-' + containerId)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5).attr('refY', 5)
      .attr('markerWidth', 4).attr('markerHeight', 4)
      .attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill', '#d6d3d1');

    var g = svg.append('g').attr('class', 'gen-main');

    // Zoom — no scroll wheel, drag only
    var zoom = d3.zoom()
      .scaleExtent([0.4, 2.5])
      .filter(function (event) {
        return event.type !== 'wheel' && !event.ctrlKey && !event.button;
      })
      .on('zoom', function (event) { g.attr('transform', event.transform); });
    svg.call(zoom);
    svg.on('wheel.zoom', null);
    svg.on('dblclick.zoom', null);

    // Reset button
    var rb = document.createElement('button');
    rb.innerHTML = '\u21ba';
    rb.title = 'Reset view';
    rb.setAttribute('aria-label', 'Reset view');
    rb.style.cssText = 'position:absolute;top:8px;right:8px;z-index:10;background:white;border:1px solid #e0e0e0;border-radius:6px;width:30px;height:30px;cursor:pointer;color:#888;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,0.06);transition:all .2s;';
    rb.onmouseenter = function () { this.style.borderColor = accentColor; this.style.color = accentColor; };
    rb.onmouseleave = function () { this.style.borderColor = '#e0e0e0'; this.style.color = '#888'; };
    rb.onclick = function () { svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity); };
    container.appendChild(rb);

    // ── Edges ───────────────────────────────────────────────────────────
    var edgesG = g.append('g');

    function edgePath(e) {
      var s = nodeMap[e.source], t = nodeMap[e.target];
      if (!s || !t) return '';
      var sp = px(s), tp = px(t);
      var sx = sp.x, sy = sp.y + NODE_H, tx = tp.x, ty = tp.y;

      // Straight vertical
      if (Math.abs(sx - tx) < 3) {
        return 'M' + sx + ',' + sy + 'L' + tx + ',' + ty;
      }

      // Step path for fork/merge: go down, then horizontal, then down
      var stepY = sy + (ty - sy) * 0.35;
      return 'M' + sx + ',' + sy +
        'L' + sx + ',' + stepY +
        'Q' + sx + ',' + (stepY + 10) + ' ' + (sx + (tx > sx ? 10 : -10)) + ',' + (stepY + 10) +
        'L' + (tx - (tx > sx ? 10 : -10)) + ',' + (stepY + 10) +
        'Q' + tx + ',' + (stepY + 10) + ' ' + tx + ',' + (stepY + 20) +
        'L' + tx + ',' + ty;
    }

    function edgeColor(e) {
      var t = nodeMap[e.target];
      return t && branches[t.branch] ? branches[t.branch].color : '#d6d3d1';
    }

    var edgeEls = edgesG.selectAll('path').data(EDGES).enter()
      .append('path')
      .attr('d', edgePath)
      .attr('fill', 'none')
      .attr('stroke', edgeColor)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0);

    // ── Section labels (rendered after edges so they sit on top) ───────
    var labG = g.append('g');
    SECTION_LABELS.forEach(function (lbl) {
      var lx = centerX + lbl.x * COL_GAP;
      var ly = MARGIN.top + (lbl.y - minY) * ROW_GAP;
      var labelStr = lbl.text.toUpperCase();
      var lg = labG.append('g').style('opacity', 0);
      // Approximate text width for background
      var tw = labelStr.length * 6.2 + 24;
      // White pill background so edges don't obscure the label
      lg.append('rect')
        .attr('x', lx - tw / 2).attr('y', ly - 11)
        .attr('width', tw).attr('height', 18)
        .attr('rx', 9)
        .attr('fill', '#fff').attr('opacity', 0.95);
      lg.append('text')
        .attr('x', lx).attr('y', ly + 3)
        .attr('text-anchor', 'middle')
        .attr('fill', subtextColor)
        .attr('font-size', 10)
        .attr('font-weight', 700)
        .attr('letter-spacing', '0.12em')
        .attr('font-family', fontDisplay)
        .text(labelStr);
    });

    // ── Nodes ───────────────────────────────────────────────────────────
    var nodesG = g.append('g');

    var nodeGs = nodesG.selectAll('g.node').data(NODES).enter()
      .append('g')
      .attr('class', function (d) { return 'node node-' + d.id; })
      .attr('transform', function (d) {
        var p = px(d);
        return 'translate(' + (p.x - nw(d) / 2) + ',' + p.y + ')';
      })
      .style('cursor', 'pointer')
      .attr('opacity', 0);

    // Background rect
    nodeGs.append('rect')
      .attr('class', 'node-bg')
      .attr('width', function (d) { return nw(d); }).attr('height', NODE_H).attr('rx', 10)
      .attr('fill', function (d) { return branches[d.branch] ? branches[d.branch].bg : '#fff'; })
      .attr('stroke', function (d) { return branches[d.branch] ? branches[d.branch].color + '30' : '#e7e5e4'; })
      .attr('stroke-width', 1.2)
      .attr('filter', 'url(#gs-' + containerId + ')');

    // Left accent bar
    nodeGs.append('rect')
      .attr('class', 'node-accent')
      .attr('x', 0).attr('y', 4)
      .attr('width', function (d) { return d.id === 'fang' ? 5 : 3.5; })
      .attr('height', NODE_H - 8)
      .attr('rx', 2)
      .attr('fill', function (d) { return branches[d.branch] ? branches[d.branch].color : '#ccc'; });

    // Clip
    nodeGs.append('clipPath')
      .attr('id', function (d) { return 'c-' + containerId + '-' + d.id; })
      .append('rect').attr('width', function (d) { return nw(d) - 6; }).attr('height', NODE_H).attr('rx', 10);

    var tg = nodeGs.append('g')
      .attr('clip-path', function (d) { return 'url(#c-' + containerId + '-' + d.id + ')'; });

    // Name
    tg.append('text')
      .attr('x', 14).attr('y', 22)
      .attr('fill', textColor)
      .attr('font-size', function (d) { return d.id === 'fang' ? 14.5 : 13; })
      .attr('font-weight', function (d) { return d.id === 'fang' ? 700 : 600; })
      .attr('font-family', fontDisplay)
      .text(function (d) { return d.name; });

    // Badges
    tg.each(function (d) {
      if (!d.badge) return;
      var el = d3.select(this);
      var nameEl = el.select('text');
      var nw = 0;
      try { nw = nameEl.node().getComputedTextLength(); } catch (e) { nw = d.name.length * 7.2; }
      var bx = 14 + nw + 5, by = 12;

      if (d.badge === 'star') {
        el.append('circle')
          .attr('cx', bx + 7).attr('cy', by + 8).attr('r', 7.5)
          .attr('fill', '#fef3c7').attr('stroke', '#f59e0b').attr('stroke-width', 0.7);
        el.append('text')
          .attr('x', bx + 7).attr('y', by + 12)
          .attr('text-anchor', 'middle')
          .attr('fill', '#b45309').attr('font-size', 9).attr('font-weight', 700)
          .text('\u2733');
      } else {
        el.append('rect')
          .attr('x', bx).attr('y', by)
          .attr('width', 28).attr('height', 15).attr('rx', 7.5)
          .attr('fill', '#dbeafe').attr('stroke', '#60a5fa').attr('stroke-width', 0.7);
        el.append('text')
          .attr('x', bx + 14).attr('y', by + 11)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1e40af').attr('font-size', 8).attr('font-weight', 700)
          .text('NAE');
      }
    });

    // Subtitle
    tg.append('text')
      .attr('x', 14).attr('y', 41)
      .attr('fill', subtextColor)
      .attr('font-size', 10.5)
      .text(function (d) { return d.sub; })
      .each(function (d) {
        var el = this, max = nw(d) - 20;
        try {
          if (el.getComputedTextLength() > max) {
            var t = el.textContent;
            while (el.getComputedTextLength() > max - 12 && t.length > 0) {
              t = t.slice(0, -1);
              el.textContent = t + '\u2026';
            }
          }
        } catch (e) {}
      });

    // ── Tooltip ─────────────────────────────────────────────────────────
    var tip = d3.select(container).append('div')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('padding', '8px 12px').style('background', 'rgba(15,15,15,0.92)')
      .style('color', '#fff').style('border-radius', '8px').style('font-size', '12px')
      .style('font-family', fontFamily).style('line-height', '1.4')
      .style('max-width', '260px').style('z-index', '20')
      .style('opacity', 0).style('transition', 'opacity .15s')
      .style('backdrop-filter', 'blur(4px)');

    // ── Interactivity ───────────────────────────────────────────────────
    var ancestors = {};
    function findAnc(nid, visited) {
      if (visited[nid]) return [];
      visited[nid] = true;
      var r = [nid];
      EDGES.forEach(function (e) {
        if (e.target === nid) r = r.concat(findAnc(e.source, visited));
      });
      return r;
    }
    NODES.forEach(function (n) { ancestors[n.id] = findAnc(n.id, {}); });

    var hilite = false;

    nodeGs
      .on('mouseenter', function (ev, d) {
        if (hilite) return;
        d3.select(this).select('.node-bg').attr('filter', 'url(#gsh-' + containerId + ')');
        d3.select(this).transition().duration(120)
          .attr('transform', function () {
            var p = px(d);
            return 'translate(' + (p.x - nw(d) / 2) + ',' + (p.y - 2) + ')';
          });
        var bl = ({ root: 'Common Ancestor', gauss: 'Gauss Branch', euler: 'Euler Branch',
          merged: 'Klein\u2013Sommerfeld', ee: 'EE & Signal Processing', current: 'Present' })[d.branch];
        tip.html('<strong>' + d.name + '</strong><br>' + d.sub + '<br><span style="opacity:.6">' + bl + '</span>');
        tip.style('opacity', 1);
        var r = container.getBoundingClientRect();
        tip.style('left', (ev.clientX - r.left + 12) + 'px').style('top', (ev.clientY - r.top - 10) + 'px');
      })
      .on('mousemove', function (ev) {
        var r = container.getBoundingClientRect();
        tip.style('left', (ev.clientX - r.left + 12) + 'px').style('top', (ev.clientY - r.top - 10) + 'px');
      })
      .on('mouseleave', function (ev, d) {
        if (hilite) return;
        d3.select(this).select('.node-bg').attr('filter', 'url(#gs-' + containerId + ')');
        d3.select(this).transition().duration(120)
          .attr('transform', function () {
            var p = px(d);
            return 'translate(' + (p.x - nw(d) / 2) + ',' + p.y + ')';
          });
        tip.style('opacity', 0);
      })
      .on('click', function (ev, d) {
        ev.stopPropagation();
        hilite = true;
        tip.style('opacity', 0);
        var ps = {};
        (ancestors[d.id] || [d.id]).forEach(function (id) { ps[id] = true; });
        nodeGs.transition().duration(250).attr('opacity', function (nd) { return ps[nd.id] ? 1 : 0.12; });
        edgeEls.transition().duration(250)
          .attr('opacity', function (e) { return ps[e.source] && ps[e.target] ? 1 : 0.06; })
          .attr('stroke-width', function (e) { return ps[e.source] && ps[e.target] ? 3 : 1.5; })
          .attr('filter', function (e) { return ps[e.source] && ps[e.target] ? 'url(#gg-' + containerId + ')' : 'none'; });
      });

    svg.on('click', function () {
      if (!hilite) return;
      hilite = false;
      nodeGs.transition().duration(250).attr('opacity', 1);
      edgeEls.transition().duration(250).attr('opacity', 1).attr('stroke-width', 2).attr('filter', 'none');
    });

    // ── Staggered entrance ──────────────────────────────────────────────
    var sorted = NODES.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    var order = {};
    sorted.forEach(function (n, i) { order[n.id] = i; });

    nodeGs.transition()
      .delay(function (d) { return order[d.id] * 40 + 150; })
      .duration(350).attr('opacity', 1);

    edgeEls.transition()
      .delay(function (d) { return Math.min(order[d.source] || 0, order[d.target] || 0) * 40 + 200; })
      .duration(350).attr('opacity', 1);

    labG.selectAll('g').transition()
      .delay(function (d, i) { return i * 80 + 100; })
      .duration(350).style('opacity', 1);
  };
})();
