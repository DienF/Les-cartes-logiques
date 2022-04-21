import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercise = () => {
  let num = useParams().num-1
  const [ex, setEx] = useState();
  useEffect(() => {
    fetch("Ex.json")
    .then(response => response.text())
    .then(data => {
      setEx(JSON.parse(data)[num]);
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
