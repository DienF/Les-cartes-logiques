import React from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <div className="navigation">
      <NavLink exact="true" to="/">
        Home
      </NavLink>
      <NavLink exact="true" to="/About">
        A Propos
      </NavLink>
      <NavLink exact="true" to="/CreateExercice">
        Créer un exercice
      </NavLink>
      <h1>Les Cartes Logiques</h1>
    </div>
  );
};

export default Navigation;
