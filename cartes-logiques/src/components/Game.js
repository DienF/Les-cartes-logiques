import React, { useState, useEffect } from "react";
import Deck from "./Deck";
import Popup from "./Popup";
export const GameTab = React.createContext();

class CardClass {
  /**
   * @param {number} id
   * @param {string|null} color - couleurs disponibles :
   *                              rouge ("red")     ;
   *                              jaune ("yellow")  ;
   *                              bleu ("blue")     ;
   *                              orange ("orange")
   * @param {true|false} active
   * @param {""|"et"|"=>"} link -  ""  = carte simple ;
   *                              "et" = liaison "et" ;
   *                              "=>" = liaison "⇒"
   * @param {CardClass|null} left
   * @param {CardClass|null} right
   */
  constructor(id, color, active, link, left, right) {
    this.id      = id;
    this.color   = color;
    this.active  = active;
    this.link    = link;
    this.left    = left;
    this.right   = right;
  }

  /**
   * Renvoie un objet {@link CardClass} sous la forme d'un string.
   * Carte simple : (couleur)
   * Carte double : (couleur) liaison (couleur)
   * Carte triple : (couleur) liaison ((couleur) liaison (couleur))
   * Carte quadruple : ((couleur) liaison (couleur)) liaison ((couleur) liaison (couleur))
   * @example ((rouge) ^ (jaune)) => (bleu)
   * @returns un string plus lisible
   */
  toString() {
    let res = "(";
    if (this.color != null)  res += this.color.toString();
    if (this.left !== null)  res += this.left.toString();
    res += this.link;
    if (this.right !== null) res += this.right.toString();
    return res + ")";
  }

  /**
   * Transforme un objet CardClass en objet JSON.
   * @example
   * { "color" : "couleur"}
   * {
   *   "left": { "color": "couleur" },
   *   "link": "",
   *   "right": { "color": "couleur" }
   * }
   * {
   *   "left": { "color": "couleur" },
   *   "link": "",
   *   "right": {
   *              "left": { "color": "couleur" },
   *              "link": "et",
   *              "right": { "color": "couleur" }
   *            }
   * }
   * {
   *   "left": {
   *             "left": { "color": "couleur" },
   *             "link": "=>",
   *             "right": { "color": "couleur" }
   *            },
   *   "link": "=>",
   *   "right": {
   *              "left": { "color": "couleur" },
   *              "link": "et",
   *              "right": { "color": "couleur" }
   *             }
   * }
   * @returns {JSON} - à stocker dans un fichier .json
   */
  toFile() {
    if (this.color !== null) return { color: this.color };
    else return {
      left:    this.left.toFile(),
      link:    this.link,
      right:   this.right.toFile(),
    };
  }

  /**
   * Renvoie une nouvelle instance d'une carte.
   * Si la carte est composée de 2 autres cartes ces dernières sont également de nouvelles instances.
   * @returns une nouvelle instance d'une même carte
   */
  copy() {
    let l = null;
    let r = null;
    if (this.left !== null)  l = this.left.copy();
    if (this.right !== null) r = this.right.copy();
    return new CardClass(this.id,this.color,this.active,this.link,l,r);
  }

  /**
   * Fonction récursive qui :
   * change l'attribut 'active' ;
   * regarde si left & right sont null, si ils ne le sont pas on appelle la même fonction sur eux.
   * @param {CardClass} card   - la carte qui doit être sélectionnée ou pas
   * @param {true|false} state - booléen qui définit si une carte est sélectionnée ou pas
   */
  select(state) {
      this.active = state;
      if (this.left  != null) this.left.select(state);
      if (this.right != null) this.right.select(state);
  };

  /**
   * Compare les attributs de 2 cartes.
   * @param {CardClass} card - l'autre carte à comparer
   * @returns true si identiques sinon false
   */
  equals(card) {
    if (this.color !== null && card.color !== null) return (this.color === card.color);
    else {
      let bool = true;
      if ((this.left   === null && card.left  !== null) || (this.left  !== null && card.left  === null)) return false;
      if ((this.right  === null && card.right !== null) || (this.right !== null && card.right === null)) return false;
      if (this.link !== card.link) return false;
      if (this.left    !== null && card.left  !== null) bool = this.left.equals(card.left);
      if (this.right   !== null && card.right !== null) bool = (bool && this.right.equals(card.right));
      return bool;
    }
  }

  /**
   * Vérifie si la carte est simple/double.
   * @returns true si simple/double sinon false
   */
  isSimpleOrDouble(){
    if (this.color !== null) return true;
    if (this.left.color !== null && this.right.color !== null) return true;
    else return false;
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
  const [popupWin,setPopupWin] = useState(false);
  const [popupEmprunt,setPopupEmprunt] = useState(false);
  const [popupGetCard, setPopupGetCard] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [lastGame , setLastGame] = useState([]);

  /**
   * Initialise l'exercice.
   */
  useEffect(() => {
    if (mode !== "create") {
      setGame([[], []]);
      fetch(mode + ".json")
      .then(response => response.text())
      .then(data => {
        setGame(gameInput(JSON.parse(data)));
      });
    } else {
      setGame([[], []]);
    }
  }, [mode]);

  /**
   * 1er cas possible :
   * Vérifie que la carte sélectionnée en 2ème a une liaison "=>" ;
   * Vérifie que la carte sélectionnée en 1er est égale à la partie gauche de la 2ème carte ;
   * Si oui ajoute une nouvelle carte qui est la copie de la partie droite de la 2ème carte dans le {@link Deck} le plus grand.
   * 2ème cas possible :
   * Vérifie que les2 cartes sont simples ou doubles ;
   * Si c'est la cas ajoute une carte double avec les couleurs des 2 cartes sélectionnées et la liaison "et" ;
   * Sinon affiche un popup d’erreur.
   */
  const fusion = () => {
    let tmp = [...game];
    tmp[selecDeck1][selecCard1].select(false);
    tmp[selecDeck2][selecCard2].select(false);
    if (tmp[selecDeck2][selecCard2].link === "=>" && tmp[selecDeck2][selecCard2].left.equals(tmp[selecDeck1][selecCard1])) {
      let tmpLastGame = [...lastGame];
      let saveGameTmp = [];
      for (var i = 0 ; i < game.length ; i++) {
        if (game[i] !== null) {
          saveGameTmp[i] = [];
          for (var j = 0 ; j < game[i].length ; j++) {
            if (game[i][j] !== null) saveGameTmp[i].push(game[i][j].copy());
            else saveGameTmp.push(null);
          }
        }
        else saveGameTmp.push(null);
      }
      tmpLastGame.push(saveGameTmp);
      setLastGame(tmpLastGame);
      let finalDeck = Math.max(selecDeck1,selecDeck2);
      tmp[finalDeck].push(tmp[selecDeck2][selecCard2].right.copy());
      tmp[finalDeck][tmp[finalDeck].length-1].id = tmp[finalDeck].length-1;
      setGame(tmp);
      allFalse();
      setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
    }
    else if (tmp[selecDeck1][selecCard1].isSimpleOrDouble() && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
      let tmpLastGame = [...lastGame];
      let saveGameTmp = [];
      for (var i = 0 ; i < game.length ; i++) {
        if (game[i] !== null) {
          saveGameTmp[i] = [];
          for (var j = 0 ; j < game[i].length ; j++) {
            if (game[i][j] !== null) saveGameTmp[i].push(game[i][j].copy());
            else saveGameTmp.push(null);
          }
        }
        else saveGameTmp.push(null);
      }
      tmpLastGame.push(saveGameTmp);
      setLastGame(tmpLastGame);
      let finalDeck = Math.max(selecDeck1,selecDeck2);
      let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
      let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
      tmpCard1.id = 0;
      tmpCard2.id = 1;
      tmp[finalDeck].push(new CardClass(tmp[finalDeck].length,null,false,"et",tmpCard1,tmpCard2));
      setGame(tmp);
      allFalse();
      setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
    }
    else setPopupError(true);
  };

  /**
   * La carte qui est déjà sélectionnée & celle qui est passée en paramètre utilisent la fonction {@link select}
   * qui sélectionne toutes les cartes dans le Deck ou déselectionne la première carte sélectionnée si on
   * reclique dessus.
   * Enfin, si on sélectionne une 2ème carte, on appelle la fonction {@link popup} qui s'occupera de valider le
   * choix & d'exécuter l'opération.
   * @param {number} i - index du Deck
   * @param {number} j - index de la carte
   */
  const update = (i, j) => {
    setPopupDeleteCard(false);
    let tempoSelecDeck1 = selecDeck1;
    let tempoSelecCard1 = selecCard1;
    let tempoNbSelec = nbSelec;
    if (tempoNbSelec < 2 && ((i !== game.length-1) || (i === game.length-1 && game[i][j].link === "=>" && nbSelec === 0) || mode === "create")) {
      let tempo = [...game];
      tempo[i].map(function (card) {
        if (card !== null &&
          !(card.id !== j &&
          (!(i === tempoSelecDeck1 && card.id === tempoSelecCard1) || tempoNbSelec === 0))
        ) {
          if (card.id === j) {
            card.select(!card.active);
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
      setGame(tempo);
      setNbSelec(tempoNbSelec);
      setSelecCard1(tempoSelecCard1);
      setSelecDeck1(tempoSelecDeck1);
      if(i === game.length-1 && game[i][j].link === "=>" && mode !== "create")setPopupEmprunt(true);
      if(tempoNbSelec === 1 && game[i][j].link === "et" && mode !== "create")setPopupGetCard(true);
      if (tempoNbSelec === 2) {
        setSelecDeck2(i);
        setSelecCard2(j);
        if (mode !== "create") setPopupSelect(true);
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
    setSelecCard2(-1);
    setSelecDeck2(-1);
    let tmp = [...game];
    tmp.forEach((e) => {
      e.forEach((s) => {
        if (s !== null) {
          s.select(false);
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
    setPopupGetCard(false);
    setPopupError(false);
    allFalse();
  };

  /**
   * Fait apparaître le popup qui nous demande la couleur de la carte qu'on veut ajouter.
   * @param {number} deckIndice - l'indice du deck où l'on ajoute une carte
   */
  const addCard = (deckIndice) => {
    setIndiceDeckAddCard(deckIndice);
    setPopupAddCard(true);
  };

  /**
   * Crée une carte avec la couleur selectionnée (ne ferme pas le popup quand on sélectionne une couleur).
   * @param {*} event (event.target.value)   - reçoit la couleur cliquée ;
   *                  (event.target.checked) - on le met à false si on veut faire plusieurs fois la même couleur
   */
  const choixCouleur = (event) => {
    let tmp = [...game];
    event.target.checked = false;
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length, // id
        event.target.value,             // color
        false,                          // active
        "",                             // link
        null,                           // left
        null                            // right
      )
    );
    setGame(tmp);
  };

  /**
   * Crée une carte complexe avec les 2 cartes sélectionnées (cette fonction est appelée à la fin de {@link update()} en mode création).
   * @param {*} event (event.target.value) - reçoit la liaison cliquée
   */
  const choixLiaison = (event) => {
    let tmp = [...game];
    event.target.checked = false;
    const l = event.target.value;                 // link
    let c1 = game[selecDeck1][selecCard1].copy();
    let c2 = game[selecDeck2][selecCard2].copy();
    c1.id = 0;
    c2.id = 1;
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length,           // id
        null,                                     // color
        false,                                    // active
        l,                                        // link
        c1,                                       // left
        c2                                        // right
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
    if (!(selecCard1 === -1 && selecDeck1 === -1)) {
      let tmp = [...game];
      tmp[selecDeck1][selecCard1] = null;
      saveGame();
      setGame(tmp);
    }
    allFalse();
  };

  /**
   * Transforme le tableau en tableau d'objets avec seulement les informations qui nous intéressent (couleur/liaison).
   *
   * @returns un tableau d'objet
   */
  const gameOutput = () => {
    let res = [[], []];
    game.map(function (deck, index) {
      deck.map(function (card) {
        if (card != null) res[index].push(card.toFile());
        return 0;
      });
      return 0;
    });

    return res;
  };

  /**
   * Reçoit un tableau d'un fichier JSON à qui on a appliqué la méthode parse (JSON => tableau object) et renvoie un tableau qui peut etre lu par notre site
   * @param {Object[]} data tableau d'objets qui va servir pour l'initialisation
   * @returns un tableau de Deck
   */
  const gameInput = (data) =>{
    let res = [[], []]
    let i = 0;
    data[0].forEach(element => {
        res[0].push(toClass(element, i));
      i++;
    });
    i = 0;
    data[1].forEach(element => {
      res[1].push(toClass(element, i));
      i++;
    });
    return res;
  }

  /**
   * @todo Stocker dans un fichier sur le serveur ou sur le PC local ou laisser comme ça (afficher le JSON dans la console).
   */
  const saveAsFile = () => {
    console.log(JSON.stringify(gameOutput()));
  };

  /**
   * Pour l'instant ouvre le fichier Ex1.json.
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
   * Transforme un objet JSON en instance {@link CardClass}.
   * @param {JSON} obj - information mimimum pour créer une carte :
   *                     Carte simple = juste la couleur ;
   *                     Carte complexe = les 2 cartes qui la compose & la liaison
   * @param {number} i - numéro de l'id
   * @returns un objet {@link CardClass}
   */
  const toClass = (obj, i) => {
    // si c'est une carte complexe
    if (obj.color === undefined) return new CardClass(i, null, false, obj.link, toClass(obj.left, 0), toClass(obj.right, 1));
    // si c'est une carte simple
    else return new CardClass(i, obj.color, false,"", null, null);
  }

  /**
   * Compare l'objectif (game[game.length-1][currentDeck]) et toutes les cartes du deck currentDeck :
   * si on vérifie le deck 0, renvoie true si on trouve l'objectif ;
   * si on ne vérifie pas le deck 0, si l'objectif est dans le deck on ajoute l'objectif au dessus du deck précédent et 
   * on regarde le deck en dessous (currentDeck-1) pour voir si la carte ajoutée n'est pas l'objectif du dessus.
   * @param {number} currentDeck - le Deck le plus élevé
   * @returns true ou false
   */
  const isWin = (currentDeck) => {
    const objectif = game[game.length-1][currentDeck];
    let bool = false;
    game[currentDeck].forEach(card => {
      if (card !== null) {
        if (card.equals(objectif)) {
          if (currentDeck === 0) bool = true;
          else {
            let tmp = [...game];
            tmp[currentDeck] = null;
            tmp[game.length-1][currentDeck] = null;
            let tmpCard = game[game.length-1][currentDeck-1].copy();
            tmpCard.id = tmp[currentDeck-1].length;
            tmp[currentDeck-1].push(tmpCard);
            setGame(tmp);
            bool = isWin(currentDeck-1);
          }
        }
      }
    })
    return bool;
  }

  /**
   * Les vérifications de la carte sont faites dans la méthode {@link update()} (si carte dans le deck objectif et a comme liaison "=>")
   * creer un deck juste avant l'objectif et lui passe une nouvelle carte (la partie gauche de la carte selectionner)
   * creer une carte dans la partie objectif qui est une objectif secondaire
   */
  const emprunt = () =>{
    setPopupEmprunt(false);
    let tmp = [...game];
    tmp[selecDeck1][selecCard1].select(false);
    let tmpObjectif = [...game[game.length-1]];
    let tmpCard = game[selecDeck1][selecCard1].right.copy()
    tmpCard.id = game[game.length-1].length;
    tmpCard.select(false);
    tmpObjectif.push(tmpCard)
    tmp[game.length-1] = [];
    tmpCard = game[selecDeck1][selecCard1].left.copy();
    tmpCard.id = 0;
    tmpCard.select(false);
    tmp[game.length-1].push(tmpCard);
    tmp.push(tmpObjectif);
    setGame(tmp);
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
  }

  /**
   * Fonction appelée après avoir sélectionner une carte avec une liaison "et".
   * Ajoute la partie gauche et droite de la carte au {@link Deck}.
   */
  const addTwoCard = () => {
    let tmpLastGame = [...lastGame];
    let saveGameTmp = [];
    for (var i = 0 ; i < game.length ; i++) {
      if (game[i] !== null) {
        saveGameTmp[i] = [];
        for (var j = 0 ; j < game[i].length ; j++) {
          if (game[i][j] !== null) saveGameTmp[i].push(game[i][j].copy());
          else saveGameTmp.push(null);
        }
      }
      else saveGameTmp.push(null);
    }
    tmpLastGame.push(saveGameTmp);
    setLastGame(tmpLastGame);
    let tmp = [...game];
    game[selecDeck1][selecCard1].select(false);
    tmp[selecDeck1].push(game[selecDeck1][selecCard1].left.copy());
    tmp[selecDeck1][tmp[selecDeck1].length-1].id = tmp[selecDeck1].length-1;
    tmp[selecDeck1].push(game[selecDeck1][selecCard1].right.copy());
    tmp[selecDeck1][tmp[selecDeck1].length-1].id = tmp[selecDeck1].length-1;

    setGame(tmp);
    setPopupGetCard(false);
    allFalse();
  }

  /**
   * Prend le dernier élément du tableau {@link lastGame} et remplace la variable {@link game}.
   * (ne marche pas)
   */
  const retourEnArriere = () => {
    if (lastGame.length !== 0) {
      let tmpLastGame = [...lastGame];
      let tmpSavedGame = tmpLastGame[tmpLastGame.length-1];
      let tmpFutureGame = [];
      for (var i = 0 ; i < tmpSavedGame.length ; i++) {
        if (tmpSavedGame[i] !== null) {
          tmpFutureGame[i] = [];
          for (var j = 0 ; j < tmpSavedGame[i].length ; j++) {
            if (tmpSavedGame[i][j] !== null) tmpFutureGame[i].push(tmpSavedGame[i][j].copy());
            else tmpFutureGame.push(null);
          }
        }
        else tmpFutureGame.push(null);
      }
      console.log(tmpFutureGame);
      // fonction allFalse() mais si appellée elle ne marche pas car executée de manière asynchrone
      setNbSelec(0);
      setSelecCard1(-1);
      setSelecDeck1(-1);
      setSelecCard2(-1);
      setSelecDeck2(-1);
      tmpFutureGame.forEach((e) => {
        e.forEach((s) => {
          if (s !== null) {
            s.select(false);
          }
        });
      });
      //////////////////////////////
      setGame(tmpFutureGame);
      tmpLastGame.pop();
      setLastGame(tmpLastGame);
    }

}

  /**
   * À la base la fonction qui sauvegarde la partie qui est pour l'instant recopié 3 fois dans les autres fonctions
   * car ne fonctionne pas en appelant une fonction (asynchrone).
   */
  const saveGame = () => {
    let tmpLastGame =  [...lastGame];
    let saveGameTmp = [];
    for (var i = 0 ; i < game.length ; i++) {
      if (game[i] !== null) {
        saveGameTmp[i] = [];
        for (var j = 0 ; j < game[i].length ; j++) {
          if (game[i][j] !== null) saveGameTmp[i].push(game[i][j].copy());
          else saveGameTmp.push(null);
        }
      }
      else saveGameTmp.push(null);
    }
    tmpLastGame.push(saveGameTmp);
    setLastGame(tmpLastGame);
  }

  return (
    <div className="game" >
      {mode === "create" && (<button onClick={saveAsFile}>Convertir en fichier</button> )}
      {mode === "create" && (<button onClick={openFile}>Ouvrir un fichier</button> )}
      <button onClick={retourEnArriere}>Retour en arrière</button>
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
          deck !== null ? (
            <Deck
              updateGame     = {update}
              indice         = {index}
              addCardFunc    = {addCard}
              deleteCardFunc = {setPopupDeleteCard}
              nbDeck         = {game.length}
              mode           = {mode}
              key            = {index}
            ></Deck>
          ) : (
          <></>
          )
        ))}
      </GameTab.Provider>
      {popupSelect && (selecCard1 > -1 && selecCard2 > -1 && selecDeck1 > -1 && selecDeck2 > -1 ) && (
        <Popup
          content={
            <>
              <b>
                Voulez-vous fusionner cette carte{" "}
                {game[selecDeck1][selecCard1].toString()} avec celle-ci{" "}
                {game[selecDeck2][selecCard2].toString()}?
              </b>
              <br></br>
              <button onClick={fusion}>Oui</button>
              <button onClick={closePopup}>Annuler</button>
            </>
          }
        />
      )}
      {popupError && (selecCard1 > -1 && selecCard2 > -1 && selecDeck1 > -1 && selecDeck2 > -1 ) && (
        <Popup
          content={
            <>
              <b>
                Vous ne pouvez fusionner cette carte{" "}
                {game[selecDeck1][selecCard1].toString()}  avec celle-ci{" "}
                {game[selecDeck2][selecCard2].toString()}.
              </b>
              <br></br>
              <button onClick={closePopup}>Fermer</button>
            </>
          }
        />
      )}
      {popupGetCard && (selecCard1 !== -1 && selecDeck1 !== -1) && (
        <Popup
          content={
            <>
              <b>
                Voulez-vous ajouter les cartes {" "}
                {game[selecDeck1][selecCard1].left.toString()} et 
                {" " + game[selecDeck1][selecCard1].right.toString()} au deck numero {selecDeck1+1}?
              </b>
              <br></br>
              <button onClick={addTwoCard}>Oui</button>
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
                <input type="radio" value="et" name="liaison" /> et
                <input type="radio" value="=>" name="liaison" /> {"=>"}
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
                Voulez-vous supprimer cette carte{" "}
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
      {popupWin && (
        <Popup
          content={
            <>
              <b>Bravo vous avez gagné</b>
              <button
                onClick={function () {
                  setPopupWin(false);
                }}
              >
                Fermer
              </button>
            </>
          }
        />
      )}
      {popupEmprunt && (
        <Popup
          content={
            <>
              <b>Voulez vous emprunter cette carte {game[selecDeck1][selecCard1].toString()} ?</b>
              <button onClick={emprunt}> Oui </button>
              <button
                onClick={function () {
                  setPopupEmprunt(false);
                  allFalse();
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
