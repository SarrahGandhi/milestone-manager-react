import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import Walkthrough from "./components/Walkthrough/Walkthrough";
import Events from "./components/Pages/Events/Events";
import EventDetails from "./components/Pages/Events/EventDetails";
import TaskManager from "./components/Pages/TaskManager";
import Guests from "./components/Pages/Guests";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Walkthrough />
            </>
          }
        />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/taskmanager" element={<TaskManager />} />
        <Route path="/guests" element={<Guests />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
