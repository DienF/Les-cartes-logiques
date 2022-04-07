import React from "react";
import { NavLink } from "react-router-dom";

const Choice = () => {
  return (
    <div className="choice">
      <div className="choicebar">
        <ul>
          <li>
            <NavLink exact="true" to="/Exercise">
              Exercice 1
            </NavLink>
          </li>
          <li>
            <NavLink exact="true" to="/Exercise">
              Exercice 2
            </NavLink>
          </li>
          <li>
            <NavLink exact="true" to="/Exercise">
              Exercice 3
            </NavLink>
          </li>
          <li>
            <NavLink exact="true" to="/Exercise">
              Exercice 4
            </NavLink>
          </li>
          <li>
            <NavLink exact="true" to="/Exercise">
              Exercice 5
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
    
  );
};

export default Choice;