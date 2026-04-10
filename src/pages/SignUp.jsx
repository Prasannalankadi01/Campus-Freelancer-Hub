import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/FireBaseConfig";
import { doc, setDoc } from "firebase/firestore";
import "./Auth.css";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
    width: "0%"
  });

  const navigate = useNavigate();

  // Password strength checker
  const checkPasswordStrength = (pass) => {
    let score = 0;
    
    if (!pass) {
      return { score: 0, message: "", color: "#e2e8f0", width: "0%" };
    }

    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    let message = "";
    let color = "";
    let width = `${(score / 5) * 100}%`;
    
    if (score <= 2) {
      message = "Weak";
      color = "#ef4444";
    } else if (score <= 3) {
      message = "Fair";
      color = "#f59e0b";
    } else if (score <= 4) {
      message = "Good";
      color = "#3b82f6";
    } else {
      message = "Strong";
      color = "#10b981";
    }

    return { score, message, color, width };
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (passwordStrength.score < 3) {
      alert("Please use a stronger password");
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", res.user.uid), {
        email: email,
        role: role,
        createdAt: new Date()
      });
      await signOut(auth);
      alert(`Account created as ${role} successfully!`);
      navigate("/signin");
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert("Email already in use. Please try another email.");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo">🚀</div>
          <h2>Create Account</h2>
          <p>Join Campus Freelance Hub</p>
        </div>

        <form onSubmit={handleSignup}>
          {/* Email */}
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

          {/* Role Selection */}
          <div className="form-field">
            <label>Register as</label>
            <div className="role-group">
              <button
                type="button"
                className={`role-option ${role === "student" ? "active" : ""}`}
                onClick={() => setRole("student")}
              >
                <span>👨‍🎓</span>
                Student
              </button>
              <button
                type="button"
                className={`role-option ${role === "client" ? "active" : ""}`}
                onClick={() => setRole("client")}
              >
                <span>💼</span>
                Client
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label>Password</label>
            <div className="field-wrapper">
              <span className="field-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsTypingPassword(true)}
                onBlur={() => setIsTypingPassword(false)}
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
            
            {/* Password Strength Bar */}
            {password && (
              <div className="strength-container">
                <div className="strength-bar-bg">
                  <div 
                    className="strength-bar-fill"
                    style={{ width: passwordStrength.width, background: passwordStrength.color }}
                  />
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.message}
                </span>
              </div>
            )}
            
            {/* Password Instructions - Only show while typing */}
            {isTypingPassword && password && (
              <div className="password-hints">
                <div className={`hint-item ${password.length >= 8 ? "met" : ""}`}>
                  {password.length >= 8 ? "✓" : "○"} Min. 8 characters
                </div>
                <div className={`hint-item ${/[a-z]/.test(password) ? "met" : ""}`}>
                  {/[a-z]/.test(password) ? "✓" : "○"} Lowercase letter
                </div>
                <div className={`hint-item ${/[A-Z]/.test(password) ? "met" : ""}`}>
                  {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase letter
                </div>
                <div className={`hint-item ${/[0-9]/.test(password) ? "met" : ""}`}>
                  {/[0-9]/.test(password) ? "✓" : "○"} Number
                </div>
                <div className={`hint-item ${/[!@#$%^&*]/.test(password) ? "met" : ""}`}>
                  {/[!@#$%^&*]/.test(password) ? "✓" : "○"} Special character
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-field">
            <label>Confirm Password</label>
            <div className="field-wrapper">
              <span className="field-icon">🔐</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <div className="field-error">Passwords do not match</div>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <div className="field-success">✓ Passwords match</div>
            )}
          </div>

          <button type="submit" className="submit-btn">
            Create Account →
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <button type="button" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;