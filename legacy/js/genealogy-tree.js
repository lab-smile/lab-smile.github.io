/**
 * D3.js Academic Genealogy Tree v2
 * Mobile-friendly interactive DAG with portraits.
 * Usage: initGenealogyTree('container-id', themeConfig)
 */
(function () {
  'use strict';

  // ── Scholar data ──────────────────────────────────────────────────────
  var NODES = [
    { id: 'f_leibniz', name: 'Friedrich Leibniz', sub: 'Leipzig, 1622 · 1597–1652', branch: 'root', badge: null, x: 0, y: 0, photo: 'friedrich_leibniz.jpg' },
    { id: 'thomasius', name: 'Jakob Thomasius', sub: 'Leipzig, 1643 · 1622–1684', branch: 'root', badge: null, x: 0, y: 1, photo: 'jakob_thomasius.jpg' },

    { id: 'mencke', name: 'Otto Mencke', sub: 'Leipzig, 1666 · 1644–1707', branch: 'gauss', badge: null, x: -1, y: 2.8, photo: 'otto_mencke.jpg' },
    { id: 'wichmanns', name: 'J. C. Wichmannshausen', sub: 'Leipzig, 1685 · 1663–1727', branch: 'gauss', badge: null, x: -1, y: 3.8, photo: 'wichmannshausen.jpg' },
    { id: 'hausen', name: 'Christian A. Hausen', sub: 'Halle-Wittenberg, 1713 · 1693–1743', branch: 'gauss', badge: null, x: -1, y: 4.8, photo: 'christian_hausen.jpg' },
    { id: 'kastner', name: 'Abraham G. Kästner', sub: 'Leipzig, 1739 · 1719–1800', branch: 'gauss', badge: null, x: -1, y: 5.8, photo: 'abraham_kastner.jpg' },
    { id: 'pfaff', name: 'Johann Friedrich Pfaff', sub: 'Göttingen, 1786 · 1765–1825', branch: 'gauss', badge: null, x: -1, y: 6.8, photo: 'johann_pfaff.jpg' },
    { id: 'gauss', name: 'Carl Friedrich Gauss', sub: 'Helmstedt, 1799 · 1777–1855', branch: 'gauss', badge: 'star', x: -1, y: 7.8, photo: 'carl_gauss.jpg' },
    { id: 'gerling', name: 'Christian L. Gerling', sub: 'Göttingen, 1812 · 1788–1864', branch: 'gauss', badge: null, x: -1, y: 8.8, photo: 'christian_gerling.jpg' },
    { id: 'plucker', name: 'Julius Plücker', sub: 'Marburg, 1823 · 1801–1868', branch: 'gauss', badge: null, x: -1, y: 9.8, photo: 'julius_plucker.jpg' },

    { id: 'gw_leibniz', name: 'Gottfried W. Leibniz', sub: 'Altdorf, 1666 · 1646–1716', branch: 'euler', badge: 'star', x: 1, y: 2.8, photo: 'gottfried_leibniz.jpg' },
    { id: 'malebranche', name: 'Nicolas Malebranche', sub: 'Paris, ~1690 · 1638–1715', branch: 'euler', badge: null, x: 1, y: 3.8, photo: 'nicolas_malebranche.jpg' },
    { id: 'j_bernoulli', name: 'Jacob Bernoulli', sub: 'Basel, 1684 · 1655–1705', branch: 'euler', badge: null, x: 1, y: 4.8, photo: 'jacob_bernoulli.jpg' },
    { id: 'joh_bernoulli', name: 'Johann Bernoulli', sub: 'Basel, 1694 · 1667–1748', branch: 'euler', badge: null, x: 1, y: 5.8, photo: 'johann_bernoulli.jpg' },
    { id: 'euler', name: 'Leonhard Euler', sub: 'Basel, 1726 · 1707–1783', branch: 'euler', badge: 'star', x: 1, y: 6.8, photo: 'leonhard_euler.jpg' },
    { id: 'lagrange', name: 'Joseph-Louis Lagrange', sub: 'Turin, ~1754 · 1736–1813', branch: 'euler', badge: 'star', x: 1, y: 7.8, photo: 'joseph_lagrange.jpg' },
    { id: 'fourier', name: 'Joseph Fourier', sub: '~1800 · 1768–1830', branch: 'euler', badge: 'star', x: 0.62, y: 8.8, w: 175, photo: 'joseph_fourier.jpg' },
    { id: 'poisson', name: 'Siméon Poisson', sub: '~1800 · 1781–1840', branch: 'euler', badge: 'star', x: 1.38, y: 8.8, w: 175, photo: 'simeon_poisson.jpg' },
    { id: 'dirichlet', name: 'G. Lejeune Dirichlet', sub: 'Bonn, 1827 · 1805–1859', branch: 'euler', badge: 'star', x: 1, y: 9.8, photo: 'gustav_dirichlet.jpg' },
    { id: 'lipschitz', name: 'Rudolf Lipschitz', sub: 'Berlin, 1853 · 1832–1903', branch: 'euler', badge: null, x: 1, y: 10.8, photo: 'rudolf_lipschitz.jpg' },

    { id: 'klein', name: 'Felix Klein', sub: 'Bonn, 1868 · 1849–1925', branch: 'merged', badge: 'star', x: 0, y: 12.4, photo: 'felix_klein.jpg' },
    { id: 'lindemann', name: 'F. von Lindemann', sub: 'Erlangen, 1873 · 1852–1939', branch: 'merged', badge: 'star', x: 0, y: 13.4, photo: 'ferdinand_lindemann.jpg' },
    { id: 'sommerfeld', name: 'Arnold Sommerfeld', sub: 'Königsberg, 1891 · 1868–1951', branch: 'merged', badge: 'star', x: 0, y: 14.4, photo: 'arnold_sommerfeld.jpg' },

    { id: 'guillemin', name: 'Ernst A. Guillemin', sub: 'Munich, 1926 · 1898–1970', branch: 'ee', badge: 'star', x: 0, y: 16.0, photo: 'ernst_guillemin.jpg' },
    { id: 'tuttle', name: 'David F. Tuttle, Jr.', sub: 'MIT, 1948 · 1914–?', branch: 'ee', badge: null, x: 0, y: 17.0, photo: 'david_tuttle.jpg' },
    { id: 'kuh', name: 'Ernest S. Kuh', sub: 'Stanford, 1952 · 1928–2015', branch: 'ee', badge: 'nae', x: 0, y: 18.0, photo: 'ernest_kuh.jpg' },
    { id: 'mitra', name: 'Sanjit K. Mitra', sub: 'UC Berkeley, 1962 · 1935–present', branch: 'ee', badge: 'nae', x: 0, y: 19.0, photo: 'sanjit_mitra.jpg' },
    { id: 'vaidyanathan', name: 'P. P. Vaidyanathan', sub: 'UCSB, 1982 · 1954–present', branch: 'ee', badge: 'nae', x: 0, y: 20.0, photo: 'pp_vaidyanathan.jpg' },
    { id: 'chen', name: 'Tsuhan Chen', sub: 'Caltech, 1993 · 1966–present', branch: 'ee', badge: null, x: 0, y: 21.0, photo: 'tsuhan_chen.jpg' },

    { id: 'fang', name: 'Ruogu Fang', sub: 'Cornell, 2014 · University of Florida', branch: 'current', badge: null, x: 0, y: 22.4, photo: 'ruogu_fang.jpg' }
  ];

  var EDGES = [
    { source: 'f_leibniz', target: 'thomasius' },
    { source: 'thomasius', target: 'mencke' },
    { source: 'thomasius', target: 'gw_leibniz' },

    { source: 'mencke', target: 'wichmanns' },
    { source: 'wichmanns', target: 'hausen' },
    { source: 'hausen', target: 'kastner' },
    { source: 'kastner', target: 'pfaff' },
    { source: 'pfaff', target: 'gauss' },
    { source: 'gauss', target: 'gerling' },
    { source: 'gerling', target: 'plucker' },

    { source: 'gw_leibniz', target: 'malebranche' },
    { source: 'malebranche', target: 'j_bernoulli' },
    { source: 'j_bernoulli', target: 'joh_bernoulli' },
    { source: 'joh_bernoulli', target: 'euler' },
    { source: 'euler', target: 'lagrange' },
    { source: 'lagrange', target: 'fourier' },
    { source: 'lagrange', target: 'poisson' },
    { source: 'fourier', target: 'dirichlet' },
    { source: 'poisson', target: 'dirichlet' },
    { source: 'dirichlet', target: 'lipschitz' },

    { source: 'plucker', target: 'klein' },
    { source: 'lipschitz', target: 'klein' },

    { source: 'klein', target: 'lindemann' },
    { source: 'lindemann', target: 'sommerfeld' },

    { source: 'sommerfeld', target: 'guillemin' },
    { source: 'guillemin', target: 'tuttle' },
    { source: 'tuttle', target: 'kuh' },
    { source: 'kuh', target: 'mitra' },
    { source: 'mitra', target: 'vaidyanathan' },
    { source: 'vaidyanathan', target: 'chen' },
    { source: 'chen', target: 'fang' }
  ];

  var SECTION_LABELS = [
    { text: 'Common Ancestor', y: -0.6, x: 0 },
    { text: 'Gauss Branch', y: 2.0, x: -1 },
    { text: 'Euler Branch', y: 2.0, x: 1 },
    { text: 'Branches Merge', y: 11.6, x: 0 },
    { text: 'EE & Signal Processing', y: 15.6, x: 0 }
  ];

  var DEFAULT_BRANCHES = {
    root: { color: '#a8a29e', bg: '#fafaf9' },
    gauss: { color: '#0d7a5f', bg: '#f0fdf8' },
    euler: { color: '#b5850a', bg: '#fffbf0' },
    merged: { color: '#6c4ecf', bg: '#f8f5ff' },
    ee: { color: '#1a65b0', bg: '#f0f5ff' },
    current: { color: '#b04a28', bg: '#fef5f2' }
  };

  function debounce(fn, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        fn.apply(context, args);
      }, wait);
    };
  }

  // ── Main init function ────────────────────────────────────────────────
  window.initGenealogyTree = function (containerId, theme) {
    theme = theme || {};

    var fontFamily = theme.fontFamily || 'Inter, system-ui, sans-serif';
    var fontDisplay = theme.fontFamilyDisplay || fontFamily;
    var textColor = theme.textColor || '#1c1917';
    var subtextColor = theme.subtextColor || '#78716c';
    var imagePrefix = theme.imagePrefix || '';

    var branches = {};
    for (var b in DEFAULT_BRANCHES) {
      branches[b] = (theme.branches && theme.branches[b]) || DEFAULT_BRANCHES[b];
    }

    var container = document.getElementById(containerId);
    if (!container || !window.d3) return;

    var reducedMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render() {
      var containerWidth = Math.max(container.clientWidth || 320, 320);
      var isMobile = containerWidth < 700;
      var isTiny = containerWidth < 420;

      // ── Mobile-aware layout constants ────────────────────────────────
      var NODE_W = isTiny ? 218 : isMobile ? 238 : 270;
      var NODE_H = isTiny ? 56 : isMobile ? 58 : 62;
      var COL_GAP = isTiny ? 232 : isMobile ? 252 : 310;
      var ROW_GAP = isTiny ? 68 : isMobile ? 70 : 76;
      var MARGIN = isMobile
        ? { top: 48, right: 18, bottom: 32, left: 18 }
        : { top: 60, right: 40, bottom: 40, left: 40 };

      var PHOTO_SIZE = isTiny ? 26 : isMobile ? 28 : 32;
      var TEXT_X = isTiny ? 44 : isMobile ? 48 : 52;

      function nw(node) {
        if (isMobile && node.w) return Math.min(node.w, NODE_W);
        return node.w || NODE_W;
      }

      var minY = d3.min(NODES, function (d) { return d.y; });
      var maxY = d3.max(NODES, function (d) { return d.y; });

      var totalH = MARGIN.top + (maxY - minY) * ROW_GAP + NODE_H + MARGIN.bottom;

      var extraRight = d3.max(NODES, function (d) {
        return d.x * COL_GAP + nw(d) / 2;
      });

      var extraLeft = d3.min(NODES, function (d) {
        return d.x * COL_GAP - nw(d) / 2;
      });

      var totalW = extraRight - extraLeft + MARGIN.left + MARGIN.right;
      var centerX = totalW / 2;

      function px(node) {
        return {
          x: centerX + node.x * COL_GAP,
          y: MARGIN.top + (node.y - minY) * ROW_GAP
        };
      }

      var nodeMap = {};
      NODES.forEach(function (n) {
        nodeMap[n.id] = n;
      });

      // ── Container and SVG ────────────────────────────────────────────
      container.innerHTML = '';
      container.style.position = 'relative';
      container.style.width = '100%';
      container.style.maxWidth = '100%';
      container.style.touchAction = 'pan-y';

      var scale = isMobile ? Math.min(1, containerWidth / totalW) : 1;
      var displayW = isMobile ? containerWidth : totalW;
      var displayH = isMobile ? Math.ceil(totalH * scale) : totalH;

      container.style.overflowX = isMobile ? 'hidden' : 'auto';
      container.style.webkitOverflowScrolling = 'touch';

      var svgWrap = d3.select(container).append('div')
        .style('width', displayW + 'px')
        .style('height', displayH + 'px')
        .style('position', 'relative')
        .style('margin', '0 auto');

      var svg = svgWrap.append('svg')
        .attr('width', displayW)
        .attr('height', displayH)
        .attr('viewBox', '0 0 ' + totalW + ' ' + totalH)
        .attr('preserveAspectRatio', 'xMidYMin meet')
        .style('display', 'block')
        .style('width', '100%')
        .style('height', 'auto')
        .style('font-family', fontFamily)
        .style('-webkit-tap-highlight-color', 'transparent');

      // ── Defs ────────────────────────────────────────────────────────
      var defs = svg.append('defs');

      var safeId = String(containerId).replace(/[^a-zA-Z0-9_-]/g, '-');

      var shadow = defs.append('filter')
        .attr('id', 'gs-' + safeId)
        .attr('x', '-8%')
        .attr('y', '-8%')
        .attr('width', '120%')
        .attr('height', '130%');

      shadow.append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 1.5)
        .attr('stdDeviation', 3)
        .attr('flood-color', '#000')
        .attr('flood-opacity', 0.07);

      var shadowHover = defs.append('filter')
        .attr('id', 'gsh-' + safeId)
        .attr('x', '-12%')
        .attr('y', '-12%')
        .attr('width', '130%')
        .attr('height', '140%');

      shadowHover.append('feDropShadow')
        .attr('dx', 0)
        .attr('dy', 3)
        .attr('stdDeviation', 6)
        .attr('flood-color', '#000')
        .attr('flood-opacity', 0.12);

      var glow = defs.append('filter')
        .attr('id', 'gg-' + safeId)
        .attr('x', '-20%')
        .attr('y', '-20%')
        .attr('width', '150%')
        .attr('height', '150%');

      glow.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', 2.5)
        .attr('result', 'b');

      var gm = glow.append('feMerge');
      gm.append('feMergeNode').attr('in', 'b');
      gm.append('feMergeNode').attr('in', 'SourceGraphic');

      var photoCx = 14 + PHOTO_SIZE / 2;
      var photoCy = (NODE_H - PHOTO_SIZE) / 2 + PHOTO_SIZE / 2;

      NODES.forEach(function (d) {
        if (d.photo) {
          defs.append('clipPath')
            .attr('id', 'cp-' + safeId + '-' + d.id)
            .append('circle')
            .attr('cx', photoCx)
            .attr('cy', photoCy)
            .attr('r', PHOTO_SIZE / 2);
        }
      });

      var g = svg.append('g').attr('class', 'gen-main');

      // ── Edges ───────────────────────────────────────────────────────
      var edgesG = g.append('g');

      function edgePath(e) {
        var s = nodeMap[e.source];
        var t = nodeMap[e.target];
        if (!s || !t) return '';

        var sp = px(s);
        var tp = px(t);
        var sx = sp.x;
        var sy = sp.y + NODE_H;
        var tx = tp.x;
        var ty = tp.y;

        if (Math.abs(sx - tx) < 3) {
          return 'M' + sx + ',' + sy + 'L' + tx + ',' + ty;
        }

        var stepY = sy + (ty - sy) * 0.35;
        var dir = tx > sx ? 1 : -1;

        return 'M' + sx + ',' + sy +
          'L' + sx + ',' + stepY +
          'Q' + sx + ',' + (stepY + 10) + ' ' + (sx + dir * 10) + ',' + (stepY + 10) +
          'L' + (tx - dir * 10) + ',' + (stepY + 10) +
          'Q' + tx + ',' + (stepY + 10) + ' ' + tx + ',' + (stepY + 20) +
          'L' + tx + ',' + ty;
      }

      function edgeColor(e) {
        var t = nodeMap[e.target];
        return t && branches[t.branch] ? branches[t.branch].color : '#d6d3d1';
      }

      var edgeEls = edgesG.selectAll('path')
        .data(EDGES)
        .enter()
        .append('path')
        .attr('d', edgePath)
        .attr('fill', 'none')
        .attr('stroke', edgeColor)
        .attr('stroke-width', isMobile ? 1.7 : 2)
        .attr('stroke-linecap', 'round')
        .attr('opacity', reducedMotion ? 1 : 0);

      // ── Section labels ──────────────────────────────────────────────
      var labG = g.append('g');

      SECTION_LABELS.forEach(function (lbl) {
        var lx = centerX + lbl.x * COL_GAP;
        var ly = MARGIN.top + (lbl.y - minY) * ROW_GAP;
        var labelStr = lbl.text.toUpperCase();

        var lg = labG.append('g')
          .style('opacity', reducedMotion ? 1 : 0);

        var tw = labelStr.length * (isMobile ? 5.7 : 6.2) + 24;

        lg.append('rect')
          .attr('x', lx - tw / 2)
          .attr('y', ly - 12)
          .attr('width', tw)
          .attr('height', 22)
          .attr('rx', 11)
          .attr('fill', '#fff');

        lg.append('text')
          .attr('x', lx)
          .attr('y', ly + 4)
          .attr('text-anchor', 'middle')
          .attr('fill', subtextColor)
          .attr('font-size', isMobile ? 9 : 10)
          .attr('font-weight', 700)
          .attr('letter-spacing', isMobile ? '0.08em' : '0.12em')
          .attr('font-family', fontDisplay)
          .text(labelStr);
      });

      // ── Nodes ───────────────────────────────────────────────────────
      var nodesG = g.append('g');

      var nodeGs = nodesG.selectAll('g.node')
        .data(NODES)
        .enter()
        .append('g')
        .attr('class', function (d) {
          return 'node node-' + d.id;
        })
        .attr('transform', function (d) {
          var p = px(d);
          return 'translate(' + (p.x - nw(d) / 2) + ',' + p.y + ')';
        })
        .style('cursor', 'pointer')
        .attr('opacity', reducedMotion ? 1 : 0);

      nodeGs.append('rect')
        .attr('class', 'node-bg')
        .attr('width', function (d) { return nw(d); })
        .attr('height', NODE_H)
        .attr('rx', isMobile ? 9 : 10)
        .attr('fill', function (d) {
          return branches[d.branch] ? branches[d.branch].bg : '#fff';
        })
        .attr('stroke', function (d) {
          return branches[d.branch] ? branches[d.branch].color + '30' : '#e7e5e4';
        })
        .attr('stroke-width', 1.2)
        .attr('filter', 'url(#gs-' + safeId + ')');

      nodeGs.append('rect')
        .attr('class', 'node-accent')
        .attr('x', 0)
        .attr('y', 4)
        .attr('width', function (d) {
          return d.id === 'fang' ? 5 : 3.5;
        })
        .attr('height', NODE_H - 8)
        .attr('rx', 2)
        .attr('fill', function (d) {
          return branches[d.branch] ? branches[d.branch].color : '#ccc';
        });

      nodeGs.append('clipPath')
        .attr('id', function (d) {
          return 'tc-' + safeId + '-' + d.id;
        })
        .append('rect')
        .attr('width', function (d) { return nw(d) - 6; })
        .attr('height', NODE_H)
        .attr('rx', isMobile ? 9 : 10);

      nodeGs.each(function (d) {
        var el = d3.select(this);
        var cx = 14;
        var cy = (NODE_H - PHOTO_SIZE) / 2;

        if (d.photo) {
          el.append('image')
            .attr('href', imagePrefix + 'img/genealogy/' + d.photo)
            .attr('x', cx)
            .attr('y', cy)
            .attr('width', PHOTO_SIZE)
            .attr('height', PHOTO_SIZE)
            .attr('clip-path', 'url(#cp-' + safeId + '-' + d.id + ')')
            .attr('preserveAspectRatio', 'xMidYMid slice');

          el.append('circle')
            .attr('cx', cx + PHOTO_SIZE / 2)
            .attr('cy', cy + PHOTO_SIZE / 2)
            .attr('r', PHOTO_SIZE / 2 + 0.5)
            .attr('fill', 'none')
            .attr('stroke', branches[d.branch] ? branches[d.branch].color + '50' : '#e7e5e4')
            .attr('stroke-width', 1);
        } else {
          var parts = d.name.split(' ');
          var initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();

          el.append('circle')
            .attr('cx', cx + PHOTO_SIZE / 2)
            .attr('cy', cy + PHOTO_SIZE / 2)
            .attr('r', PHOTO_SIZE / 2)
            .attr('fill', branches[d.branch] ? branches[d.branch].color + '18' : '#f5f5f4')
            .attr('stroke', branches[d.branch] ? branches[d.branch].color + '40' : '#e7e5e4')
            .attr('stroke-width', 0.8);

          el.append('text')
            .attr('x', cx + PHOTO_SIZE / 2)
            .attr('y', cy + PHOTO_SIZE / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', branches[d.branch] ? branches[d.branch].color : '#a8a29e')
            .attr('font-size', isMobile ? 9 : 10)
            .attr('font-weight', 600)
            .text(initials);
        }
      });

      var tg = nodeGs.append('g')
        .attr('clip-path', function (d) {
          return 'url(#tc-' + safeId + '-' + d.id + ')';
        });

      tg.each(function (d) {
        var el = d3.select(this);

        var nameEl = el.append('text')
          .attr('x', TEXT_X)
          .attr('y', isMobile ? 23 : 25)
          .attr('fill', textColor)
          .attr('font-size', function () {
            if (d.id === 'fang') return isMobile ? 13.5 : 14.5;
            return isMobile ? 11.7 : 13;
          })
          .attr('font-weight', function () {
            return d.id === 'fang' ? 700 : 600;
          })
          .attr('font-family', fontDisplay);

        nameEl.append('tspan').text(d.name);

        if (d.badge === 'star') {
          nameEl.append('tspan')
            .attr('fill', '#d97706')
            .attr('font-size', isMobile ? 11.5 : 13)
            .text(' ★');
        }
      });

      tg.each(function (d) {
        if (d.badge !== 'nae') return;

        var el = d3.select(this);
        var nameEl = el.select('text');
        var tw = 0;

        try {
          tw = nameEl.node().getComputedTextLength();
        } catch (e) {
          tw = d.name.length * 7.5;
        }

        var bx = Math.min(TEXT_X + tw + 6, nw(d) - 42);
        var by = isMobile ? 12 : 14;

        el.append('rect')
          .attr('x', bx)
          .attr('y', by)
          .attr('width', 28)
          .attr('height', 15)
          .attr('rx', 7.5)
          .attr('fill', '#dbeafe')
          .attr('stroke', '#60a5fa')
          .attr('stroke-width', 0.7);

        el.append('text')
          .attr('x', bx + 14)
          .attr('y', by + 11)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1e40af')
          .attr('font-size', 8)
          .attr('font-weight', 700)
          .text('NAE');
      });

      tg.append('text')
        .attr('x', TEXT_X)
        .attr('y', isMobile ? 41 : 44)
        .attr('fill', subtextColor)
        .attr('font-size', isMobile ? 9.5 : 10.5)
        .text(function (d) {
          return d.sub;
        })
        .each(function (d) {
          var el = this;
          var max = nw(d) - TEXT_X - 10;

          try {
            if (el.getComputedTextLength() > max) {
              var t = el.textContent;
              while (el.getComputedTextLength() > max - 12 && t.length > 0) {
                t = t.slice(0, -1);
                el.textContent = t + '…';
              }
            }
          } catch (e) {}
        });

      // ── Tooltip ─────────────────────────────────────────────────────
      var tip = svgWrap.append('div')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('padding', '8px 12px')
        .style('background', 'rgba(15,15,15,0.92)')
        .style('color', '#fff')
        .style('border-radius', '8px')
        .style('font-size', '12px')
        .style('font-family', fontFamily)
        .style('line-height', '1.4')
        .style('max-width', isMobile ? '220px' : '260px')
        .style('z-index', '20')
        .style('opacity', 0)
        .style('transition', 'opacity .15s')
        .style('backdrop-filter', 'blur(4px)');

      // ── Interactivity ───────────────────────────────────────────────
      var ancestors = {};

      function findAnc(nid, visited) {
        if (visited[nid]) return [];
        visited[nid] = true;

        var result = [nid];

        EDGES.forEach(function (e) {
          if (e.target === nid) {
            result = result.concat(findAnc(e.source, visited));
          }
        });

        return result;
      }

      NODES.forEach(function (n) {
        ancestors[n.id] = findAnc(n.id, {});
      });

      var hilite = false;

      function branchLabel(branch) {
        return {
          root: 'Common Ancestor',
          gauss: 'Gauss Branch',
          euler: 'Euler Branch',
          merged: 'Klein–Sommerfeld',
          ee: 'EE & Signal Processing',
          current: 'Present'
        }[branch] || '';
      }

      function showTooltip(ev, d) {
        if (isMobile) return;

        tip.html(
          '<strong>' + d.name + '</strong><br>' +
          d.sub +
          '<br><span style="opacity:.6">' + branchLabel(d.branch) + '</span>'
        );

        tip.style('opacity', 1);

        var r = svgWrap.node().getBoundingClientRect();
        tip
          .style('left', ev.clientX - r.left + 12 + 'px')
          .style('top', ev.clientY - r.top - 10 + 'px');
      }

      function resetHighlight() {
        hilite = false;

        nodeGs.transition()
          .duration(reducedMotion ? 0 : 250)
          .attr('opacity', 1);

        edgeEls.transition()
          .duration(reducedMotion ? 0 : 250)
          .attr('opacity', 1)
          .attr('stroke-width', isMobile ? 1.7 : 2)
          .attr('filter', 'none');
      }

      nodeGs
        .on('mouseenter', function (ev, d) {
          if (hilite || isMobile) return;

          d3.select(this)
            .select('.node-bg')
            .attr('filter', 'url(#gsh-' + safeId + ')');

          d3.select(this)
            .transition()
            .duration(reducedMotion ? 0 : 120)
            .attr('transform', function () {
              var p = px(d);
              return 'translate(' + (p.x - nw(d) / 2) + ',' + (p.y - 2) + ')';
            });

          showTooltip(ev, d);
        })
        .on('mousemove', function (ev, d) {
          if (hilite || isMobile) return;
          showTooltip(ev, d);
        })
        .on('mouseleave', function (ev, d) {
          if (hilite || isMobile) return;

          d3.select(this)
            .select('.node-bg')
            .attr('filter', 'url(#gs-' + safeId + ')');

          d3.select(this)
            .transition()
            .duration(reducedMotion ? 0 : 120)
            .attr('transform', function () {
              var p = px(d);
              return 'translate(' + (p.x - nw(d) / 2) + ',' + p.y + ')';
            });

          tip.style('opacity', 0);
        })
        .on('click touchstart', function (ev, d) {
          if (ev.cancelable) ev.preventDefault();
          ev.stopPropagation();

          hilite = true;
          tip.style('opacity', 0);

          var ps = {};
          (ancestors[d.id] || [d.id]).forEach(function (id) {
            ps[id] = true;
          });

          nodeGs.transition()
            .duration(reducedMotion ? 0 : 250)
            .attr('opacity', function (nd) {
              return ps[nd.id] ? 1 : 0.12;
            });

          edgeEls.transition()
            .duration(reducedMotion ? 0 : 250)
            .attr('opacity', function (e) {
              return ps[e.source] && ps[e.target] ? 1 : 0.06;
            })
            .attr('stroke-width', function (e) {
              return ps[e.source] && ps[e.target] ? (isMobile ? 2.5 : 3) : 1.3;
            })
            .attr('filter', function (e) {
              return ps[e.source] && ps[e.target] ? 'url(#gg-' + safeId + ')' : 'none';
            });
        });

      svg.on('click touchstart', function () {
        if (!hilite) return;
        resetHighlight();
      });

      // ── Staggered entrance ──────────────────────────────────────────
      var sorted = NODES.slice().sort(function (a, b) {
        return a.y - b.y || a.x - b.x;
      });

      var order = {};
      sorted.forEach(function (n, i) {
        order[n.id] = i;
      });

      nodeGs.transition()
        .delay(function (d) {
          return reducedMotion ? 0 : order[d.id] * 40 + 150;
        })
        .duration(reducedMotion ? 0 : 350)
        .attr('opacity', 1);

      edgeEls.transition()
        .delay(function (d) {
          return reducedMotion ? 0 : Math.min(order[d.source] || 0, order[d.target] || 0) * 40 + 200;
        })
        .duration(reducedMotion ? 0 : 350)
        .attr('opacity', 1);

      labG.selectAll('g').transition()
        .delay(function (d, i) {
          return reducedMotion ? 0 : i * 80 + 100;
        })
        .duration(reducedMotion ? 0 : 350)
        .style('opacity', 1);

      if (!isMobile) {
        setTimeout(function () {
          container.scrollLeft = Math.round((totalW - container.clientWidth) / 2);
        }, 0);
      }
    }

    render();

    if (container.__genealogyResizeHandler) {
      window.removeEventListener('resize', container.__genealogyResizeHandler);
    }

    container.__genealogyResizeHandler = debounce(function () {
      render();
    }, 180);

    window.addEventListener('resize', container.__genealogyResizeHandler);
  };
})();