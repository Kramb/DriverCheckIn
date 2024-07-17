import LoginForm from "./components/LoginForm";
import "./styles.scss";

function App() {
  return (
    <div className="app">
      <div className="app-content">
          <div className="greeting-container">
            <h1>metro</h1>
            <h3>Driver Check-In</h3>
          </div>
          <div className="login-container">
            <LoginForm />
          </div>
      </div>
    </div>
  );
}

export default App;
