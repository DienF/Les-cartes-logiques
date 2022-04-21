import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercise = () => {
  let location = useLocation();
  const [ex, setEx] = useState();
  useEffect(() => {
    fetch("Ex.json")
    .then(response => response.text())
    .then(data => {
      setEx(JSON.parse(data)[0]);
    });
  }, []);

  return (
    <div className="home">
      <Navigation />
      <Game mode="play" ex={ex} />
    </div>
  );
};

export default Exercise;
