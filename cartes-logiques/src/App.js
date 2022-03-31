import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Exercise from "./pages/Exercise";
import CreateExercise from "./pages/CreateExercise";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               exact element={<Home />}          />
        <Route path="/Exercise"       exact element={<Exercise/>}       />
        <Route path="/CreateExercise" exact element={<CreateExercise/>} />
        <Route path="/About"          exact element={<About />}         />
        <Route path="*"                     element={<NotFound />}      />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
