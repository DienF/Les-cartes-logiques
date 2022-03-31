import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import CreateExercice from "./pages/CreateExercice";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Exercice from "./pages/Exercice";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/Exercice" exact element={<Exercice/>} />
        <Route path="/About" exact element={<About />} />
        <Route path="/CreateExercice" exact element={<CreateExercice/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
