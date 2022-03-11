import React from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <div className="navigation">
      <NavLink exact="true" to="/">
        Home
      </NavLink>
      <NavLink exact="true" to="About">
        About
      </NavLink>
      <h1>Titre</h1>
    </div>
  );
};

export default Navigation;
