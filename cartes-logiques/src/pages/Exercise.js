import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercise = () => {
  const [num, setNum] = useState();
  let tmp = useParams().num;
  let mode = useParams().mode;
  const [ex, setEx] = useState();

  useEffect(() => {
    if (mode !== "Create" && mode !== "Tutoriel") {
      setNum(tmp);
      fetch("exercices.json")
      .then(response => response.text())
      .then(data => {
        setEx(JSON.parse(data));
      });
    }
    else if (mode ==="Tutoriel") {
      setNum(tmp);
      fetch("tutoriel.json")
      .then(response => response.text())
      .then(data => {
        setEx(JSON.parse(data));
      });
    }
    else {
      setEx([[], []]);
    }

  }, [tmp, mode]);
  return (
    <div className="home">
      <Navigation />
      {ex !== undefined && <Game mode={mode} ex={ex} numero={num-1} />}
    </div>
  );
};

export default Exercise;
