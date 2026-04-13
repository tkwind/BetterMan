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

  let isBrowserMode = false;

  // Toggle Mode
  modeToggle.addEventListener('change', (e) => {
    isBrowserMode = e.target.checked;
    modeLabel.textContent = isBrowserMode ? 'Browser Mode' : 'Postman Mode';
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

  function logIssue(msg) {
    const li = document.createElement('li');
    li.textContent = msg;
    issuesList.appendChild(li);
  }

  function clearIssues() {
    issuesList.innerHTML = '';
  }

  // Build Headers Object
  function getHeaders() {
    const headers = {};
    const rows = headersContainer.querySelectorAll('.header-row');
    rows.forEach(row => {
      const key = row.querySelector('.header-key').value.trim();
      const val = row.querySelector('.header-value').value.trim();
      if (key) {
        // Browser Mode Restrictions
        if (isBrowserMode) {
          const forbiddenHeaders = ['origin', 'accept-charset', 'accept-encoding', 'connection', 'content-length', 'cookie', 'host', 'referer'];
          if (forbiddenHeaders.includes(key.toLowerCase())) {
            logIssue(`Blocked unsafe header in Browser Mode: ${key}`);
            return; // Skip adding this header
          }
        }
        headers[key] = val;
      }
    });

    if (isBrowserMode && !headers['Origin'] && !headers['origin']) {
        headers['Origin'] = window.location.origin || 'http://localhost';
        logIssue('Injected Origin header for Browser Mode simulation.');
    }

    return headers;
  }

  // Format Text
  function formatOutput(text) {
    try {
      if (!text) return '(empty response body)';
      const json = JSON.parse(text);
      return JSON.stringify(json, null, 2);
    } catch {
      return text; // Return raw if not JSON
    }
  }

  // Send Request
  sendBtn.addEventListener('click', async () => {
    clearIssues();
    const method = methodSelect.value;
    let url = urlInput.value.trim();

    if (!url) {
      logIssue('URL cannot be empty');
      return;
    }

    // Attempt to normalize URL if scheme is missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }

    let bodyData = bodyTextarea.value.trim();
    if (bodyData && (method === 'GET' || method === 'HEAD')) {
      logIssue('GET/HEAD requests cannot have a body. Body ignored.');
      bodyData = null;
    }

    const headers = getHeaders();
    const options = {
      method,
      headers
    };

    if (bodyData) {
      options.body = bodyData;
    }

    resStatus.textContent = 'Fetching...';
    resHeaders.textContent = '';
    resBody.textContent = '';

    try {
      const response = await fetch(url, options);
      
      resStatus.textContent = `${response.status} ${response.statusText}`;

      // Extract Headers
      const resHeadersObj = {};
      response.headers.forEach((val, key) => {
        resHeadersObj[key] = val;
      });
      resHeaders.textContent = Object.keys(resHeadersObj).length 
        ? JSON.stringify(resHeadersObj, null, 2)
        : '(no headers)';

      // Extract Body
      const text = await response.text();
      resBody.textContent = formatOutput(text);

    } catch (error) {
      resStatus.textContent = 'Network Error';
      resBody.textContent = error.toString();
      logIssue(`Fetch failed: ${error.message}`);
    }
  });

});
