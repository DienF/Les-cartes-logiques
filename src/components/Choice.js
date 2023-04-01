import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Choice = () => {
  const [ex, setEx] = useState();
  useEffect(() => {
    fetch("exercices.json")
    .then(response => response.text())
    .then(data => {
      setEx(JSON.parse(data));
    });
  }, []);
  
  return (
    <div className="choice">
      <div className="choicebar">
        <ul>
          {ex !== undefined && ex.map((exercice, index) => (
          <li key={index}>
            <NavLink exact="true" to={"/ExercisePlay"+(index+1)}>
              Niveau {index+1}
            </NavLink>
          </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Choice;