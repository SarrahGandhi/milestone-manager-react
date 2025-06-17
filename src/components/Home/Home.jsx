import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Dashboard from "../Dashboard/Dashboard";
import Walkthrough from "../Walkthrough/Walkthrough";
import { useAuth } from "../../context/AuthContext";

const features = [
  { label: "Event Organizer", icon: "calendar" },
  { label: "Task Manager", icon: "check" },
  { label: "RSVP Manager", icon: "mail" },
  { label: "Photo Upload", icon: "image" },
  { label: "Pinterest Board", icon: "pin" },
];

const icons = {
  calendar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="99"
      height="81"
      viewBox="0 0 99 81"
      fill="none"
    >
      <path
        d="M33 6.75V20.25M66 6.75V20.25M12.375 33.75H86.625M20.625 13.5H78.375C82.9314 13.5 86.625 16.5221 86.625 20.25V67.5C86.625 71.2279 82.9314 74.25 78.375 74.25H20.625C16.0687 74.25 12.375 71.2279 12.375 67.5V20.25C12.375 16.5221 16.0687 13.5 20.625 13.5Z"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  check: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="83"
      height="81"
      viewBox="0 0 83 81"
      fill="none"
    >
      <path
        d="M72.625 35.4375V64.125C72.625 65.9152 71.8963 67.6321 70.5992 68.898C69.302 70.1638 67.5428 70.875 65.7083 70.875H17.2917C15.4573 70.875 13.698 70.1638 12.4008 68.898C11.1037 67.6321 10.375 65.9152 10.375 64.125V16.875C10.375 15.0848 11.1037 13.3679 12.4008 12.102C13.698 10.8362 15.4573 10.125 17.2917 10.125H60.5208M31.125 37.125L41.5 47.25L76.0833 13.5"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  mail: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="82"
      height="81"
      viewBox="0 0 82 81"
      fill="none"
    >
      <path
        d="M75.1666 23.625L44.4474 42.9536C43.405 43.5517 42.2209 43.8667 41.0154 43.8667C39.8098 43.8667 38.6258 43.5517 37.5833 42.9536L6.83331 23.625M13.6666 13.5H68.3333C72.1073 13.5 75.1666 16.5221 75.1666 20.25V60.75C75.1666 64.4779 72.1073 67.5 68.3333 67.5H13.6666C9.8927 67.5 6.83331 64.4779 6.83331 60.75V20.25C6.83331 16.5221 9.8927 13.5 13.6666 13.5Z"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  image: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="98"
      height="81"
      viewBox="0 0 98 81"
      fill="none"
    >
      <path
        d="M85.75 50.625L73.1488 40.2097C71.6174 38.9443 69.5405 38.2334 67.375 38.2334C65.2095 38.2334 63.1326 38.9443 61.6012 40.2097L24.5 70.875M20.4167 10.125H77.5833C82.0937 10.125 85.75 13.1471 85.75 16.875V64.125C85.75 67.8529 82.0937 70.875 77.5833 70.875H20.4167C15.9063 70.875 12.25 67.8529 12.25 64.125V16.875C12.25 13.1471 15.9063 10.125 20.4167 10.125ZM44.9167 30.375C44.9167 34.1029 41.2603 37.125 36.75 37.125C32.2397 37.125 28.5833 34.1029 28.5833 30.375C28.5833 26.6471 32.2397 23.625 36.75 23.625C41.2603 23.625 44.9167 26.6471 44.9167 30.375Z"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
  pin: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="82"
      height="81"
      viewBox="0 0 82 81"
      fill="none"
    >
      <path
        d="M41 57.375V74.25M30.75 36.315C30.7494 37.5708 30.3941 38.8015 29.7241 39.8687C29.0541 40.936 28.096 41.7974 26.9575 42.3563L20.8759 45.3937C19.7374 45.9526 18.7793 46.814 18.1093 47.8813C17.4394 48.9485 17.084 50.1792 17.0834 51.435V54C17.0834 54.8951 17.4433 55.7536 18.0841 56.3865C18.7248 57.0194 19.5939 57.375 20.5 57.375H61.5C62.4062 57.375 63.2752 57.0194 63.916 56.3865C64.5567 55.7536 64.9167 54.8951 64.9167 54V51.435C64.916 50.1792 64.5607 48.9485 63.8907 47.8813C63.2208 46.814 62.2627 45.9526 61.1242 45.3937L55.0425 42.3563C53.9041 41.7974 52.946 40.936 52.276 39.8687C51.606 38.8015 51.2507 37.5708 51.25 36.315V23.625C51.25 22.7299 51.61 21.8715 52.2508 21.2385C52.8915 20.6056 53.7605 20.25 54.6667 20.25C56.479 20.25 58.2171 19.5388 59.4986 18.273C60.7801 17.0071 61.5 15.2902 61.5 13.5C61.5 11.7098 60.7801 9.9929 59.4986 8.72703C58.2171 7.46116 56.479 6.75 54.6667 6.75H27.3334C25.5211 6.75 23.783 7.46116 22.5015 8.72703C21.22 9.9929 20.5 11.7098 20.5 13.5C20.5 15.2902 21.22 17.0071 22.5015 18.273C23.783 19.5388 25.5211 20.25 27.3334 20.25C28.2395 20.25 29.1086 20.6056 29.7493 21.2385C30.3901 21.8715 30.75 22.7299 30.75 23.625V36.315Z"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  ),
};

const Home = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      <div className="home-root">
        <div className="home-hero">
          <h1>PLAN EVERY WEDDING</h1>
          <h1>MOMENT - TOGETHER</h1>
          <p className="home-sub">
            Manage Events, track tasks, invite guests & more
          </p>
          <div className="home-btns">
            <button className="home-btn primary">Get Started</button>
            <button className="home-btn secondary">Explore Demo</button>
          </div>
        </div>
      </div>
      <div className="home-features">
        {features.map((f) =>
          f.label === "Event Organizer" ? (
            <Link to="/events" style={{ textDecoration: "none" }} key={f.label}>
              <div className="feature-card">
                <div className="feature-icon">{icons[f.icon]}</div>
                <div className="feature-label">{f.label}</div>
              </div>
            </Link>
          ) : f.label === "Task Manager" ? (
            <Link
              to="/taskmanager"
              style={{ textDecoration: "none" }}
              key={f.label}
            >
              <div className="feature-card">
                <div className="feature-icon">{icons[f.icon]}</div>
                <div className="feature-label">{f.label}</div>
              </div>
            </Link>
          ) : f.label === "RSVP Manager" ? (
            <Link
              to="/rsvp-manager"
              style={{ textDecoration: "none" }}
              key={f.label}
            >
              <div className="feature-card">
                <div className="feature-icon">{icons[f.icon]}</div>
                <div className="feature-label">{f.label}</div>
              </div>
            </Link>
          ) : f.label === "Pinterest Board" ? (
            <div className="feature-card" key={f.label}>
              <div className="feature-icon">{icons[f.icon]}</div>
              <div className="feature-label">{f.label}</div>
            </div>
          ) : (
            <div className="feature-card" key={f.label}>
              <div className="feature-icon">{icons[f.icon]}</div>
              <div className="feature-label">{f.label}</div>
            </div>
          )
        )}
      </div>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
      ) : isAuthenticated ? (
        <Dashboard />
      ) : (
       
      )}
    </>
  );
};

export default Home;
