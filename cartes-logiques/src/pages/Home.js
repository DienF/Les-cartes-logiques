import React from "react";
import Game from "../components/Game";
import Navigation from "../components/Navigation";

const home = () => {
  return (
    <div className="home">
      <Navigation />

      <Game />
    </div>
  );
};

export default home;
