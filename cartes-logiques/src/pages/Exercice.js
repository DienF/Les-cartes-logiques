import React, { useState, useEffect } from "react";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercice = () => {
  const [ex, setEx] = useState();
  useEffect(() => {
    setEx("ex1");
  }, []);

  return (
    <div className="home">
      <Navigation />
      <Game mode={ex} />
    </div>
  );
};

export default Exercice;