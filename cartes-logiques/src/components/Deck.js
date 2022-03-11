import React from "react";
import Card from "./Card";
import { GameTab } from "./Game";

const Deck = ({ updateGame, indice }) => {
  /**
   * fonction qui est appeler au moment d'un click sur une carte et appelle la fonction updateGame passer par le componant Game.
   * @param indiceCard - index de la carte dans le tableau.
   */
  const update = (indiceCard) => {
    updateGame(indice, indiceCard);
  };

  return (
    <div className="deck">
      <GameTab.Consumer>
        {(game) => {
          return game[indice].map((card, index) => (
            <Card
              deckIndice={indice}
              cardIndice={card.id}
              update={update}
              key={index}
            />
          ));
        }}
      </GameTab.Consumer>
    </div>
  );
};

export default Deck;
