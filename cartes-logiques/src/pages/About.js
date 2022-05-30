import React from "react";
import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className="about">
      <Navigation />
      <div id="credits"> 
        <h2>À propos de ce site</h2>
        <a href="https://unc.nc/" target="_blank" rel="noopener noreferrer"><img src={"img/logo_unc.png"} alt="Logo de l'Université de Nouvelle-Calédonie"/></a>
        <p><u>Projet tutoré :</u> Création d'un jeu de logique encadré par M. Éric Edo <a href="https://www.linkedin.com/in/eric-edo-8a0639228/" target="_blank" rel="noopener noreferrer"><img className="linkedin" src={"img/logo_linkedin.png"} alt={"LinkedIn d'Éric Edo"}/></a>.</p>
        <p> Les 3 étudiants qui ont réalisé ce projet sont : </p>
        <ul> 
          <li> Florian Audouard <a href="https://www.linkedin.com/in/florian-audouard-8b5b451a3/" target="_blank" rel="noopener noreferrer"><img className="linkedin" src={"img/logo_linkedin.png"} alt={"LinkedIn de Florian Audouard"}/></a></li>
          <li> Adrien Féré <a href="https://www.linkedin.com/in/adrien-f-9a411a1b8/" target="_blank" rel="noopener noreferrer"><img className="linkedin" src={"img/logo_linkedin.png"} alt={"LinkedIn d'Adrien Féré"}/></a></li>
          <li> Guillaume Perron <a href="https://www.linkedin.com/in/guillaume-perron-b586b31b8/" target="_blank" rel="noopener noreferrer"><img className="linkedin" src={"img/logo_linkedin.png"} alt={"LinkedIn de Guillaume Perron"}/></a></li>
        </ul> 
      </div>
    </div>
  );
};

export default About;
