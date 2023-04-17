import React from "react";
import Card from "./Card";
import { GameTab } from "./Game";

const Deck = ({updateGame, indice, addCardFunc, deleteCardFunc, nbDeck, mode, objectif, cardHelp, cardHelp2,isWin}) => {
    /**
     * Méthode qui est appelée au moment d'un clique sur une carte & qui appelle la fonction updateGame passée par le component Game.
     * @param {number} indiceCard - index de la carte dans le tableau
     */
    const update = (indiceCard) => {
        updateGame(indice, indiceCard);
    };

    /**
     * @see Card#addCard()
     */
    const addCardToDeck = () => {
        addCardFunc(indice);
    };

    /**
     * @see Card#deleteCard()
     */
    const deleleCardToDeck = () => {
        deleteCardFunc();
    }

    /**
     * @returns {"start"|"goal"|"other"}
     */
    const setClassname = () => {
        if (indice === 0)        return "start";
        if (indice === nbDeck-1) return "goal";
        return "other" + (indice);
    }

    const getObjectifNum = (i) => {
        let num = -1;
        objectif.forEach(element => {
          if (element[1] === i) num = element[0];   
        });
        let res = -1;
        if (num === 0)               res = "principal";
        if (num !== -1 && num !== 0) res = "secondaire " + num;
        return res;
    }

    return (
        <div className={setClassname()}>
            <div className="deck">
                {indice !== nbDeck-1 && indice !==0 && (<h3>LPU {indice}</h3>)}
                {indice !== nbDeck-1 && indice ===0 && (<h3>LPU</h3>)}
                {indice === nbDeck-1 && (<h3>Objectifs <img src={"img/objectif.png"} alt={"Ajout objectif"}/></h3>)}
                {mode === "Create" && (<button onClick={addCardToDeck}>Ajouter une carte</button>)}
                <br/>
                {mode === "Create" && (<button onClick={deleleCardToDeck}>Supprimer une carte</button>)}
                <GameTab.Consumer>
                    {(game) => {
                        return game[indice].map((card, index) =>
                            <div key= {index}>
                                {indice === nbDeck-1 && getObjectifNum(index) !== -1 && <b>Objectif {getObjectifNum(index)} :</b>}
                                <Card
                                    deckIndice = {indice}
                                    cardIndice = {index}
                                    update     = {update}
                                    cardHelp   = {cardHelp}
                                    cardHelp2  = {cardHelp2}
                                    isWin = {isWin}
                                />
                            </div>
                        );
                    }}
                </GameTab.Consumer>
            </div>
        </div>
    );
};

export default Deck;