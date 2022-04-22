import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from 'react-router-dom';
import Deck from "./Deck";
import Popup from "./Popup";
export const GameTab = React.createContext();

class CardClass {
  /**
   * @param {number} id
   * @param {string|null} color - couleurs disponibles :
   *                              rouge  ("red")    ;
   *                              jaune  ("yellow") ;
   *                              bleu   ("blue")   ;
   *                              orange ("orange")
   * @param {true|false} active
   * @param {""|"et"|"=>"} link -  ""  = carte simple ;
   *                              "et" = liaison "et" ;
   *                              "=>" = liaison "⇒"
   * @param {CardClass|null} left
   * @param {CardClass|null} right
   */
  constructor(id, color, active, link, left, right) {
    this.id     = id;
    this.color  = color;
    this.active = active;
    this.link   = link;
    this.left   = left;
    this.right  = right;
  }

  /**
   * Renvoie un objet {@link CardClass} sous la forme d'un string.
   * Carte simple : (couleur)
   * Carte double : (couleur) liaison (couleur)
   * Carte triple : (couleur) liaison ((couleur) liaison (couleur))
   * Carte quadruple : ((couleur) liaison (couleur)) liaison ((couleur) liaison (couleur))
   * @example ((rouge) ∧ (jaune)) ⇒ (bleu)
   * @returns {string} un string plus lisible
   */
  toString() {
    let res = "(";
    if (this.color  != null) res += this.color.toString();
    if (this.left  !== null) res += this.left.toString();
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
   *           },
   *   "link": "=>",
   *   "right": {
   *              "left": { "color": "couleur" },
   *              "link": "et",
   *              "right": { "color": "couleur" }
   *            }
   * }
   * @returns {JSON} - à stocker dans un fichier .json
   */
  toFile() {
    if (this.color !== null) return { color: this.color };
    else return {
      left:  this.left.toFile(),
      link:  this.link,
      right: this.right.toFile(),
    };
  }

  /**
   * Renvoie une nouvelle instance d'une carte.
   * Si la carte est composée de 2 autres cartes ces dernières sont également de nouvelles instances.
   * @returns {CardClass} une nouvelle instance d'une même carte
   */
  copy() {
    let l = null;
    let r = null;
    if (this.left  !== null) l = this.left.copy();
    if (this.right !== null) r = this.right.copy();
    return new CardClass(this.id, this.color, this.active, this.link, l, r);
  }

  /**
   * Fonction récursive qui :
   * change l'attribut 'active' ;
   * regarde si left & right sont null, si ils ne le sont pas on appelle la même fonction sur eux.
   * @param {CardClass}   card - la carte qui doit être sélectionnée ou pas
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
   * @returns {true|false} true si identiques sinon false
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
   * @returns {true|false} true si simple/double sinon false
   */
  isSimpleOrDouble() {
    if (this.color !== null) return true;
    if (this.left.color !== null && this.right.color !== null) return true;
    else return false;
  }
}

const Game = ({ mode, ex,numero  }) => {
  const [game, setGame] = useState([[]]);
  const [nbSelec, setNbSelec] = useState(0);
  const [selecDeck1, setSelecDeck1] = useState(-1);
  const [selecCard1, setSelecCard1] = useState(-1);
  const [selecDeck2, setSelecDeck2] = useState(-1);
  const [selecCard2, setSelecCard2] = useState(-1);
  const [popupAddCard, setPopupAddCard] = useState(false);
  const [popupDeleteCard, setPopupDeleteCard] = useState(false);
  const [indiceDeckAddCard, setIndiceDeckAddCard] = useState(0);
  const [popupFusion, setPopupFusion] = useState(false);
  const [popupWin,setPopupWin] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const [lastGame, setLastGame] = useState([]);
  const [messageErreur, setMessageErreur] = useState("");
  const [tabObjectif , setTabObjectif] = useState([[0,0]]);
  const [convertMessage , setConvertMessage] = useState();

  /**
   * Initialise l'exercice.
   */
  useEffect(() => {
    
    setGame([[], []]);
    if (ex !== undefined && numero !== undefined && mode !== "Create") {
      setGame(gameInput(ex[numero]));
    }

  }, [mode, ex, numero])

  /**
   * Renvoie un nouveau Deck sans la carte passée en paramètre.
   * @param {Array}        deck - Deck dans lequel il faut supprimer la carte
   * @param {number} indiceCard - indice de la carte à supprimer
   * @returns {Array}
   */
  const delCard = (deck, indiceCard) => {
    let finalDeck = [];
    deck[indiceCard] = null;
    let cpt = 0;
    for (let i = 0; i < deck.length; i++) {
      if (deck[i] !== null) {
        let tmpCard = deck[i];
        tmpCard.id = tmpCard.id - cpt;
        finalDeck.push(tmpCard);
      }
      else cpt++;
    }
    return finalDeck;
  } 

  /**
   * Renvoie un nouveau tableau sans le Deck passé en paramètre.
   * @param {Array} currentGame - tableau de la partie (avec potentiellement des modifications)
   * @param {number} indiceDeck - indice du Deck à supprimer
   * @returns 
   */
  const delDeck = (currentGame, indiceDeck) => {
    let finalGame = [];
    currentGame[indiceDeck] = null;
    for (let i = 0;i<currentGame.length;i++) {
      if (currentGame[i] !== null) finalGame.push(currentGame[i]);
    }
    return finalGame;
  }

  /**
   * La carte qui est déjà sélectionnée & celle qui est passée en paramètre utilisent la fonction {@link CardClass.select()} 
   * qui sélectionne toutes les cartes dans le Deck ou déselectionne la première carte sélectionnée si on reclique dessus.
   * Enfin, si on sélectionne une 2ème carte, on appelle la fonction popup qui s'occupera de valider le choix & d'exécuter
   * l'opération.
   * @param {number} i - index du Deck
   * @param {number} j - index de la carte
   */
  const update = (i, j) => {
    let tmp = [...game];
    let currentCard = tmp[i][j];
    let tmpNbselec = nbSelec;
    let tmpSelecDeck1 = selecDeck1;
    let tmpSelecDeck2 = selecDeck2;
    let tmpSelecCard1 = selecCard1;
    let tmpSelecCard2 = selecCard2;
    if ((i === game.length-1 && game[i][j].link === "=>" && mode !== "Create") || i !== game.length-1 || mode === "Create") {
      if (tmpSelecDeck1 === i && tmpSelecCard1 === j) {
        tmpSelecCard1 = -1;
        tmpSelecDeck1 = -1;
        tmpNbselec--;
        currentCard.select(!currentCard.active);
      }
      else if (tmpSelecDeck2 === i && tmpSelecCard2 === j) {
        tmpSelecCard2 = -1;
        tmpSelecDeck2 = -1
        tmpNbselec--;
        currentCard.select(!currentCard.active);
      }
      else if (tmpSelecDeck1 === -1 && tmpSelecCard1 === -1) {
        tmpSelecDeck1 = i;
        tmpSelecCard1 = j;
        tmpNbselec++;
        currentCard.select(!currentCard.active);
      }
      else if (tmpNbselec < 2) {
        tmpSelecDeck2 = i;
        tmpSelecCard2 = j;
        tmpNbselec++;
        currentCard.select(!currentCard.active);
      }
    }
    setNbSelec(tmpNbselec);
    setSelecCard1(tmpSelecCard1);
    setSelecCard2(tmpSelecCard2);
    setSelecDeck1(tmpSelecDeck1);
    setSelecDeck2(tmpSelecDeck2);
    tmp[i][j] = currentCard;
    setGame(tmp);
    if (tmpNbselec === 2 && mode === "Create") setPopupFusion(true);
    
  };

  /**
   * Déselectionne toute les cartes dans le tableau recu et devien le jeu.
   */
  const allFalse = (tmp) => {
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-1);
    setSelecDeck2(-1);
    tmp.forEach((e) => {
      e.forEach((s) => {
        s.select(false);
      });
    });
    setGame(tmp);
  };

  /**
   * Déselectionne toute les cartes du jeu.
   */
  const allFalseGame = () => {
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-1);
    setSelecDeck2(-1);
    let tmp = [...game];
    tmp.forEach((e) => {
      e.forEach((s) => {
        s.select(false);
      });
    });
    setGame(tmp);
  };

  /**
   * Ferme le popup & désélectionne toutes les cartes.
   */
  const closePopup = () => {
    setPopupError(false);
    setMessageErreur("Aucun message d'erreur prévu :(");
    allFalseGame();
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
    saveGame();
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
    allFalse(tmp);
  };

  /**
   * Crée une carte complexe avec les 2 cartes sélectionnées (cette fonction est appelée à la fin de {@link update()} en mode création).
   * @param {*} event (event.target.value) - reçoit la liaison cliquée
   */
  const choixLiaison = (event) => {
    saveGame();
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
    setPopupFusion(false);
    allFalse(tmp);
  };

  /**
   * Supprime la carte qui est sélectionnée.
   */
  const deleteCard = () => {
    setPopupDeleteCard(false);
    if (!(selecCard1 === -1 && selecDeck1 === -1)) {
      saveGame();
      let tmp = [...game];
      tmp[selecDeck1] = delCard(game[selecDeck1],selecCard1);
      allFalse(tmp);
    }
    else allFalseGame();
  };

  /**
   * Transforme le tableau en tableau d'objets avec seulement les informations qui nous intéressent (couleur/liaison).
   *
   * @returns un tableau d'objets
   */
  const gameOutput = () => {
    let res = [[], []];
    game.map(function (deck, index) {
      deck.map(function (card) {
        res[index].push(card.toFile());
        return 0;
      });
      return 0;
    });
    return res;
  };

  /**
   * Reçoit un tableau d'un fichier JSON à qui on va appliquer la méthode {@link JSON.parse()} dans {@link openFile()}
   * ({@link JSON} ⇒ tableau d'{@link Object}) et renvoie un tableau qui peut être lu par notre site.
   * @param {Object[]} data - tableau d'objets qui va servir pour l'initialisation
   * @returns un tableau de Deck
   */
  const gameInput = (data) => {
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
    let res;
    res = gameOutput(game);
    navigator.clipboard.writeText(JSON.stringify(res, null, 1)).then(() => {})
  };

  /**
   * Pour l'instant ouvre le fichier Ex1.json.
   */
  const openFile = (event) => {
    if(event.target.files.length >0)
    {
      var reader = new FileReader();
      reader.onload = onReaderLoad;
      reader.readAsText(event.target.files[0]);
    }

  }
  const onReaderLoad = (event) =>{
      var obj = JSON.parse(event.target.result);
      setGame(gameInput(obj));
  }


  /**
   * Transforme un objet JSON en instance {@link CardClass}.
   * @todo Modifier pour que cela marche avec Ex.json.
   * @param {JSON} obj - information mimimum pour créer une carte :
   *                     Carte simple = juste la couleur ;
   *                     Carte complexe = les 2 cartes qui la compose & la liaison
   * @param {number} i - numéro de l'id
   * @returns {CardClass} une carte
   */
  const toClass = (obj, i) => {
    // si c'est une carte complexe
    if (obj.color === undefined) return new CardClass(i, null, false, obj.link, toClass(obj.left, 0), toClass(obj.right, 1));
    // si c'est une carte simple
    else return new CardClass(i, obj.color, false, "", null, null);
  }

  /**
   * Compare l'objectif (game[game.length-1][currentDeck]) et toutes les cartes du deck currentDeck :
   * si on vérifie le deck 0, renvoie true si on trouve l'objectif ;
   * si on ne vérifie pas le deck 0, si l'objectif est dans le deck on ajoute l'objectif au dessus du deck précédent et 
   * on regarde le deck en dessous (currentDeck-1) pour voir si la carte ajoutée n'est pas l'objectif du dessus.
   * @param {number} currentDeck - le Deck le plus élevé
   * @returns {true|false} true ou false
   */
  const isWin = (currentDeck) => {
    const objectif = game[game.length-1][tabObjectif[currentDeck][1]];
    let bool = false;
    game[currentDeck].forEach(card => {
      if (card.equals(objectif)) {
        if (currentDeck === 0) bool = true;
        else {
          let tmp = [...game];
          tmp = delDeck(tmp, currentDeck);
          tmp[tmp.length-1] = delCard(tmp[tmp.length-1],tabObjectif[currentDeck][1]);
          if(tabObjectif[currentDeck][1]-1 !== tabObjectif[currentDeck-1][1]){
            tmp[tmp.length-1] = delCard(tmp[tmp.length-1],tabObjectif[currentDeck][1]-1);
          }
          let tmpCard = game[game.length-1][tabObjectif[currentDeck][1]-1].copy();
          tmpCard.id = tmp[tabObjectif[currentDeck][1]-1].length;
          tmp[currentDeck-1].push(tmpCard);
          setGame(tmp);
          let tmpObj = [...tabObjectif];
          tmpObj.pop();
          setTabObjectif(tmpObj);
          bool = isWin(currentDeck-1);
        }
      }
    })
    return bool;
  }


  /**
   * Prend le dernier élément du tableau {@link lastGame} et remplace la variable {@link game}.
   * (ne marche pas)
   */
  const retourEnArriere = () => {
    if (lastGame.length !== 0) {
      let tmpLastGame   = [...lastGame];
      let tmpSavedGame  = tmpLastGame[tmpLastGame.length-1];
      let tmpFutureGame = [];
      for (var i = 0 ; i < tmpSavedGame.length ; i++) {
        tmpFutureGame[i] = [];
        for (var j = 0 ; j < tmpSavedGame[i].length ; j++) {
          tmpFutureGame[i].push(tmpSavedGame[i][j].copy());
        }
      }
      allFalse(tmpFutureGame);
      tmpLastGame.pop();
      setLastGame(tmpLastGame);
    }
  }

  /**
   * À la base la fonction qui sauvegarde la partie qui est pour l'instant recopié 3 fois dans les autres fonctions
   * car ne fonctionne pas en appelant une fonction (asynchrone).
   */
  const saveGame = () => {
    let tmpLastGame = [...lastGame];
    let saveGameTmp = [];
    for (var i = 0 ; i < game.length ; i++) {
      saveGameTmp[i] = [];
      for (var j = 0 ; j < game[i].length ; j++) {
        saveGameTmp[i].push(game[i][j].copy());
      }
    }
    tmpLastGame.push(saveGameTmp);
    setLastGame(tmpLastGame);
  }

  /**
   * Fonction appelée après avoir appuyé sur le bouton "Ajouter carte et".
   * 
   * Une seule et unique carte doit être sélectionner sinon un popup d'erreur apparaît avec ce message : 
   *    Si deux cartes sont sélectionnées :  "Vous devez sélectionner une seule carte !"
   *    Si zéro carte sont sélectionnées  :  "Vous devez sélectionner une carte !" 
   * 
   * La carte sélectionner doit avoir une liaison principale de type "et" sinon un popup d'erreur apparait avec ce message :
   *    "La carte sélectionnée doit avoir une liaison principale de type "et" !"
   * 
   * Si toutes les conditions énumérées au-dessus sont respectées les parties gauche et droite de la carte sont ajoutées au Deck.
   */
  const addCardAnd = () => {
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      let deckI = Math.max(selecDeck1,selecDeck2);
      let cardI = Math.max(selecCard1,selecCard2);
      if (game[deckI][cardI].link === "et") {
        saveGame();
        let tmp = [...game];
        game[deckI][cardI].select(false);
        tmp[deckI].push(game[deckI][cardI].left.copy());
        tmp[deckI][tmp[deckI].length-1].id = tmp[deckI].length-1;
        tmp[deckI].push(game[deckI][cardI].right.copy());
        tmp[deckI][tmp[deckI].length-1].id = tmp[deckI].length-1;
        allFalse(tmp);
        setPopupWin(isWin(selecDeck1));
      }
      else {
        setMessageErreur("La carte sélectionnée doit avoir une liaison principale de type \"et\" !");
        setPopupError(true);
      }
    }
    else {
      if (nbSelec > 1)   setMessageErreur("Vous devez sélectionner une seule carte !");
      if (nbSelec === 0) setMessageErreur("Vous devez sélectionner une carte !")
      setPopupError(true);
    }
  }

  /**
   * Fonction appelée après avoir appuyé sur le bouton "Ajouter carte =>".
   * 
   * Deux carte sont demander pour faire fonctionner cette fonction sinon un popup d'erreur apparaît avec ce message :  
   *    "Vous devez sélectionner deux cartes !"
   * 
   * Au moins une des deux cartes doit avoir une liaison principale du type "=>" sinon un popup d'erreur apparaît avec ce message :
   *    Une des deux cartes doit avoir une liaison principale de type "=>" !"
   * 
   * La partie gauche de la carte la plus complexe doit être égale à l'autre carte sinon un popup d'erreur apparaît avec ce message :
   *    "La partie gauche de la carte "=>" doit être égale à la deuxième carte sélectionnée !"
   * 
   * Si toutes les conditions énumérées au-dessus sont respectées la partie droite est ajoutée au deck le plus haut.
   */
  const addCardFuse = () => {
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      let tmp   = [...game];
      let bool  = (tmp[selecDeck2][selecCard2].link === "=>" && tmp[selecDeck2][selecCard2].left.equals(tmp[selecDeck1][selecCard1]));
      if (bool || (tmp[selecDeck1][selecCard1].link === "=>" && tmp[selecDeck1][selecCard1].left.equals(tmp[selecDeck2][selecCard2]))) {
        saveGame();
        let finalDeck = Math.max(selecDeck1,selecDeck2);
        let deckCarteComplex = -1;
        let cardCarteComplex = -1;
        if (bool) {
          deckCarteComplex = selecDeck2;
          cardCarteComplex = selecCard2;
        }
        else {
          deckCarteComplex = selecDeck1;
          cardCarteComplex = selecCard1;
        }

        tmp[finalDeck].push(tmp[deckCarteComplex][cardCarteComplex].right.copy());
        tmp[finalDeck][tmp[finalDeck].length-1].id = tmp[finalDeck].length-1;
        allFalse(tmp);
        setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
      }
      else {
        if (tmp[selecDeck2][selecCard2].link !== "=>" && tmp[selecDeck1][selecCard1].link !== "=>") {
          setMessageErreur("Une des deux cartes doit avoir une liaison principale de type \"=>\" !");
        }
        else {
          setMessageErreur("La partie gauche de la carte \"=>\" doit être égale à la deuxième carte sélectionnée !")
        }
        setPopupError(true);
      }
    }
    else {
      setMessageErreur("Vous devez sélectionner deux cartes !");
      setPopupError(true);
    }
  }

  /**
   * Fonction appelée après avoir appuyé sur le bouton "Fusion carte et".
   * 
   * Deux cartes sont demandées pour faire fonctionner cette fonction sinon un popup d'erreur apparaît avec ce message :  
   *    "Vous devez sélectionner deux cartes !"
   * 
   * Les cartes acceptées pour la fusion sont les cartes simples et doubles sinon un popup d'erreur apparaît avec ce message :  
   *    "On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : (la carte qui pose un problème)"
   * 
   * Si toutes les conditions énumérées au-dessus sont respectées les deux cartes fusionnent en une nouvelle carte qui prend la liaison "et" dans le deck le plus haut des deux cartes.
   */
  const fuseCardAdd = () => {
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      let tmp   = [...game];
      let bool  = tmp[selecDeck1][selecCard1].isSimpleOrDouble();
      if (bool && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
        saveGame();
        let finalDeck = Math.max(selecDeck1,selecDeck2);
        let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
        let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
        tmpCard1.id = 0;
        tmpCard2.id = 1;
        tmp[finalDeck].push(new CardClass(tmp[finalDeck].length,null,false,"et",tmpCard1,tmpCard2));
        allFalse(tmp);
        setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
      }
      else {
        if (bool) {
          setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck2][selecCard2].toString());
        }
        else {
          setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck1][selecCard1].toString());
        }
        setPopupError(true);
      }
    }
    else {
      setMessageErreur("Vous devez sélectionner deux cartes !");
      setPopupError(true);
    }
  }

  /**
   * Exactement la même fonction que {@link fuseCardAdd()} sauf que la carte créée a une liaison "=>".
   */
  const fuseCardFuse = () => {
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      let tmp   = [...game];
      tmp[selecDeck1][selecCard1].select(false);
      tmp[selecDeck2][selecCard2].select(false);
      let bool  = tmp[selecDeck1][selecCard1].isSimpleOrDouble();
      if (bool && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
        saveGame();
        let finalDeck = Math.max(selecDeck1,selecDeck2);
        let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
        let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
        tmpCard1.id = 0;
        tmpCard2.id = 1;
        tmp[finalDeck].push(new CardClass(tmp[finalDeck].length,null,false,"=>",tmpCard1,tmpCard2));
        allFalse(tmp);
        setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
      }
      else {
        if (bool) {
          setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck2][selecCard2].toString());
        }
        else {
          setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck1][selecCard1].toString());
        }
        setPopupError(true);
      }
    }
    else {
      setMessageErreur("Vous devez sélectionner deux cartes !");
      setPopupError(true);
    }
  }

  const addObjectif = () =>{
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      let deckI = Math.max(selecDeck1,selecDeck2);
      let cardI = Math.max(selecCard1,selecCard2);
      if (game[deckI][cardI].link === "=>"){
        let secondObjectif;
        let tmp = [...game];
        let tmpObjectif = [...game[game.length-1]];
        saveGame();
        let tmpCard;
        if (deckI === game.length-1){
          secondObjectif = game[selecDeck1][selecCard1].right.copy();
          tmp[game.length-1] = [];
          tmpCard = game[selecDeck1][selecCard1].left.copy();
          tmpCard.id = 0;
          tmp[game.length-1].push(tmpCard);
          tmp.push(tmpObjectif);
          secondObjectif.id = game[game.length-1].length;
          tmpObjectif.push(secondObjectif)
          let tmpObj = [...tabObjectif];
          tmpObj.push([tabObjectif.length,game[game.length-1].length]);
          setTabObjectif(tmpObj);
        }
        else{          
          secondObjectif = game[selecDeck1][selecCard1].left.copy();
          secondObjectif.id = game[game.length-1].length;
          tmpObjectif.push(secondObjectif)        
          tmp[tmp.length-1] = tmpObjectif;
        }
        allFalse(tmp);
      }
    }
  }

  const navigate = useNavigate();
  const changeExercise = (event) =>{
    let value = event.target.value;
    if(value !== ""){
      let url = "/Exercise" +mode + value ;
      navigate(url);
    }

  }
  let test = "";
  const convertFile = (event) =>{
    if(event.target.files.length >0)
    {
      
      Array.from(event.target.files).forEach((element) =>{
        var reader = new FileReader();
        reader.onload = event =>{
          test += event.target.result + ",";
        }
        reader.readAsText(element);
      })
    }
  }
  
  const printConvertFile = () =>{
    navigator.clipboard.writeText("[" + test.substring(0,test.length-1) + "]").then(() => {})
  }
  return (
    <div className="game" >
      <div className="bouton">
        {mode !== "Create" && <select name="exo" id="exo-select" onChange={changeExercise}>
        <option value="">Choisir un exercice</option>
          {ex.map((exercise,index) =>(
            <option key={index} value={index+1} >Exercice {index+1}</option>
          ))}
          
      </select>}
      {mode === "Create" && <input type="file" accept="application/json" multiple="multiple" onChange={convertFile} ></input>}
      {mode === "Create" && <button onClick={printConvertFile}>Copier les fichiers regrouper</button>}
      {mode === "Create" && <input type="file" accept="application/json" onChange={openFile} ></input>}
      {mode === "Create" && <button onClick={saveAsFile}>Copier le fichier</button>}
        <button onClick={retourEnArriere}>Retour en arrière</button>
        {mode !== "Create" && <button onClick={addCardAnd}>Ajout carte et</button>}
        {mode !== "Create" && <button onClick={addCardFuse}>Ajout carte {"=>"}</button>}
        {mode !== "Create" && <button onClick={fuseCardAdd}>Fusion carte et</button>}
        {mode !== "Create" && <button onClick={fuseCardFuse}>Fusion carte {"=>"}</button>}
        {mode !== "Create" && <button onClick={addObjectif}>Ajout objectif</button>}
      </div>
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
            <Deck
              updateGame     = {update}
              indice         = {index}
              addCardFunc    = {addCard}
              deleteCardFunc = {setPopupDeleteCard}
              nbDeck         = {game.length}
              mode           = {mode}
              key            = {index}
            ></Deck>
        ))}
      </GameTab.Provider>
      {popupError && (
        <Popup
          content={
            <>
              <b>
                {messageErreur}
              </b>
              <br></br>
              <button onClick={closePopup}>Fermer</button>
            </>
          }
        />
      )}
      {popupAddCard && (
        <Popup
          content={
            <>
              <b>Choisissez une couleur</b>
              <div onChange={choixCouleur}>
                <input type="radio" value="red"    name="couleur" /> Rouge
                <input type="radio" value="yellow" name="couleur" /> Jaune
                <input type="radio" value="blue"   name="couleur" /> Bleu
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
              <b>Bravo, vous avez gagné !</b>
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
    </div>
  );
};

export default Game;
