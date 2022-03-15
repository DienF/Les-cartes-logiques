import React, { useState, useEffect } from "react";
import Deck from "./Deck";
export const GameTab = React.createContext();

class CardClass {
  constructor(id, color, active, liaison, CardClass1, CardClass2) {
    this.id = id;
    this.color = color;
    this.active = active;
    this.liaison = liaison;
    this.CardClass1 = CardClass1;
    this.CardClass2 = CardClass2;
  }
}
const Game = () => {
  const [game, setGame] = useState([]);
  const [playOnce, setPlayOnce] = useState(true);
  const [nbSelec, setNbSelec] = useState(0);
  const [selecDeck, setSelecDeck] = useState(-1);
  const [selecCard, setSelecCard] = useState(-1);

  useEffect(() => {
    if (playOnce) {
      setGame((oldarray) => [
        [
          new CardClass(
            0,
            null,
            false,
            1,
            new CardClass(0, "blue", false, 0, null, null),
            new CardClass(1, "green", false, 0, null, null)
          ),
          new CardClass(
            1,
            null,
            false,
            1,
            new CardClass(0, "yellow", false, 0, null, null),
            new CardClass(
              1,
              null,
              false,
              1,
              new CardClass(0, "red", false, 0, null, null),
              new CardClass(1, "orange", false, 0, null, null)
            )
          ),
          new CardClass(
            2,
            null,
            false,
            1,
            new CardClass(
              0,
              null,
              false,
              1,
              new CardClass(0, "blue", false, 0, null, null),
              new CardClass(1, "pink", false, 0, null, null)
            ),
            new CardClass(1, "lime", false, 0, null, null)
          ),
          new CardClass(
            3,
            null,
            false,
            1,
            new CardClass(
              0,
              null,
              false,
              1,
              new CardClass(0, "aqua", false, 0, null, null),
              new CardClass(1, "brown", false, 0, null, null)
            ),
            new CardClass(
              1,
              null,
              false,
              1,
              new CardClass(0, "purple", false, 0, null, null),
              new CardClass(1, "gold", false, 0, null, null)
            )
          ),
        ],
        [
          new CardClass(
            0,
            null,
            false,
            2,
            new CardClass(0, "blue", false, 0, null, null),
            new CardClass(1, "green", false, 0, null, null)
          ),
          new CardClass(1, "blue", false, 0, null, null),
          new CardClass(2, "green", false, 0, null, null),
          new CardClass(3, "blue", false, 0, null, null),
        ],
      ]);
      setPlayOnce(false);
    }
  }, [game, playOnce]);
  /**
   * @todo fonction qui affiche une fenetre pour que le joueur valide ou non la selection des 2 cartes et si oui effectue l'opreation associer
   * possibiliter de changer le nom de la methode et les noms des attributs
   * @param {*} c - index deck de la deuxieme carte selectionner
   * @param {*} d - index carte de la deuxieme carte selectionner
   */
  const popup = (c, d) => {
    console.log("les cartes selectioner : ");
    console.log(game[selecDeck][selecCard]);
    console.log(" et ");
    console.log(game[c][d]);
    /* pour reset la selection des cartes de tout les decks
    setNbSelec(0);
    setSelecCard(-1);
    setSelecDeck(-1);
    game.forEach((e) => {
      e.forEach((s) => {
        select(s, false);
      });
    });


    */
  };
  /**
   * fonction recursive elle change l'atribut 'active' et regarde si CardClass1 et CardClass2 sont null si il ne le sont pas on appelle la meme fonction sur eux
   * @param card - la carte qui doit etre selectioner ou pas
   * @param state - boolean qui definie si une carte est selectioner ou pas
   */
  const select = (card, state) => {
    card.active = state;
    if (card.CardClass1 != null) {
      select(card.CardClass1, state);
    }
    if (card.CardClass2 != null) {
      select(card.CardClass2, state);
    }
  };
  /**
   *  la carte qui est deja selectioner et celle qui est passer en parametre utilise la fonction select qui selectionne toute les cartes dans la cartes
   * ou deselectionne la premiere carte selectionner si on reclique dessus
   * enfin si on selectionne une deuxieme carte ca appelle la fonction popup qui s'occupera de valider le choix et d'executer l'operation.
   * @param  i - index deck
   * @param  j - index carte
   */
  const update = (i, j) => {
    var tempoSelecDeck = selecDeck;
    var tempoSelecCard = selecCard;
    var tempoNbSelec = nbSelec;
    if (tempoNbSelec < 2) {
      var tempo = [...game];
      tempo[i].map(function (card) {
        if (
          !(
            card.id !== j &&
            (!(i === tempoSelecDeck && card.id === tempoSelecCard) ||
              tempoNbSelec === 0)
          )
        ) {
          if (card.id === j) {
            select(card, !card.active);
            if (card.active === true) {
              if (tempoNbSelec === 0) {
                tempoSelecDeck = i;
                tempoSelecCard = j;
              }
              tempoNbSelec++;
            } else {
              tempoNbSelec--;
              tempoSelecCard = -1;
              tempoSelecDeck = -1;
            }
          }
        }
        return 0;
      });
      setGame((arr) => tempo);
      setNbSelec(tempoNbSelec);
      setSelecCard(tempoSelecCard);
      setSelecDeck(tempoSelecDeck);
      if (tempoNbSelec === 2) {
        popup(i, j);
      }
    }
  };

  return (
    <div className="game">
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
          <Deck updateGame={update} indice={index} key={index}></Deck>
        ))}
      </GameTab.Provider>
    </div>
  );
};

export default Game;
