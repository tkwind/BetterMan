const PostSenseEngine = require('./timeline-engine.js');

console.log("Running Timeline Engine Verification Tests...");

// 1. Setup Working Request (GET 200)
const workingReq = {
  method: "GET",
  url: "https://api.example.com/data",
  headers: { "Accept": "application/json" },
  body: "",
  isBrowserMode: false,
  response: {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: "{}"
  }
};

// 2. Setup Failing Request (POST 404)
const failedReq = {
  method: "POST",
  url: "https://api.example.com/data",
  headers: { "Content-Type": "application/json" },
  body: "{\"id\": 1}",
  isBrowserMode: false,
  response: {
    status: 404,
    headers: { "Content-Type": "text/plain" },
    body: "Not Found"
  }
};

// 3. Build Timelines
const workingTimeline = PostSenseEngine.buildBaselineTimeline(workingReq);
const failedTimeline = PostSenseEngine.buildBaselineTimeline(failedReq);

// 4. Compare
const merged = PostSenseEngine.compareTimelines(workingTimeline, failedTimeline);
const reasoning = PostSenseEngine.generateReasoning(merged, workingReq, failedReq);

// 5. Assertions
console.log("--- TEST 1: Method Mismatch Detection ---");
console.log("First Divergence:", reasoning.firstDivergence);
console.log("Explanation:", reasoning.explanation);
console.log("Confidence:", reasoning.confidence);

if (reasoning.firstDivergence === "Method Check" && reasoning.confidence === "high") {
  console.log("✅ PASS: Method mismatch correctly identified.");
} else {
  console.log("❌ FAIL: Method mismatch NOT identified correctly.");
}

// 6. Test 2: CORS/Browser Mode Divergence
const failedBrowserReq = { ...workingReq, isBrowserMode: true, response: { status: 0, headers: {}, body: "" } }; // Network error simulation
const failedBrowserTimeline = PostSenseEngine.buildBaselineTimeline(failedBrowserReq);
const mergedBrowser = PostSenseEngine.compareTimelines(workingTimeline, failedBrowserTimeline);
const reasoningBrowser = PostSenseEngine.generateReasoning(mergedBrowser, workingReq, failedBrowserReq);

console.log("\n--- TEST 2: Simulation Layer Divergence ---");
console.log("First Divergence:", reasoningBrowser.firstDivergence);
console.log("Explanation:", reasoningBrowser.explanation);

if (reasoningBrowser.firstDivergence === "Simulation Layer") {
  console.log("✅ PASS: Browser simulation divergence identified.");
} else {
  console.log("❌ FAIL: Expected 'Simulation Layer' but got '" + reasoningBrowser.firstDivergence + "'");
}

console.log("\nVerification Complete.");
