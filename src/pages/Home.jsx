import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  return (
    <div className="home">

     
      {/* HERO SECTION */}
      <div className="hero">

        {/* LEFT */}
        <div className="hero-left">
          <h1>
            Your Campus <br />
            <span>Freelance Marketplace</span>
          </h1>

          <p>
            Find freelance gigs or hire students for your projects easily
          </p>

          <button
            className="browse-btn"
            onClick={() => navigate("/jobs")}
          >
            Browse Jobs
          </button>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
            alt="hero"
          />
        </div>
      </div>

    </div>
  );
};

export default Home;