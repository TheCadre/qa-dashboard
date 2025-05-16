import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

// Define the API base URL
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

// Define types for test results
interface Test {
  name: string;
  status: "passed" | "failed" | "skipped";
  duration: string;
  error?: string;
}

interface TestResults {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: string;
  tests: Test[];
}

// Define test run response type
interface TestRunResponse {
  success: boolean;
  message: string;
  output: string;
}

function App() {
  // State for test results
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  // State for test running
  const [runningTest, setRunningTest] = useState(false);
  // State for test name input
  const [testName, setTestName] = useState("");
  // State for test run output
  const [testOutput, setTestOutput] = useState("");
  // State for showing HTML report in iframe
  const [showReport, setShowReport] = useState(false);
  // State for server status
  const [serverStatus, setServerStatus] = useState<
    "loading" | "online" | "offline"
  >("loading");

  // Fetch test results on component mount
  useEffect(() => {
    fetchServerStatus();
    fetchTestResults();
  }, []);

  // Check server status
  const fetchServerStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      if (response.data.status === "ok") {
        setServerStatus("online");
      }
    } catch (error) {
      console.error("Failed to connect to server:", error);
      setServerStatus("offline");
    }
  };

  // Function to fetch test results
  const fetchTestResults = async () => {
    try {
      const response = await axios.get<TestResults>(
        `${API_BASE_URL}/test-results`
      );
      setTestResults(response.data);
    } catch (error) {
      console.error("Error fetching test results:", error);
    }
  };

  // Function to run a specific test
  const runTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) return;

    setRunningTest(true);
    setTestOutput("");

    try {
      const response = await axios.post<TestRunResponse>(
        `${API_BASE_URL}/run-test`,
        { testName }
      );
      setTestOutput(response.data.output);
      // Refresh test results after running a test
      fetchTestResults();
    } catch (error) {
      console.error("Error running test:", error);
      if (axios.isAxiosError(error) && error.response) {
        setTestOutput(
          `Error: ${error.response.data.message || "Failed to run test"}`
        );
      } else {
        setTestOutput("Error: Could not connect to server");
      }
    } finally {
      setRunningTest(false);
    }
  };

  // Function to show HTML report
  const viewHTMLReport = () => {
    setShowReport(true);
  };

  return (
    <div className="app-container">
      <header>
        <h1>QA Dashboard</h1>
        <div className={`server-status ${serverStatus}`}>
          Server: {serverStatus}
        </div>
      </header>

      <main>
        <section className="test-actions">
          <h2>Run Tests</h2>
          <form onSubmit={runTest}>
            <div className="form-group">
              <label htmlFor="testName">Test Name:</label>
              <input
                type="text"
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name or regex pattern"
                disabled={runningTest}
              />
              <button
                type="submit"
                disabled={runningTest || serverStatus !== "online"}
              >
                {runningTest ? "Running..." : "Run Test"}
              </button>
            </div>
          </form>

          <div className="test-examples">
            <h3>Available Tests:</h3>
            <ul>
              <li onClick={() => setTestName("visit CadreODR website")}>
                visit CadreODR website
              </li>
              <li onClick={() => setTestName("homepage title should exist")}>
                homepage title should exist
              </li>
              <li
                onClick={() =>
                  setTestName("dashboard components load correctly")
                }
              >
                dashboard components load correctly
              </li>
            </ul>
          </div>
        </section>

        <section className="test-results">
          <h2>Test Results</h2>
          {testResults ? (
            <div className="results-summary">
              <div className="summary-item">
                <span className="label">Total:</span>
                <span className="value">{testResults.totalTests}</span>
              </div>
              <div className="summary-item passed">
                <span className="label">Passed:</span>
                <span className="value">{testResults.passed}</span>
              </div>
              <div className="summary-item failed">
                <span className="label">Failed:</span>
                <span className="value">{testResults.failed}</span>
              </div>
              <div className="summary-item skipped">
                <span className="label">Skipped:</span>
                <span className="value">{testResults.skipped}</span>
              </div>
              <div className="summary-item">
                <span className="label">Duration:</span>
                <span className="value">{testResults.duration}</span>
              </div>
            </div>
          ) : (
            <p>No test results available</p>
          )}

          {testResults && (
            <div className="test-details">
              <h3>Test Details</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.tests.map((test, index) => (
                    <tr key={index} className={test.status}>
                      <td>{test.name}</td>
                      <td>{test.status}</td>
                      <td>{test.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="test-output">
          <h2>Test Output</h2>
          <div className="output-container">
            {testOutput ? (
              <pre>{testOutput}</pre>
            ) : (
              <p>No test output available</p>
            )}
          </div>
        </section>

        <section className="report-actions">
          <h2>Test Reports</h2>
          <button onClick={viewHTMLReport} disabled={serverStatus !== "online"}>
            View HTML Report
          </button>

          {showReport && (
            <div className="report-iframe-container">
              <iframe
                src={`${API_BASE_URL}/html-report`}
                title="Playwright HTML Report"
                className="report-iframe"
              ></iframe>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
