import React, { useState, useEffect } from "react";
import Deck from "./Deck";
import Popup from "./Popup";
export const GameTab = React.createContext();

class CardClass {
  /**
   * @param {number} id 
   * @param {*} color 
   * @param {*} active 
   * @param {number} liaison - 0 = carte simple ;
   *                           1 = liaison "et" ;
   *                           2 = liaison "=>"
   * @param {*} left 
   * @param {*} right 
   */
  constructor(id, color, active, liaison, left, right) {
    this.id = id;
    this.color = color;
    this.active = active;
    this.liaison = liaison;
    this.left = left;
    this.right = right;
  }

  /**
   * Renvoie un objet CardClass sous la forme d'un string.
   * Carte simple : (couleur)
   * Carte double : (couleur) liaison (couleur)
   * Carte triple : (couleur) liaison ((couleur) liaison (couleur))
   * Carte quadruple : ((couleur) liaison (couleur)) liaison ((couleur) liaison (couleur))
   * @example ((rouge) ^ (jaune)) => (bleu)
   * @returns {string} un string plus lisible
   */
  toString() {
    var res = "(";
    if (this.color != null)  res += this.color.toString();
    if (this.left !== null)  res += this.left.toString();
    if (this.liaison === 1)  res += " ^ ";
    if (this.liaison === 2)  res += " => ";
    if (this.right !== null) res += this.right.toString();

    return res + ")";
  }

  /**
   * Transforme un objet CardClass en objet JSON.
   * @example
   * { "color" : "couleur"}
   * { 
   *   "left": { "color": "couleur" }, 
   *   "liaison": num,
   *   "right": { "color": "couleur" } 
   * }
   * { 
   *   "left": { "color": "couleur" }, 
   *   "liaison": num,
   *   "right": { 
   *              "left": { "color": "couleur" }, 
   *              "liaison": num,
   *              "right": { "color": "couleur" } 
   *            }
   * }
   * { 
   *   "left": { 
   *             "left": { "color": "couleur" }, 
   *             "liaison": num,
   *             "right": { "color": "couleur" } 
   *            },
   *   "liaison": num, 
   *   "right": { 
   *              "left": { "color": "couleur" }, 
   *              "liaison": num,
   *              "right": { "color": "couleur" } 
   *             }
   * }
   * @returns {JSON} - à stocker dans un fichier .json
   */
  toFile() {
    if (this.color !== null) return { color: this.color };
    else return {
      left: this.left.toFile(),
      liaison: this.liaison,
      right: this.right.toFile(),
    };
  }
}

const Game = ({ mode }) => {
  const [game, setGame] = useState([[]]);
  const [nbSelec, setNbSelec] = useState(0);
  const [selecDeck1, setSelecDeck1] = useState(-1);
  const [selecCard1, setSelecCard1] = useState(-1);
  const [selecDeck2, setSelecDeck2] = useState(-1);
  const [selecCard2, setSelecCard2] = useState(-1);
  const [popupSelect, setPopupSelect] = useState(false);
  const [popupAddCard, setPopupAddCard] = useState(false);
  const [popupDeleteCard, setPopupDeleteCard] = useState(false);
  const [indiceDeckAddCard, setIndiceDeckAddCard] = useState(0);
  const [popupFusion, setPopupFusion] = useState(false);

  /**
   * Initialise l'exercice.
   */
  useEffect(() => {
    if (mode !== "create") {
      setGame([[], []]);
      fetch(mode + '.json')
      .then(response => response.text())
      .then(data => {
        setGame(gameInput(JSON.parse(data)));
      });
    } else {
      setGame([[], []]);
    }
  }, [mode]);

  /**
   * Met la variable popupSelect en true ce qui affiche le popup.
   */
  const popup = () => { setPopupSelect(true); };

  /**
   * Fonction récursive qui : change l'attribut 'active' ;
   *                          regarde si left & right sont null, si ils ne le sont pas on appelle la même fonction sur eux.
   * @param card - la carte qui doit être sélectionnée ou pas
   * @param state - booléen qui définit si une carte est sélectionnée ou pas
   */
  const select = (card, state) => {
    card.active = state;
    if (card.left != null) select(card.left, state);
    if (card.right != null) select(card.right, state);
  };

  /**
   * La carte qui est déja sélectionnée & celle qui est passée en paramètre utilisent la fonction {@link select}
   * qui sélectionne toutes les cartes dans le Deck ou déselectionne la première carte sélectionnée si on
   * reclique dessus.
   * Enfin, si on sélectionne une 2ème carte, on appelle la fonction {@link popup} qui s'occupera de valider le
   * choix & d'exécuter l'opération.
   * @param i - index du Deck
   * @param j - index de la carte
   */
  const update = (i, j) => {
    var tempoSelecDeck1 = selecDeck1;
    var tempoSelecCard1 = selecCard1;
    var tempoNbSelec = nbSelec;
    if (tempoNbSelec < 2) {
      var tempo = [...game];
      tempo[i].map(function (card) {
        if (card !== null &&
          !(card.id !== j &&
          (!(i === tempoSelecDeck1 && card.id === tempoSelecCard1) || tempoNbSelec === 0))
        ) {
          if (card.id === j) {
            select(card, !card.active);
            if (card.active === true) {
              if (tempoNbSelec === 0) {
                tempoSelecDeck1 = i;
                tempoSelecCard1 = j;
              }
              tempoNbSelec++;
            } else {
              tempoNbSelec--;
              tempoSelecCard1 = -1;
              tempoSelecDeck1 = -1;
            }
          }
        }
        return 0;
      });
      setGame(() => tempo);
      setNbSelec(tempoNbSelec);
      setSelecCard1(tempoSelecCard1);
      setSelecDeck1(tempoSelecDeck1);

      if (tempoNbSelec === 2) {
        setSelecDeck2(i);
        setSelecCard2(j);
        if (mode !== "create") popup();
        else setPopupFusion(true);
      }
    }
  };

  /**
   * Déselectionne toute les cartes.
   */
  const allFalse = () => {
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-2);
    setSelecDeck2(-2);
    var tmp = [...game];
    tmp.forEach((e) => {
      e.forEach((s) => {
        if (s !== null) {
          select(s, false);
        }
      });
    });
    setGame(tmp);
  };

  /**
   * Ferme le popup & déselectionne toutes les cartes.
   */
  const closePopup = () => {
    setPopupSelect(false);
    allFalse();
  };

  /**
   * Fait apparaître le popup qui nous demande la couleur de la carte qu'on veut ajouter.
   * @param {*} deckIndice - l'indice du deck où l'on ajoute une carte 
   */
  const addCard = (deckIndice) => {
    setIndiceDeckAddCard(deckIndice);
    setPopupAddCard(true);
  };

  /**
   * Crée une carte avec la couleur selectionnée (ne ferme pas le popup quand on sélectionne une couleur)
   * @param {*} event (event.target.value) - reçoit la couleur cliquée
   *                  (event.target.checked) - on le met à false si on veut faire plusieurs fois la même couleur
   */
  const choixCouleur = (event) => {
    var tmp = [...game];
    event.target.checked = false;
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length, // id
        event.target.value,             // color
        false,                          // active
        0,                              // liaison
        null,                           // left
        null                            // right
      )
    );
    setGame(tmp);
  };

  /**
   * Crée une carte complexe avec les 2 cartes selectionnées (cette fonction est appelée à la fin de update en mode création)
   * @param {*} event (event.target.value) - reçoit la liaison cliquée
   */
  const choixLiaison = (event) => {
    var tmp = [...game];
    event.target.checked = false;
    const l = parseInt(event.target.value);                               // liaison
    const c1 = game[selecDeck1][selecCard1];
    const c2 = game[selecDeck2][selecCard2];
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length,                                   // id
        null,                                                             // color
        false,                                                            // active
        l,                                                                // liaison
        new CardClass(0, c1.color, false, c1.liaison, c1.left, c1.right), // left
        new CardClass(1, c2.color, false, c2.liaison, c2.left, c2.right)  // right
      )
    );
    setGame(tmp);
    setPopupFusion(false);
    allFalse();
  };

  /**
   * Supprime la carte qui est sélectionnée.
   */
  const deleteCard = () => {
    setPopupDeleteCard(false);
    if(!(selecCard1 === -1 && selecDeck1 === -1)){
      if (!(selecDeck1 === game.length - 1 && selecCard1 === 0)) {
        var tmp = [...game];
        tmp[selecDeck1][selecCard1] = null;
        setGame(tmp);
      }
    }
    allFalse();
  };

  /**
   * Transforme le tableau en tableau d'objets avec seulement les informations qui nous intéressent (couleur/liaison).
   * 
   * @returns un tableau d'objet
   */
  const gameOutput = () => {
    var res = [[], []];
    game.map(function (deck, index) {
      deck.map(function (card) {
        if (card != null) res[index].push(card.toFile());
      });
    });

    return res;
  };

  /**
   * Reçoit un tableau d'un fichier json à qui on a appliqué la méthode parse (json => tableau object) et renvoie un tableau qui peut etre lu par notre site
   * @param {*} data tableau d'objets qui va servir pour l'initialisation
   * @returns un tableau de Deck
   */
  const gameInput = (data) =>{
    var res = [[], []]
    var i=0;
    data[0].forEach(element => {
        res[0].push(toClass(element, i));
      i++;
    });
    i=0;
    data[1].forEach(element => {
      res[1].push(toClass(element, i));
      i++;
    });
    return res;
  }

  /**
   * @todo Stocker dans un fichier sur le serveur ou sur le pc local ou laisser comme ça (afficher le json dans la console)
   */
  const saveAsFile = () => {
    console.log(JSON.stringify(gameOutput()));
  };

  /**
   * Pour l'instant ouvre le fichier Ex1.json 
   *
   */
  const openFile = () => {
    const namefile = "Ex1.json";
    setGame([[] ,[]]);
    fetch(namefile)
      .then((response) => response.text())
      .then((data) => {
        setGame(gameInput(JSON.parse(data)));
      });
  };

  /**
   * Crée une instance {@link CardClass} et la renvoie.
   * @param {} obj - information mimimum pour créer une carte :
   *                          Carte simple = juste la couleur
   *                          Carte complexe = les 2 cartes qui la compose & la liaison
   * @param {number} i - numéro de l'id  
   * @returns {CardClass}
   */
  const toClass = (obj,i) => {
    if (obj.color === undefined) {
      return new CardClass(i, null, false, obj.liaison, toClass(obj.left, 0), toClass(obj.right, 1));
    } else {
      return new CardClass(i, obj.color, false, 0, null, null);
    }
  }
  return (
    <div className="game" >
      {mode === "create" && (<button onClick={saveAsFile}>Convertir en fichier</button> )}
      {mode === "create" && (<button onClick={openFile}>Ouvrir un fichier</button> )}
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
          <Deck
            updateGame = {update}
            indice = {index}
            addCardFunc = {addCard}
            deleteCardFunc = {setPopupDeleteCard}
            nbDeck = {game.length}
            mode = {mode}
            key = {index}
          ></Deck>
        ))}
      </GameTab.Provider>
      {popupSelect && (
        <Popup
          content={
            <>
              <b>
                Voulez-vous fusionner cette carte{" "}
                {game[selecDeck1][selecCard1].toString()} : [{selecDeck1}][{selecCard1}] avec celle-ci{" "}
                {game[selecDeck2][selecCard2].toString()} : [{selecDeck2}][{selecCard2}] ?
              </b>
              <br></br>
              <button onClick={closePopup}>Annuler</button>
            </>
          }
        />
      )}
      {popupAddCard && (
        <Popup
          content={
            <>
              <b>Choisissez une Couleur</b>
              <div onChange={choixCouleur}>
                <input type="radio" value="red" name="couleur" /> Rouge
                <input type="radio" value="yellow" name="couleur" /> Jaune
                <input type="radio" value="blue" name="couleur" /> Bleu
                <input type="radio" value="orange" name="couleur" /> Orange
              </div>
              <button
                onClick={function () {
                  setPopupAddCard(false);
                }}
              >
                Annuler
              </button>
            </>
          }
        />
      )}
      {popupFusion && (
        <Popup
          content={
            <>
              <b>Choisissez une liaison</b>
              <div onChange={choixLiaison}>
                <input type="radio" value="1" name="liaison" /> et
                <input type="radio" value="2" name="liaison" /> {"=>"}
              </div>
              <button
                onClick={function () {
                  setPopupFusion(false);
                }}
              >
                Annuler
              </button>
            </>
          }
        />
      )}
      {popupDeleteCard && !(selecCard1 === -1 || selecDeck1 === -1) && (
        <Popup
          content={
            <>
              <b>
                Voulez-vous suprimmer cette carte{" "}
                {game[selecDeck1][selecCard1].toString()} : [{selecDeck1}][{selecCard1}] ?
              </b>
              <br></br>
              <button onClick={deleteCard}>Oui</button>

              <button
                onClick={function () {
                  setPopupDeleteCard(false);
                }}
              >
                Annuler
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

export default Game;
