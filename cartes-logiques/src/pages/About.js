import React from "react";
import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div>
      <Navigation />
      <div className="about"> 
        <h2>À propos de ce site</h2>
        <img src={"img/logo_unc.png"} alt="Logo de l'Université de Nouvelle-Calédonie"></img>
        <p> Projet tutoré : Création d'un jeu de logique encadré par M. Eric Edo</p>
        <p> Étudiants : </p>
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
