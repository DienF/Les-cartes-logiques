import React from "react";
import Card from "./Card";
import { GameTab } from "./Game";

const Deck = ({updateGame, indice, addCardFunc, deleteCardFunc, nbDeck, mode}) => {
  /**
   * Méthode qui est appelée au moment d'un clique sur une carte & qui appelle la fonction updateGame passée par le component Game.
   * @param {number} indiceCard - index de la carte dans le tableau
   */
  const update = (indiceCard) => {
    updateGame(indice, indiceCard);
  };

  const addCardToDeck = () => {
    addCardFunc(indice);
  };

  const deleleCardToDeck = () =>{
    deleteCardFunc(true);
  }
  const setClassname = () =>{
    if(indice === 0)return "start";
    if(indice === nbDeck-1)return "goal";
  }

  return (
    <div className={"deck " + setClassname() } >
      {indice === 0 && (<h3>Départ</h3>)}
      {indice === nbDeck-1 && (<h3>Objectif</h3>)}
      {mode === "create" && (<button onClick={addCardToDeck}>Ajouter une carte</button>)}
      <br/>
      {mode === "create" && (<button onClick={deleleCardToDeck}>Suprimmer une carte</button>)}
      <GameTab.Consumer>
        {(game) => {
          return game[indice].map((card, index) =>
            card !== null ? (
              <Card
                deckIndice={indice}
                cardIndice={index}
                update={update}
                key={index}
              />
            ) : (
              <></>
            )
          );
        }}
      </GameTab.Consumer>
      </div>
  );
};

export default Deck;
