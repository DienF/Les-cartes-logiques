import React, { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Choice from "../components/Choice";

const Home = () => {
  return (
    <div className="home">
      <Navigation />
      <Choice />
    </div>
  );
};

export default Home;