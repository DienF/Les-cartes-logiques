import React from "react";
import Navigation from "../components/Navigation";

const About = () => {
  return (
    <div className="forms">
      <Navigation />
      <div id="forms">
        <h2>Donnez-nous votre avis</h2>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSexM3YkB3s5MqKKW0GwfLeP-Onkbp8HTK-ukedIcsU5qDjDOw/viewform?embedded=true"
          title="Questionnaire pour donner son avis sur le site Les Cartes Logiques"
          width="640"
          height="668"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >
          Chargement…
        </iframe>
      </div>
    </div>
  );
};

export default About;
