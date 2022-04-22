import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const Exercise = () => {
  const [num, setNum] = useState();
  let tmp = useParams().num;
  let mode = "play";
  if(tmp === "Create"){
    tmp = "create";
  }

  /*
            {ex !== undefined && ex.map((exercice , index) => (
            <option key={index} value={index} onChange={changeExo}>Exercice {index+1}</option>
          ))}
  */
  const [ex, setEx] = useState();

  useEffect(() => {
    setNum(tmp);
    fetch("Ex.json")
    .then(response => response.text())
    .then(data => {
      setEx(JSON.parse(data));
    });
  }, [tmp]);

  return (
    <div className="home">
      <Navigation />
      {ex !== undefined && <Game mode={mode} ex={ex[num-1]} nbExo={ex} />}
    </div>
  );
};

export default Exercise;
