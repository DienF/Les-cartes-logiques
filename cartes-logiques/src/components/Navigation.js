import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const [ex, setEx] = useState();
  useEffect(() => {
    fetch("Ex.json")
    .then(response => response.text())
    .then(data => {
      setEx(JSON.parse(data));
    });
  }, []);

  return (
    <div className="navigation">
        <ul className="navbar">
          <li>
          <a href="#">Menu</a>
            <ul>
              <li>
                <NavLink exact="true" to="/">
                  Accueil
                </NavLink>
              </li>
              <li>
                <NavLink exact="true" to="/ExerciseCreate1">
                  Créer un exercice
                </NavLink>
              </li>
              <li className="choose">
                <NavLink exact="true" to="/">
                  Choisir un exercice
                </NavLink>
                <ul>
                {ex !== undefined && ex.map((exercice, index) => (
                  <li className="exo" key={index}>
                    <NavLink exact="true" to={"/ExercisePlay"+(index+1)}>
                      Exercice {index+1}
                    </NavLink>
                  </li>
                  ))}
                </ul>
                
              </li>
              <li>
                <NavLink exact="true" to="/ExerciseTutoriel1">
                  Tutoriel
                </NavLink>
              </li>
              <li>
                <NavLink exact="true" to="/About">
                  À propos
                </NavLink>
              </li>
            </ul>
          </li>
      </ul>
      <h1>Les Cartes Logiques</h1>
    </div>
    
  );
};

export default Navigation;
