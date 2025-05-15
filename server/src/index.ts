import { spawn } from "child_process";
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";

// Create Express server
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to run a specific test
const runPlaywrightTest = (
  testName: string
): Promise<{ success: boolean; output: string }> => {
  return new Promise((resolve) => {
    // Command to run a specific test using the grep pattern
    const command = "npx";
    const args = ["playwright", "test", "--grep", testName];

    console.log(`Running test: ${testName}`);

    const test = spawn(command, args, { cwd: process.cwd() });

    let output = "";

    test.stdout.on("data", (data) => {
      output += data.toString();
      console.log(`stdout: ${data}`);
    });

    test.stderr.on("data", (data) => {
      output += data.toString();
      console.error(`stderr: ${data}`);
    });

    test.on("close", (code) => {
      console.log(`Test process exited with code ${code}`);
      resolve({ success: code === 0, output });
    });
  });
};

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Test data endpoint - This could be your Playwright test results
app.get("/api/test-results", (req, res) => {
  const testResults = {
    totalTests: 10,
    passed: 8,
    failed: 1,
    skipped: 1,
    duration: "2m 30s",
    tests: [
      { name: "Homepage loads correctly", status: "passed", duration: "1.2s" },
      { name: "Navigation works", status: "passed", duration: "0.8s" },
      {
        name: "Form submission",
        status: "failed",
        duration: "2.5s",
        error: "Expected form to submit but timed out",
      },
      { name: "API integration", status: "passed", duration: "3.1s" },
      { name: "Mobile responsiveness", status: "skipped", duration: "0s" },
    ],
  };

  res.json(testResults);
});

// New API to trigger a test
app.post("/api/run-test", (req:any, res:any) => {
  const { testName } = req.body;

  if (!testName) {
    return res.status(400).json({ error: "Test name is required" });
  }

  runPlaywrightTest(testName)
    .then((result) => {
      res.json({
        success: result.success,
        message: `Test execution ${
          result.success ? "completed successfully" : "failed"
        }`,
        output: result.output,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: "Failed to run test",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    });
});

// API to get HTML report
app.get("/api/html-report", (req, res) => {
  const reportPath = path.join(
    process.cwd(),
    "playwright-report",
    "index.html"
  );

  if (fs.existsSync(reportPath)) {
    fs.readFile(reportPath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Failed to read report file" });
      }
      res.setHeader("Content-Type", "text/html");
      res.send(data);
    });
  } else {
    res.status(404).json({ error: "Report not found. Run tests first." });
  }
});

// Serve static HTML reports
app.use(
  "/api/report-assets",
  express.static(path.join(process.cwd(), "playwright-report"))
);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
