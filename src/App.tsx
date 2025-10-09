import { useState } from "react";
import "./App.css";
import { EndUserDemo } from "./components/EndUserDemo";
import { OperatorDemo } from "./pages/OperatorDemo";
import { DeveloperDemo } from "./pages/DeveloperDemo";
import { ThemeToggle } from "./components/ThemeToggle";

function App() {
  const [activeRole, setActiveRole] = useState<
    "user" | "operator" | "developer"
  >("user");

  return (
    <div className="demo-container">
      <ThemeToggle />
      <header>
        <h1>SuperPaymaster Demo Playground</h1>
        <p>Interactive showcase for ERC-4337 Account Abstraction</p>
      </header>

      <nav className="role-selector">
        <button
          className={activeRole === "user" ? "active" : ""}
          onClick={() => setActiveRole("user")}
        >
          End User
        </button>
        <button
          className={activeRole === "operator" ? "active" : ""}
          onClick={() => setActiveRole("operator")}
        >
          Operator
        </button>
        <button
          className={activeRole === "developer" ? "active" : ""}
          onClick={() => setActiveRole("developer")}
        >
          Developer
        </button>
      </nav>

      <main>
        {activeRole === "user" && (
          <div className="demo-panel">
            <EndUserDemo />
          </div>
        )}

        {activeRole === "operator" && (
          <div className="demo-panel">
            <OperatorDemo />
          </div>
        )}

        {activeRole === "developer" && (
          <div className="demo-panel">
            <DeveloperDemo />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
