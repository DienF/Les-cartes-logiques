import React, { useState, useEffect } from "react";
import Deck from "./Deck";
import Popup from "./Popup";
export const GameTab = React.createContext();

class CardClass {
  constructor(id, color, active, liaison, left, right) {
    this.id = id;
    this.color = color;
    this.active = active;
    this.liaison = liaison; // 0 carte sipmple 1 liaison "et" 2 liaison "=>" 
    this.left = left;
    this.right = right;
  }
  toString(){
    var res = "(";
    if(this.color != null){
      res += this.color.toString();
    }
    if(this.left !== null){
      res += this.left.toString();
    }
    if(this.liaison === 1){
      res += " et ";
    }
    if(this.liaison === 2){
      res += " => ";
    }
    if(this.right !== null){
      res += this.right.toString();
    }
    
    return res + ")";
  }
}




const Game = () => {
  const [game, setGame] = useState([]);
  const [playOnce, setPlayOnce] = useState(true);
  const [nbSelec, setNbSelec] = useState(0);
  const [selecDeck1, setselecDeck1] = useState(-1);
  const [selecCard1, setselecCard1] = useState(-1);
  const [selecDeck2, setselecDeck2] = useState(-1);
  const [selecCard2, setselecCard2] = useState(-1);
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    if (playOnce) {
      setGame(() => [
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
              new CardClass(1, "white", false, 0, null, null)
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
  const popup = () => {
    setIsPopup(true);
  };
  /**
   * fonction recursive elle change l'atribut 'active' et regarde si left et right sont null si il ne le sont pas on appelle la meme fonction sur eux
   * @param card - la carte qui doit etre selectioner ou pas
   * @param state - boolean qui definie si une carte est selectioner ou pas
   */
  const select = (card, state) => {
    card.active = state;
    if (card.left != null) {
      select(card.left, state);
    }
    if (card.right != null) {
      select(card.right, state);
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
    var temposelecDeck1 = selecDeck1;
    var temposelecCard1 = selecCard1;
    var tempoNbSelec = nbSelec;
    if (tempoNbSelec < 2) {
      var tempo = [...game];
      tempo[i].map(function (card) {
        if (
          !(
            card.id !== j &&
            (!(i === temposelecDeck1 && card.id === temposelecCard1) ||
              tempoNbSelec === 0)
          )
        ) {
          if (card.id === j) {
            select(card, !card.active);
            if (card.active === true) {
              if (tempoNbSelec === 0) {
                temposelecDeck1 = i;
                temposelecCard1 = j;
              }
              tempoNbSelec++;
            } else {
              tempoNbSelec--;
              temposelecCard1 = -1;
              temposelecDeck1 = -1;
            }
          }
        }
        return 0;
      });
      setGame(() => tempo);
      setNbSelec(tempoNbSelec);
      setselecCard1(temposelecCard1);
      setselecDeck1(temposelecDeck1);
      if (tempoNbSelec === 2) {
        setselecDeck2(i);
        setselecCard2(j);
        popup();
      }
    }
  };
  /**
   * deselectionne toute les cartes.
   */
  const allFalse = () => {
    setNbSelec(0);
    setselecCard1(-1);
    setselecDeck1(-1);
    setselecCard1(-2);
    setselecDeck1(-2);
    game.forEach((e) => {
      e.forEach((s) => {
        select(s, false);
      });
    });
  }
  /**
   * ferme le popup  et deselectionne toute les cartes.
   */
  const closePopup = () =>{
    setIsPopup(false);
    allFalse();
  }
  return (
    <div className="game">
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
          <Deck updateGame={update} indice={index} key={index}></Deck>
        ))}
      </GameTab.Provider>
      {isPopup && <Popup
      content={<>
        <b>Voulez vous fusionner cette carte {game[selecDeck1][selecCard1].toString()} : [{selecDeck1}][{selecCard1}] avec elle {game[selecDeck2][selecCard2].toString()}: [{selecDeck2}][{selecCard2}] ?</b>
        <br></br>
        <button onClick={closePopup}>Annuler</button>
      </>}
    />}
    </div>
  );
};

export default Game;
