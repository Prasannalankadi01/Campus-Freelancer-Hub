import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/FireBaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./PostJob.css";

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    price: "",
    category: "development",
    status: "open",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "development", label: "💻 Development", icon: "💻" },
    { value: "design", label: "🎨 Design", icon: "🎨" },
    { value: "writing", label: "✍️ Writing", icon: "✍️" },
    { value: "marketing", label: "📈 Marketing", icon: "📈" },
    { value: "other", label: "💼 Other", icon: "💼" },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title.trim()) {
      setError("Please enter a job title");
      return;
    }
    if (!formData.desc.trim()) {
      setError("Please enter a job description");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        ...formData,
        price: Number(formData.price),
        createdBy: user.uid,
        clientEmail: user.email,
        createdAt: serverTimestamp(),
        bidsCount: 0,
      };

      await addDoc(collection(db, "jobs"), jobData);
      alert("Job posted successfully!");
      navigate("/client-dashboard");
    } catch (error) {
      console.error("Error posting job:", error);
      setError("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      <div className="post-job-content">
        <div className="post-job-header">
          <h1>Post a New Job</h1>
          <p>Find the best talent for your project</p>
        </div>

        <form onSubmit={handleSubmit} className="post-job-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Need a React Developer for E-commerce Website"
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <div className="category-selector">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${formData.category === cat.value ? "active" : ""}`}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Budget (₹) *</label>
            <div className="budget-input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter your budget"
                min="1"
                required
              />
            </div>
            <small>Students will bid within this budget range</small>
          </div>

          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Describe your project requirements, skills needed, deadline, etc."
              rows="6"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/client-dashboard")} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Posting..." : "Post Job →"}
            </button>
          </div>
        </form>

        <div className="post-job-tips">
          <h4>💡 Tips for posting a successful job:</h4>
          <ul>
            <li>Be specific about your requirements</li>
            <li>Set a realistic budget based on project complexity</li>
            <li>Mention any deadlines or important milestones</li>
            <li>Add relevant skills to attract the right talent</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostJob;