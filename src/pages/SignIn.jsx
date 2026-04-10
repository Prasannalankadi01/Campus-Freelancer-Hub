import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/FireBaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./Auth.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const docRef = doc(db, "users", res.user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const role = docSnap.data().role;
        if (role === "student") {
          navigate("/student-dashboard");
        } else if (role === "client") {
          navigate("/client-dashboard");
        } else {
          navigate("/home");
        }
      } else {
        alert("User role not found!");
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        alert("No account found with this email");
      } else if (error.code === 'auth/wrong-password') {
        alert("Incorrect password");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo">👋</div>
          <h2>Welcome Back</h2>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-field">
            <label>Email</label>
            <div className="field-wrapper">
              <span className="field-icon">📧</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Password</label>
            <div className="field-wrapper">
              <span className="field-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="checkbox-label">
              <input type="checkbox" /> Remember me
            </label>
            <button type="button" className="forgot-link">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login →"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <button type="button" onClick={() => navigate("/")}>
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;