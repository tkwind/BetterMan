const args = process.argv.slice(2);

// Check if enough arguments are provided
if (args.length < 2) {
  console.error('Usage: node app.js <METHOD> <URL> [HEADERS_JSON] [BODY_JSON]');
  console.error('Example: node app.js GET https://jsonplaceholder.typicode.com/posts/1');
  console.error('Example: node app.js POST https://jsonplaceholder.typicode.com/posts \'{"Content-Type":"application/json"}\' \'{"title":"test"}\'');
  process.exit(1);
}

const [methodStr, urlStr, headersStr, bodyStr] = args;
const method = methodStr.toUpperCase();

// Parse and validate URL
let url;
try {
  url = new URL(urlStr);
} catch (error) {
  console.error(`Error: Invalid URL '${urlStr}'`);
  process.exit(1);
}

// Parse Optional Headers
let headers = {};
if (headersStr) {
  try {
    headers = JSON.parse(headersStr);
  } catch (error) {
    console.error(`Error: Invalid JSON input for HEADERS`);
    console.error(error.message);
    process.exit(1);
  }
}

// Parse Optional Body
let requestBody = null;
if (bodyStr) {
  try {
    // We parse it just to validate it is valid JSON if the Content-Type is usually JSON,
    // or if we just want to strictly ensure the user passes valid JSON when specified.
    JSON.parse(bodyStr); 
    requestBody = bodyStr; // Pass as string to fetch
  } catch (error) {
    console.error(`Error: Invalid JSON input for BODY`);
    console.error(error.message);
    process.exit(1);
  }
}

async function sendRequest() {
  const options = {
    method,
    headers,
  };

  if (method !== 'GET' && method !== 'HEAD' && requestBody) {
    options.body = requestBody;
  }

  try {
    const response = await fetch(url, options);
    
    console.log(`\n=== STATUS ===`);
    console.log(`${response.status} ${response.statusText}`);
    
    console.log(`\n=== HEADERS ===`);
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }

    console.log(`\n=== BODY ===`);
    const text = await response.text();
    
    // Attempt to pretty-print JSON if possible
    try {
      if (text) {
          const jsonBody = JSON.parse(text);
          console.log(JSON.stringify(jsonBody, null, 2));
      } else {
          console.log('(empty body)');
      }
    } catch {
      // If it's not JSON, print raw text
      console.log(text);
    }
  } catch (error) {
    console.error(`\n=== NETWORK/FETCH ERROR ===`);
    console.error(error.message);
    process.exit(1);
  }
}

sendRequest();
