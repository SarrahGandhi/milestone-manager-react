import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faPlus,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faPalette,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

// Add icons to the library
library.add(
  faPlus,
  faCalendarAlt,
  faClock,
  faMapMarkerAlt,
  faPalette,
  faEdit,
  faTrash
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
