import React from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
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
