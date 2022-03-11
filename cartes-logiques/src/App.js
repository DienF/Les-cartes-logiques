import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/About";

import Home from "./pages/Home";
import NotFoud from "./pages/NotFoud";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/About" exact element={<About />} />
        <Route path="*" element={<NotFoud />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
