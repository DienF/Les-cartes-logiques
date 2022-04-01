import React from "react";
import { NavLink } from "react-router-dom";

const Choice = () => {
  return (
    <div className="choice">
        <ul className="choicebar">
          <li>
          <a href="#">Exercices :</a>
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
          </li>
      </ul>
    </div>
    
  );
};

export default Choice;