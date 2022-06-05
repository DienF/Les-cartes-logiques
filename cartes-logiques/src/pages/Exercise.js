import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercise = () => {
  const [num, setNum] = useState();
  let tmp = useParams().num;
  let mode = useParams().mode;
  const [ex, setEx] = useState();
  const navigate = useNavigate();
  
  useEffect(() => {
    let tmpEx = [];
    if (mode === "Play") {
      setNum(tmp);
      fetch("exercices.json")
      .then(response => response.text())
      .then(data => {
        tmpEx = JSON.parse(data);
        if (tmpEx.length >= tmp && tmp !== 0) setEx(tmpEx);
        else                                  navigate("/NotFound");
      });
    }
    else if (mode === "Tutorial") {
      setNum(tmp);
      fetch("tutoriel.json")
      .then(response => response.text())
      .then(data => {
        tmpEx = JSON.parse(data);
        if (tmpEx.length >= tmp && tmp !== 0) setEx(tmpEx);
        else                                  navigate("/NotFound");
      });
    }
    else if (mode === "Create" && tmp === undefined) setEx([[],[]]);
    else                                             navigate("/NotFound");
  }, [tmp, mode]);
  
  return (
    <div className="home">
      <Navigation />
      {ex !== undefined && <Game mode={mode} ex={ex} numero={num-1} />}
    </div>
  );
};

export default Exercise;
