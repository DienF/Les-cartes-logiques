import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const getPage = (location) => {
  console.log(location);
  switch (location) {
    case "/":
      return "Accueil";
    case "/About":
      return "A propos";
    default:
      return "";
  }
}

const Navigation = () => {
  const [ex, setEx] = useState();
  useEffect(() => {
    fetch("exercices.json")
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
      {window.location.pathname.substring(9,13) === ("Play") && 
      <div id="titrePage">
        {"Exercice "+window.location.pathname.substring(13,18)}
      </div>}
      {window.location.pathname === ("/") && 
      <div id="titrePage">
        {"Accueil"}
      </div>}
      {window.location.pathname === ("/About") && 
      <div id="titrePage">
        {"A propos"}
      </div>}
      {window.location.pathname.substring(9,15) === ("Create") && 
      <div id="titrePage">
        {"Créer un exercice"}
      </div>}
      {window.location.pathname.substring(9,17) === ("Tutoriel") && 
      <div id="titrePage">
        {"Tutoriel"}
    </div>}
    </div>
  );
};

export default Navigation;
