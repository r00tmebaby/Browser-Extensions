(function () {
  // Prevent multiple activations
  if (window.__audioNormalizerInjected) return;
  window.__audioNormalizerInjected = true;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  // Log-scale frequency tables for 10/15/31 bands
  const FREQ_TABLES = {
    10: [30, 60, 120, 240, 480, 960, 1920, 3840, 7680, 15360],
    15: [31, 63, 125, 250, 500, 1000, 2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000, 18000],
    31: [20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000],
  };

  const state = {
    enabled: true,
    applyAll: true,
    allowlist: [],
    gainValue: 1.5,
    eqMode: 10,
    eqFreqs: FREQ_TABLES[10],
    eqBands: Array(10).fill(0),
    smoothing: 0.5,
    active: false,
    nodes: null,
    audioCtx: null,
    mediaEl: null,
    lastMaxPos: 0,
    lastPeakDb: -60,
    pendingResume: false,
  };

  function hostMatchesAllowlist(hostname, list) {
    return list.some((d) => hostname === d || hostname.endsWith("." + d));
  }

  function shouldActivateForPage() {
    const host = location.hostname || "";
    if (!state.enabled) return true; // build chain but neutralize when disabled
    if (state.applyAll) return true;
    return hostMatchesAllowlist(host, state.allowlist);
  }

  function findFirstMediaElement() {
    const el = document.querySelector("video, audio");
    return el || null;
  }

  function resumeIfSuspended() {
    try {
      if (state.audioCtx && state.audioCtx.state === "suspended") {
        state.audioCtx.resume().catch(() => {});
      }
    } catch {}
  }

  function attachCtxStateHandler(ctx) {
    try {
      ctx.onstatechange = () => {
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        } else if (ctx.state === "closed") {
          rebuildChain();
        }
      };
    } catch {}
  }

  function disconnectNode(node) {
    try { node.disconnect(); } catch {}
  }

  function teardownChain() {
    if (!state.nodes) return;
    try {
      disconnectNode(state.nodes.analyser);
      disconnectNode(state.nodes.gain);
      state.nodes.filters.forEach(disconnectNode);
      disconnectNode(state.nodes.comp);
      disconnectNode(state.nodes.source);
    } catch {}
    try { state.audioCtx && state.audioCtx.close && state.audioCtx.close(); } catch {}
    state.nodes = null;
    state.audioCtx = null;
    state.active = false;
  }

  function createChain(mediaEl) {
    if (!mediaEl) return null;
    try { mediaEl.crossOrigin = 'anonymous'; } catch {}

    // Lazy create context only after user gesture or media play
    if (!state.audioCtx) {
      try { state.audioCtx = new AudioCtx(); attachCtxStateHandler(state.audioCtx); } catch { return null; }
    }
    const audioCtx = state.audioCtx;
    const source = audioCtx.createMediaElementSource(mediaEl);

    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.knee.value = 30;
    comp.ratio.value = 12;
    comp.attack.value = 0.003;
    comp.release.value = 0.25;

    const postAnalyser = audioCtx.createAnalyser();
    postAnalyser.fftSize = 1024; postAnalyser.smoothingTimeConstant = state.smoothing;

    const filters = state.eqFreqs.map((freq) => {
      const f = audioCtx.createBiquadFilter();
      f.type = "peaking"; f.frequency.value = freq; f.Q.value = 0.9; f.gain.value = 0; return f;
    });

    const gain = audioCtx.createGain();
    gain.gain.value = state.gainValue;

    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -2; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.001; limiter.release.value = 0.1;

    try {
      source.connect(comp);
      let prev = comp;
      filters.forEach(f => { prev.connect(f); prev = f; });
      prev.connect(gain);
      gain.connect(limiter);
      limiter.connect(postAnalyser);
      postAnalyser.connect(audioCtx.destination);
    } catch (e) {
      return null;
    }

    return { audioCtx, source, comp, filters, gain, limiter, postAnalyser, analyser: postAnalyser };
  }

  function applyEqGains(filters, gains) {
    if (!filters) return 0;
    const ctx = state.audioCtx || (state.nodes && state.nodes.audioCtx) || null;
    let maxPos = 0;
    for (let i = 0; i < filters.length && i < gains.length; i++) {
      let g = Number(gains[i]) || 0;
      if (g > 12) g = 12; if (g < -12) g = -12;
      if (g > maxPos) maxPos = g;
      if (ctx && typeof filters[i].gain.setTargetAtTime === 'function') {
        try { filters[i].gain.setTargetAtTime(g, ctx.currentTime, 0.02); } catch { filters[i].gain.value = g; }
      } else { filters[i].gain.value = g; }
    }
    state.lastMaxPos = maxPos;
    return maxPos;
  }

  function effectiveGainWithHeadroom() {
    const headroomFactor = 1 + (state.lastMaxPos / 12) * 0.5;
    return state.gainValue / headroomFactor;
  }

  function updateOutputGain() {
    if (!state.nodes) return;
    state.nodes.gain.gain.value = state.enabled ? effectiveGainWithHeadroom() : 1;
  }

  function setEnabledOnNodes(enabled) {
    if (!state.nodes) return;
    if (enabled) {
      state.nodes.comp.threshold.value = -24;
      state.nodes.comp.knee.value = 30;
      state.nodes.comp.ratio.value = 12;
      state.nodes.comp.attack.value = 0.003;
      state.nodes.comp.release.value = 0.25;
      applyEqGains(state.nodes.filters, state.eqBands);
      updateOutputGain();
    } else {
      state.nodes.comp.threshold.value = 0;
      state.nodes.comp.knee.value = 0;
      state.nodes.comp.ratio.value = 1;
      state.nodes.comp.attack.value = 0.001;
      state.nodes.comp.release.value = 0.05;
      applyEqGains(state.nodes.filters, Array(state.nodes.filters.length).fill(0));
      state.nodes.gain.gain.value = 1;
    }
  }

  function canStartContext(mediaEl){
    if (!mediaEl) return false;
    // Allow when media is already playing or a user gesture flagged resume
    const playing = !!(mediaEl.currentTime > 0 && !mediaEl.paused && !mediaEl.ended);
    return playing || state.pendingResume;
  }

  function ensureActive() {
    if (state.active) return;
    const el = findFirstMediaElement();
    if (!el || !canStartContext(el)) return; // wait for gesture or playback

    state.mediaEl = el;
    state.nodes = createChain(el);
    if (!state.nodes) return;

    applyEqGains(state.nodes.filters, state.eqBands);
    state.nodes.gain.gain.value = state.gainValue;
    setEnabledOnNodes(state.enabled);
    resumeIfSuspended();

    const buf = new Uint8Array(state.nodes.analyser.fftSize);
    function meterLoop() {
      if (!state.nodes || !state.nodes.analyser) return;
      try { state.nodes.analyser.getByteTimeDomainData(buf); } catch { rebuildChain(); return; }
      let peak = 0;
      for (let i=0;i<buf.length;i++) {
        const v = (buf[i]-128)/128; const a = Math.abs(v); if (a>peak) peak=a;
      }
      const db = peak>0?20*Math.log10(Math.max(peak,1e-6)):-60;
      state.lastPeakDb = Math.max(-60, Math.min(0, db));
      requestAnimationFrame(meterLoop);
    }
    requestAnimationFrame(meterLoop);

    state.active = true;
  }

  function rebuildChain() {
    teardownChain();
    ensureActive();
  }

  function maybeActivate() {
    if (!shouldActivateForPage()) {
      if (state.nodes) setEnabledOnNodes(false);
      return;
    }
    ensureActive();
  }

  // Spectrum helpers
  function computeBandLevels(analyser, centers) {
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);
    let sumAll = 0; for (let i=0;i<freqData.length;i++) sumAll += freqData[i];
    const sampleRate = analyser.context.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const binHz = nyquist / freqData.length;
    const results = [];
    const SQRT2 = Math.SQRT2;
    for (const c of centers) {
      const low = c / SQRT2;
      const high = c * SQRT2;
      const startBin = Math.max(0, Math.floor(low / binHz));
      const endBin = Math.min(freqData.length - 1, Math.ceil(high / binHz));
      let sum = 0, count = 0;
      for (let i = startBin; i <= endBin; i++) { sum += freqData[i]; count++; }
      const magnitude = count > 0 ? (sum / count) / 255 : 0;
      const db = magnitude > 0 ? 20 * Math.log10(magnitude) : -60;
      results.push(Math.max(-60, Math.min(0, db)));
    }
    // Fallback: if overall spectrum is silent (likely CORS restriction), synthesize band movement from time-domain peak
    if (sumAll === 0) {
      const time = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(time);
      let peak = 0; for (let i=0;i<time.length;i++){ const v=(time[i]-128)/128; const a=Math.abs(v); if(a>peak) peak=a; }
      const peakDb = peak>0?20*Math.log10(peak): -60;
      // create gentle gradient pattern so bars move
      return centers.map((_,i)=> Math.max(-60, Math.min(0, peakDb + (i/centers.length)*6 )));
    }
    return results;
  }

  function freqLabels(freqs) {
    return freqs.map(f => (f >= 1000 ? `${(f/1000).toFixed(f % 1000 === 0 ? 0 : 1)}k` : `${Math.round(f)}`));
  }

  // Load settings
  chrome.storage.sync.get(
    {
      enabled: true,
      applyAll: true,
      allowlist: [],
      gainValue: 1.5,
      eqMode: 10,
      eqBands: Array(10).fill(0),
      smoothing: 0.5,
    },
    (data) => {
      state.enabled = data.enabled;
      state.applyAll = data.applyAll;
      state.allowlist = Array.isArray(data.allowlist) ? data.allowlist : [];
      state.gainValue = data.gainValue;
      state.eqMode = [10,15,31].includes(data.eqMode) ? data.eqMode : 10;
      state.eqFreqs = FREQ_TABLES[state.eqMode];
      state.smoothing = Math.max(0.2, Math.min(0.9, Number(data.smoothing) || 0.5));
      // Read eqBands from local (high-churn) with sync fallback
      chrome.storage.local.get({ eqBands: null }, (loc) => {
        const eq = Array.isArray(loc.eqBands) ? loc.eqBands : (Array.isArray(data.eqBands) ? data.eqBands : []);
        state.eqBands = Array.isArray(eq) ? eq.slice(0, state.eqFreqs.length) : Array(state.eqFreqs.length).fill(0);
        maybeActivate();
      });
    }
  );

  // Poll DOM changes
  let tries = 0;
  const poll = setInterval(() => {
    if (!state.active) {
      tries += 1;
      maybeActivate();
      if (tries > 60) clearInterval(poll); // extend attempts due to lazy activation
      return;
    }
    if (state.mediaEl && !document.contains(state.mediaEl)) {
      rebuildChain();
    }
  }, 1000);

  // Messaging
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    try {
      if (msg && msg.type === "getMeter") {
        const activeSite = shouldActivateForPage();
        sendResponse({ peakDb: state.lastPeakDb, active: !!state.active, allowed: activeSite });
        return true;
      }
      if (msg && msg.type === "setGain") {
        state.gainValue = Number(msg.value) || 1;
        if (state.nodes) {
          updateOutputGain();
          resumeIfSuspended();
        }
        sendResponse({ ok: true, applied: effectiveGainWithHeadroom() });
        return true;
      }
      if (msg && msg.type === "setEq") {
        const size = state.eqFreqs.length;
        const bands = Array.isArray(msg.bands) ? msg.bands : state.eqBands;
        const normalized = Array(size).fill(0).map((_, i) => Number(bands[i]) || 0);
        state.eqBands = normalized;
        if (state.nodes && state.enabled) {
          applyEqGains(state.nodes.filters, normalized);
          updateOutputGain();
          resumeIfSuspended();
        }
        sendResponse({ ok: true });
        return true;
      }
      if (msg && msg.type === "setEnabled") {
        state.enabled = !!msg.value;
        setEnabledOnNodes(state.enabled);
        resumeIfSuspended();
        sendResponse({ ok: true });
        return true;
      }
      if (msg && msg.type === "setApplyAll") {
        state.applyAll = !!msg.value;
        maybeActivate();
        sendResponse({ ok: true });
        return true;
      }
      if (msg && msg.type === "updateAllowlist") {
        state.allowlist = Array.isArray(msg.allowlist) ? msg.allowlist : [];
        maybeActivate();
        sendResponse({ ok: true });
        return true;
      }
      if (msg && msg.type === "resumeCtx") {
        state.pendingResume = true; // flag that user performed a gesture
        maybeActivate();
        resumeIfSuspended();
        sendResponse({ ok: true });
        return true;
      }
    } catch (e) {}
    return false;
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.eqBands) {
        const size = state.eqFreqs.length;
        const newer = (changes.eqBands.newValue || []).slice(0, size);
        state.eqBands = Array(size).fill(0).map((_,i)=>Number(newer[i])||0);
        if (state.nodes && state.enabled) applyEqGains(state.nodes.filters, state.eqBands);
      }
      return;
    }
    if (area !== "sync") return;
    if (changes.enabled) {
      state.enabled = changes.enabled.newValue;
      setEnabledOnNodes(state.enabled);
    }
    if (changes.applyAll) {
      state.applyAll = changes.applyAll.newValue;
      maybeActivate();
    }
    if (changes.allowlist) {
      state.allowlist = changes.allowlist.newValue || [];
      maybeActivate();
    }
    if (changes.gainValue) {
      state.gainValue = changes.gainValue.newValue;
      if (state.nodes && state.enabled) updateOutputGain();
    }
    if (changes.eqBands) {
      const size = state.eqFreqs.length;
      state.eqBands = (changes.eqBands.newValue || state.eqBands).slice(0, size);
      if (state.nodes && state.enabled) { applyEqGains(state.nodes.filters, state.eqBands); updateOutputGain(); }
    }
    if (changes.eqMode) {
      const m = Number(changes.eqMode.newValue);
      if ([10,15,31].includes(m)) {
        state.eqMode = m;
        state.eqFreqs = FREQ_TABLES[m];
        const newer = Array(state.eqFreqs.length).fill(0);
        for (let i = 0; i < Math.min(state.eqBands.length, newer.length); i++) newer[i] = state.eqBands[i];
        state.eqBands = newer;
        rebuildChain();
      }
    }
    if (changes.smoothing) {
      const v = Math.max(0.2, Math.min(0.9, Number(changes.smoothing.newValue) || 0.5));
      state.smoothing = v;
      if (state.nodes && state.nodes.analyser) state.nodes.analyser.smoothingTimeConstant = v;
    }
  });
})();
