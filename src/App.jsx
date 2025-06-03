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
import About from "./components/Pages/About/About";
import AddEventForm from "./components/Pages/Events/AddEventForm";
import EditEventForm from "./components/Pages/Events/EditEventForm";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
              <Walkthrough />
              <Footer />
            </>
          }
        />
        <Route
          path="/events"
          element={
            <>
              <Header />
              <Events />
              <Footer />
            </>
          }
        />
        <Route path="/events/add" element={<AddEventForm />} />
        <Route path="/events/edit/:eventId" element={<EditEventForm />} />
        <Route
          path="/events/:eventId"
          element={
            <>
              <Header />
              <EventDetails />
              <Footer />
            </>
          }
        />
        <Route path="/taskmanager" element={<TaskManager />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
