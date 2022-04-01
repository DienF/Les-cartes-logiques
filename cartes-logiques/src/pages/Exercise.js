import React, { useState, useEffect } from "react";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercise = () => {
  const [ex, setEx] = useState();
  useEffect(() => {
    setEx("ex5");
  }, []);

  return (
    <div className="home">
      <Navigation />
      <Game mode={ex} />
    </div>
  );
};

export default Exercise;