document.addEventListener('DOMContentLoaded', () => {
  const methodSelect = document.getElementById('method');
  const urlInput = document.getElementById('url');
  const headersContainer = document.getElementById('headers-container');
  const addHeaderBtn = document.getElementById('add-header-btn');
  const bodyTextarea = document.getElementById('body');
  const sendBtn = document.getElementById('send-btn');
  const modeToggle = document.getElementById('mode-toggle');
  const modeLabel = document.getElementById('mode-label');
  
  const resStatus = document.getElementById('res-status');
  const resHeaders = document.getElementById('res-headers');
  const resBody = document.getElementById('res-body');
  const issuesList = document.getElementById('issues-list');
  const timelineTab = document.getElementById('tab-timeline');
  const timelineOutput = document.getElementById('timeline-output');
  const timelineReasoning = document.getElementById('timeline-reasoning');

  let isBrowserMode = false;
  let requestHistory = []; 

  // Toggle Mode
  modeToggle.addEventListener('change', (e) => {
    isBrowserMode = e.target.checked;
    modeLabel.textContent = isBrowserMode ? 'Browser Mode' : 'PostSense Mode';
  });

  // Dynamic Headers
  addHeaderBtn.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'header-row';
    row.innerHTML = `
      <input type="text" class="header-key" placeholder="Key (e.g. Content-Type)">
      <input type="text" class="header-value" placeholder="Value (e.g. application/json)">
      <button class="remove-header-btn">X</button>
    `;
    headersContainer.appendChild(row);
  });

  headersContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-header-btn')) {
      e.target.parentElement.remove();
    }
  });

  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  document.querySelector('.tab-btn[data-tab="tab-compare"]').addEventListener('click', () => {
    renderComparison();
  });

  function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
  }

  function clearIssues() {
    issuesList.innerHTML = '';
    timelineOutput.innerHTML = '';
    timelineReasoning.innerHTML = '';
    document.getElementById('issue-count-badge').textContent = '0';
  }

  function analyzeResponse(response, headersObj) {
    const responseIssues = [];
    const currentMethod = methodSelect.value;
    const currentUrl = urlInput.value.trim();
    const headers = getHeaders();

    const currentRequestData = {
      method: currentMethod,
      url: currentUrl,
      headers: headers,
      body: bodyTextarea.value.trim(),
      isBrowserMode,
      response: {
        status: response.status,
        headers: headersObj,
        body: resBody.textContent
      }
    };

    const failedTimeline = PostSenseEngine.buildBaselineTimeline(currentRequestData);
    const historyMatches = requestHistory.filter(h => h.url === currentUrl);
    const successfulAlternative = historyMatches.find(h => h.status < 300);

    let inferredExplanation = null;
    if (successfulAlternative) {
      const workingRequestData = {
        method: successfulAlternative.method,
        url: successfulAlternative.url,
        headers: successfulAlternative.headers || {},
        body: successfulAlternative.body || "",
        isBrowserMode: successfulAlternative.isBrowserMode,
        response: {
          status: successfulAlternative.status,
          headers: successfulAlternative.resHeaders || {},
          body: successfulAlternative.resBody || ""
        }
      };

      const workingTimeline = PostSenseEngine.buildBaselineTimeline(workingRequestData);
      const mergedTimeline = PostSenseEngine.compareTimelines(workingTimeline, failedTimeline);
      const reasoning = PostSenseEngine.generateReasoning(mergedTimeline, workingRequestData, currentRequestData);
      inferredExplanation = reasoning.explanation;

      renderTimeline(mergedTimeline, reasoning);
    } else {
      // Fallback reasoning for No Baseline
      const reasoning = PostSenseEngine.generateReasoning(failedTimeline, null, currentRequestData);
      renderTimeline(failedTimeline, reasoning);
    }

    // Status Mapping
    if (response.status === 404) {
      responseIssues.push({ problem: 'Endpoint Not Found', why: 'Server responded 404.', severity: 'error' });
    } else if (response.status === 405) {
      responseIssues.push({ problem: 'Method Mismatch', why: `${currentMethod} not supported.`, severity: 'error' });
    } else if (response.status === 0) {
      responseIssues.push({ problem: 'Network Failure', why: 'Could not reach server.', severity: 'error' });
    }

    renderAllIssues(responseIssues, inferredExplanation, successfulAlternative);
    updateBaselineSelector();
  }

  function renderTimeline(timeline, reasoning) {
    timelineOutput.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'timeline-container';

    const breakpointIndex = timeline.findIndex(s => s.isFirstDivergence || s.isFirstFailure);
    const breakpoint = breakpointIndex !== -1 ? timeline[breakpointIndex] : null;

    if (breakpoint) {
      const card = document.createElement('div');
      card.className = 'breakpoint-card';
      const isFallback = reasoning?.mode === 'NO_BASELINE';
      const confClass = (reasoning?.confidence || 'low').toLowerCase();

      card.innerHTML = `
        <div class="breakpoint-header">
           <span>DEBUGGER: ${breakpoint.step}</span>
           <span class="confidence-tag tag-${confClass}">${reasoning?.confidence || 'Low'} Confidence</span>
        </div>
        <div class="breakpoint-body">
          ${isFallback ? `
            <div class="fallback-banner">MODE: No baseline observed</div>
            <div class="observed-fact"><strong>Observed Failure:</strong> Status ${breakpoint.code || 'Error'}</div>
          ` : `
            <div class="comparison-grid">
              <div class="comp-box"><div class="comp-label">Expected</div><div class="comp-value expected">${reasoning?.expected || 'Success'}</div></div>
              <div class="comp-box"><div class="comp-label">Actual</div><div class="comp-value actual">${reasoning?.actual || 'Failure'}</div></div>
            </div>
          `}
          
          <div class="breakpoint-impact">
            <strong>${isFallback ? 'Inference (Heuristic):' : 'Impact:'}</strong> 
            ${isFallback ? (reasoning?.explanation || 'Showing best-guess diagnosis.') : reasoning?.impact}
          </div>

          <div class="breakpoint-action">
            <strong>Action:</strong> ${reasoning?.action || 'Review request configuration.'}
            <div style="display: flex; gap: 8px; margin-top: 8px;">
               ${isFallback ? `
                 <button class="toggle-details-btn probe-btn" id="bp-probe-btn">Auto Test Endpoint</button>
                 <button class="toggle-details-btn" id="bp-doc-btn">Check Documentation</button>
               ` : `
                 <button class="toggle-details-btn" id="bp-compare-btn">Compare Details</button>
               `}
            </div>
          </div>
        </div>
      `;
      if (isFallback) {
        card.querySelector('#bp-probe-btn').onclick = () => autoProbeEndpoint(urlInput.value.trim());
        card.querySelector('#bp-doc-btn').onclick = () => window.open('https://google.com/search?q=' + encodeURIComponent(urlInput.value.trim() + ' API documentation'), '_blank');
      } else {
        card.querySelector('#bp-compare-btn').onclick = () => { switchTab('tab-compare'); renderComparison(); };
      }
      container.appendChild(card);
    }

    timeline.forEach(step => {
       if (step !== breakpoint) container.appendChild(createTimelineEntry(step));
    });

    timelineOutput.appendChild(container);
  }

  function createTimelineEntry(step) {
    const entry = document.createElement('div');
    entry.className = `timeline-entry status-${step.status}`;
    entry.innerHTML = `<div class="timeline-marker"></div><div class="timeline-content"><div class="timeline-header"><span>${step.icon || '•'}</span><span>${step.step}</span></div></div>`;
    return entry;
  }

  function renderAllIssues(responseIssues, inferredCause, baseline) {
    responseIssues.forEach(issue => logIssue(issue, baseline));
    
    if (issuesList.children.length === 0) {
       logIssue({ problem: 'No issues detected', severity: 'success', why: 'Request executed cleanly.' });
    }

    const cards = issuesList.querySelectorAll('.issue-card');
    cards.forEach((card, idx) => {
      if (idx === 0 && inferredCause) {
        const div = document.createElement('div');
        div.className = 'issue-fix';
        div.style.marginTop = '8px';
        div.innerHTML = `<strong>📡 PostSense Inference:</strong> ${inferredCause}`;
        card.appendChild(div);
      }
    });

    updateIssuesBadge();
  }

  function logIssue(issue, baseline) {
    const li = document.createElement('li');
    li.className = `issue-card severity-${issue.severity || 'info'}`;
    
    let html = `
      <div class="issue-title">${issue.problem}</div>
      <div class="issue-why">${issue.why || ''}</div>
    `;

    if (baseline && issue.severity !== 'success') {
      html += `<button class="quick-fix-btn retry-universal-btn">Retry with Baseline</button>`;
    }

    li.innerHTML = html;
    const btn = li.querySelector('.retry-universal-btn');
    if (btn) btn.onclick = () => restoreFromBaseline(baseline);

    issuesList.appendChild(li);
  }

  function updateIssuesBadge() {
    const count = issuesList.querySelectorAll('.issue-card:not(.severity-success)').length;
    document.getElementById('issue-count-badge').textContent = count;
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  async function autoProbeEndpoint(url) {
    if (!url) return;
    const originalMethod = methodSelect.value;
    const originalBody = bodyTextarea.value;
    const currentHeaders = getHeaders();

    // Build ordered probe sequence (max 6)
    const probeSequence = [
      { method: 'GET',     body: null,   headers: {},             label: 'GET (no headers)'       },
      { method: 'GET',     body: null,   headers: currentHeaders, label: 'GET (with headers)'     },
      { method: 'HEAD',    body: null,   headers: currentHeaders, label: 'HEAD'                   },
      { method: 'OPTIONS', body: null,   headers: currentHeaders, label: 'OPTIONS'                },
    ];
    if (originalMethod === 'POST') {
      probeSequence.push({ method: 'POST', body: null, headers: currentHeaders, label: 'POST (no body)' });
      probeSequence.push({ method: 'POST', body: '{}', headers: { ...currentHeaders, 'Content-Type': 'application/json' }, label: 'POST (body: {})' });
    }

    // Render live status
    switchTab('tab-timeline');
    timelineOutput.innerHTML = '<div class="probe-summary-panel"><div class="probe-summary-title">Probing endpoint…</div><ul class="probe-rows" id="probe-rows-live"></ul></div>';
    const liveList = document.getElementById('probe-rows-live');

    const results = [];
    let foundBaseline = null;
    let allowedMethods = null;

    for (const probe of probeSequence) {
      if (results.length >= 6) break;

      const rowEl = document.createElement('li');
      rowEl.className = 'probe-row pending';
      rowEl.innerHTML = `<span class="probe-icon">⏳</span><span class="probe-label">${probe.label}</span><span class="probe-status">Testing…</span>`;
      liveList.appendChild(rowEl);

      try {
        const opts = { method: probe.method, headers: probe.headers };
        if (probe.body) opts.body = probe.body;
        const response = await fetch(url, opts);
        const status = response.status;

        if (probe.method === 'OPTIONS') {
          const allow = response.headers.get('Allow') || response.headers.get('allow');
          if (allow) allowedMethods = allow;
        }

        const isSuccess = status >= 200 && status < 300;
        if (isSuccess && !foundBaseline) {
          foundBaseline = { method: probe.method, url, headers: probe.headers, body: probe.body || '', isBrowserMode, status, timestamp: Date.now(), baselineSource: 'auto-probing' };
        }

        rowEl.className = `probe-row ${isSuccess ? 'success' : 'fail'}`;
        rowEl.innerHTML = `<span class="probe-icon">${isSuccess ? '✓' : '✗'}</span><span class="probe-label">${probe.label}</span><span class="probe-status">HTTP ${status}</span>`;
        results.push({ label: probe.label, method: probe.method, status, success: isSuccess });

        if (isSuccess) break;
        if (status === 401 || status === 403) {
          rowEl.innerHTML = `<span class="probe-icon">🔐</span><span class="probe-label">${probe.label}</span><span class="probe-status">HTTP ${status} — Auth Required, stopping</span>`;
          results[results.length - 1].note = 'auth-blocked';
          break;
        }
      } catch (e) {
        rowEl.className = 'probe-row fail';
        rowEl.innerHTML = `<span class="probe-icon">✗</span><span class="probe-label">${probe.label}</span><span class="probe-status">Network Error</span>`;
        results.push({ label: probe.label, method: probe.method, status: 0, success: false });
      }

      await sleep(400);
    }

    // Classify
    let conclusion, confidence;
    if (foundBaseline) {
      conclusion = `Working configuration discovered. <strong>${foundBaseline.method}</strong> returned HTTP ${foundBaseline.status}.`;
      confidence = 'High';
      requestHistory.push(foundBaseline);
      updateBaselineSelector();
    } else if (allowedMethods) {
      conclusion = `Endpoint supports: <strong>${allowedMethods}</strong>. Current method (${originalMethod}) may be invalid.`;
      confidence = 'Medium';
    } else {
      const authBlocked = results.some(r => r.note === 'auth-blocked');
      conclusion = authBlocked ? 'Endpoint requires authentication. Probing stopped early.' : 'No valid configuration found. Endpoint may require auth or a specific payload.';
      confidence = 'Low';
    }

    renderProbeSummary(results, { conclusion, confidence, foundBaseline });
    methodSelect.value = originalMethod;
    bodyTextarea.value = originalBody;
  }

  function renderProbeSummary(results, { conclusion, confidence, foundBaseline }) {
    const confClass = confidence.toLowerCase();
    const rowsHtml = results.map(r => `
      <li class="probe-row ${r.success ? 'success' : 'fail'}">
        <span class="probe-icon">${r.success ? '✓' : r.note === 'auth-blocked' ? '🔐' : '✗'}</span>
        <span class="probe-label">${r.label}</span>
        <span class="probe-status">HTTP ${r.status || 'Error'}</span>
      </li>
    `).join('');

    timelineOutput.innerHTML = `
      <div class="probe-summary-panel">
        <div class="probe-summary-title">
          Auto-Probe Summary
          <span class="confidence-tag tag-${confClass}">${confidence} Confidence</span>
        </div>
        <ul class="probe-rows">${rowsHtml}</ul>
        <div class="probe-conclusion">${conclusion}</div>
        ${foundBaseline ? `<div style="margin-top:12px"><button class="toggle-details-btn probe-btn" id="apply-probe-btn">Apply Working Configuration</button></div>` : ''}
      </div>
    `;
    if (foundBaseline) {
      document.getElementById('apply-probe-btn').onclick = () => restoreFromBaseline(foundBaseline);
    }
  }

  function restoreFromBaseline(b) {
    if (!b) return;
    methodSelect.value = b.method;
    urlInput.value = b.url;
    bodyTextarea.value = b.body || '';
    isBrowserMode = b.isBrowserMode || false;
    modeToggle.checked = isBrowserMode;
    modeLabel.textContent = isBrowserMode ? 'Browser Mode' : 'PostSense Mode';

    headersContainer.innerHTML = '';
    Object.entries(b.headers || {}).forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'header-row';
      row.innerHTML = `<input type="text" class="header-key" value="${k}"><input type="text" class="header-value" value="${v}"><button class="remove-header-btn">X</button>`;
      headersContainer.appendChild(row);
    });

    setTimeout(() => {
      switchTab('tab-response');
      sendBtn.click();
    }, 100);
  }

  function getHeaders() {
    const headers = {};
    headersContainer.querySelectorAll('.header-row').forEach(row => {
      const k = row.querySelector('.header-key').value.trim();
      const v = row.querySelector('.header-value').value.trim();
      if (k) headers[k] = v;
    });
    return headers;
  }

  function formatOutput(text) {
    try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
  }

  sendBtn.addEventListener('click', async () => {
    clearIssues();
    const method = methodSelect.value;
    const url = urlInput.value.trim();
    if (!url) {
      switchTab('tab-issues');
      logIssue({ problem: 'URL Required', why: 'Enter a target endpoint before sending.', severity: 'error' });
      updateIssuesBadge();
      return;
    }

    resStatus.textContent = 'Fetching...';
    try {
      const options = { method, headers: getHeaders() };
      const body = bodyTextarea.value.trim();
      if (body && method !== 'GET') options.body = body;

      const response = await fetch(url, options);
      const text = await response.text();
      resStatus.textContent = `${response.status} ${response.statusText}`;
      resBody.textContent = formatOutput(text);

      const resHeadersObj = {};
      response.headers.forEach((v, k) => resHeadersObj[k] = v);
      resHeaders.textContent = JSON.stringify(resHeadersObj, null, 2);

      analyzeResponse(response, resHeadersObj);
      
      requestHistory.push({ method, url, headers: options.headers, body, isBrowserMode, status: response.status, timestamp: Date.now() });
    } catch (e) {
      resStatus.textContent = 'Network Error';
      resBody.textContent = e.toString();
      analyzeResponse({ status: 0 }, {});
      requestHistory.push({ method, url, headers: getHeaders(), body: bodyTextarea.value.trim(), isBrowserMode, status: 0, timestamp: Date.now() });
    }
  });

  // Comparison Logic
  const baselineSelector = document.getElementById('baseline-selector');
  const retryBaselineBtn = document.getElementById('retry-baseline-btn');
  const compareOutput = document.getElementById('compare-output');

  function updateBaselineSelector() {
    const currentUrl = urlInput.value.trim();
    const successes = requestHistory.filter(h => h.url === currentUrl && h.status < 300);
    if (baselineSelector) {
      baselineSelector.innerHTML = '<option value="">Last Successful Request</option>';
      successes.reverse().forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.timestamp;
        opt.textContent = `${new Date(s.timestamp).toLocaleTimeString()} - ${s.method}`;
        baselineSelector.appendChild(opt);
      });
    }
  }

  function getActiveBaseline() {
    const ts = baselineSelector.value;
    if (ts) return requestHistory.find(h => h.timestamp == ts);
    const url = urlInput.value.trim();
    const successes = requestHistory.filter(h => h.url === url && h.status < 300);
    // Prefer a GET baseline — it's the most informative for diagnostics
    return successes.find(h => h.method === 'GET') || successes[successes.length - 1];
  }

  function renderComparison() {
    const b = getActiveBaseline();
    if (!b) { compareOutput.innerHTML = '<div class="empty-compare-state">No baseline found.</div>'; return; }
    
    const curr = { method: methodSelect.value, body: bodyTextarea.value.trim() };
    compareOutput.innerHTML = `
      <div class="diff-grid">
        <div class="diff-row"><div class="diff-row-header">Method</div><div class="diff-row-body"><div class="diff-col">${b.method}</div><div class="diff-col">${curr.method}</div></div></div>
        <div class="diff-row"><div class="diff-row-header">Body</div><div class="diff-row-body"><div class="diff-col">${b.body || '(none)'}</div><div class="diff-col">${curr.body || '(none)'}</div></div></div>
      </div>
    `;
  }

  if (retryBaselineBtn) retryBaselineBtn.onclick = () => restoreFromBaseline(getActiveBaseline());

});
