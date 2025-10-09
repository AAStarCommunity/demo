import { useState } from 'react'
import './App.css'

function App() {
  const [activeRole, setActiveRole] = useState<'user' | 'operator' | 'developer'>('user')

  return (
    <div className="demo-container">
      <header>
        <h1>SuperPaymaster Demo Playground</h1>
        <p>Interactive showcase for ERC-4337 Account Abstraction</p>
      </header>

      <nav className="role-selector">
        <button 
          className={activeRole === 'user' ? 'active' : ''}
          onClick={() => setActiveRole('user')}
        >
          End User
        </button>
        <button 
          className={activeRole === 'operator' ? 'active' : ''}
          onClick={() => setActiveRole('operator')}
        >
          Operator
        </button>
        <button 
          className={activeRole === 'developer' ? 'active' : ''}
          onClick={() => setActiveRole('developer')}
        >
          Developer
        </button>
      </nav>

      <main>
        {activeRole === 'user' && (
          <div className="demo-panel">
            <h2>End User Demo</h2>
            <p>Experience gasless transactions and account abstraction</p>
            {/* TODO: Implement user demo */}
          </div>
        )}

        {activeRole === 'operator' && (
          <div className="demo-panel">
            <h2>Operator Demo</h2>
            <p>Manage your Paymaster and earn fees</p>
            {/* TODO: Implement operator demo */}
          </div>
        )}

        {activeRole === 'developer' && (
          <div className="demo-panel">
            <h2>Developer Demo</h2>
            <p>Integrate SuperPaymaster into your DApp</p>
            {/* TODO: Implement developer demo */}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
