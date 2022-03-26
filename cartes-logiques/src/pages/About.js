import React from "react";
import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div>
      <Navigation />
      <h2>A Propos de ce site</h2>
      <div className="about"> 
        <p> Projet tutoré : Création d'un jeu de logique encadré par Monsieur Eric Edo</p>
        <p> Etudiants : </p>
        <ul> 
          <li> Audouard Florian </li>
          <li> Féré Adrien </li>
          <li> Perron Guillaume </li>
        </ul> 
      </div>
    </div>
  );
};

export default About;
