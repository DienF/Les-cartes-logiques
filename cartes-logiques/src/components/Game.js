import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Deck from "./Deck";
import Popup from "./Popup";
export const GameTab = React.createContext();
var Latex = require("react-latex");

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
   * Traduit la couleur de la carte, de base en anglais, en français afin de l'afficher en format LaTeX.
   * @param {string} color - la couleur de la carte
   * @returns {string} la traduction de la couleur
   */
  getColor = (color) => {
    switch (color) {
      case "red":
        return "\\textit{Rouge}";
      case "yellow":
        return "\\textit{Jaune}";
      case "blue":
        return "\\textit{Bleue}";
      case "orange":
        return "\\textit{Orange}";
      default:
        return "Non definie"
    }
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
    let res = "";
    // Couleur de la carte
    if (this.color !== null) res += this.getColor(this.color);
    // Carte gauche
    if (this.left  !== null) res += "(" + this.left.toString();
    // Liaison
    if      (this.link === "et")  res += "\\land";
    else if (this.link === "=>")  res += "\\Rightarrow";
    else if (this.link === "<=>") res += "\\Leftrightarrow";
    else                          res += this.link;
    // Carte droite
    if (this.right !== null) res += this.right.toString() + ")";
    return res;
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

  /**
   * Renvoie la démonstration correspondante à l'action effectuée.
   */
  toDemonstration() {
    if      (this.color !== null) return "$$\\text{On a }"    + this.getColor(this.color)                                                 + ".$$";
    else if (this.link  === "et") return "$$\\text{On a }"    + this.left.toString() + "\\text{ }\\land\\text{ }" + this.right.toString() + ".$$";
    else                          return "$$\\text{Puisque }" + this.left.toString() + "\\text{, on a }"          + this.right.toString() + ".$$";
  }
}

const Game = ({ mode, ex, numero }) => {
  // Carte qui n'existera jamais dans un deck
  var cardError = new CardClass(-1, "error", false, null, null); 

  /** Tableau où sont réunies toutes les cartes & decks.
   *  Il est disposé de cette manière :
   *  ┌─────────────┬────────────────────┬───────────────┐
   *  │ Deck départ │ Deck sous-objectif │ Deck objectif │
   *  ├─────────────┼────────────────────┼───────────────┤
   *  │ game[0]     │ game[...]          │ game[n-1]     │
   *  ├─────────────┼────────────────────┼───────────────┤
   *  │ game[0][0]  │ game[...][0]       │ game[n-1][0]  │
   *  ├─────────────┼────────────────────┴───────────────┘
   *  │ game[0][1]  │
   *  ├─────────────┤
   *  │ game[0][2]  │
   *  └─────────────┘
   *  - game[0][0]   = une carte
   *  - game[...][0] = la partie gauche d'un objectif =>
   *  - game[n-1][0] = objectif principal
   */
  const [game, setGame] = useState([[]]);

  // Le nombre de cartes sélectionnées
  const [nbSelec, setNbSelec] = useState(0);

  // Indice du deck de la 1ère carte sélectionnée
  const [selecDeck1, setSelecDeck1] = useState(-1);

  // Indice de la carte dans le deck de la 1ère carte sélectionnée
  const [selecCard1, setSelecCard1] = useState(-1);

  // Indice du deck de la 2ème carte sélectionnée
  const [selecDeck2, setSelecDeck2] = useState(-1);

  // Indice de la carte dans le deck de la 2ème carte sélectionnée
  const [selecCard2, setSelecCard2] = useState(-1);

  /** Variable gérant le popup d'ajout de carte en mode création
   *  - false = on ne voit pas le popup
   *  - true  = on voit le popup
   */
  const [popupAddCard, setPopupAddCard] = useState(false);

  /** Variable gérant le popup de suppression de carte en mode création.
   *  - false = on ne voit pas le popup
   *  - true  = on voit le popup
   */
  const [popupDeleteCard, setPopupDeleteCard] = useState(false);

  /** Indice du deck dans lequel sera ajouté la carte en mode création avec le bouton "Ajout carte"
   *  ou en sélectionnant deux cartes en choisissant la liaision.
   */
  const [indiceDeckAddCard, setIndiceDeckAddCard] = useState(0);

  /** Popup en mode création pour choisir la liaision quand deux cartes sont sélectionnées.
   *  - false = on ne voit pas le popup
   *  - true  = on voit le popup
   */
  const [popupFusion, setPopupFusion] = useState(false);

  /** Popup quand on finit un exercice (objectif principal dans le deck 0).
   *  - false = on ne voit pas le popup
   *  - true  = on voit le popup
   */
  const [popupWin, setPopupWin] = useState(false);

  // Tableau de sauvegarde de copie de l'ancien tableau "game"
  const [lastGame, setLastGame] = useState([]);

  /** Message à afficher en cas de coup illégal.
   *  Si le message est "" on affiche rien.
   */ 
  const [messageErreur, setMessageErreur] = useState("");
  
  /** Message tutoriel à afficher en mode tutoriel.
   *  Attention c'est un tableau de strings.
   *  Si le message est "" on affiche rien.
   */ 
  const [messageTutoriel, setMessageTutoriel] = useState("");

  /** Tableau des objectifs.
   *  Sous cette forme : [numero objectif, indice de la carte dans le deck, (numero != indice)]
   *  Il se peut qu'il y ait des cartes entre les sous-objectifs comme dans l'exercice 5.
   */
  const [tabObjectif, setTabObjectif] = useState([[0, 0, false]]);

  /** Change les contours des cartes qui sont égales aux cartes help.
   *  Elles sont changées dans la fonction {@link getNextMove()}.
   */
  const [cardHelp, setCardHelp] = useState(cardError);
  const [cardHelp2, setCardHelp2] = useState(cardError);

  const [demonstration, setDemonstration] = useState([]);

  const [indentationDemonstration, setIndentationDemonstration] = useState(0);

  const [tabIndentation , setTabIndentation] = useState([0]);
  /** Variable pour les redirections.
   *  Utilisation : navigate(url)
   */ 
  const navigate = useNavigate();

  /** Variable qui reçoit les JSONs des fichiers.
   *  @see {@link convertFile()} & {@link printConvertFile()}
   */
  let filesCopy = "";

  /**
   * Initialise l'exercice.
   */
  useEffect(() => {
    setTabObjectif([[0, 0, false]]);
    setGame([[], []]);
    setLastGame([]);
    setIndentationDemonstration(0);
    setTabIndentation([0]);
    if (ex[numero] !== undefined && numero !== undefined && mode !== "Create") {
      try {      
        let tmp = gameInput(ex[numero]);
        let tmpDemonstration = [];
        let res = "";
        tmp[0].forEach(element => {
          res += "$$\\text{On a }" + element.toString() + "\\text{. }$$";
        });
        if (tmp.length === 2 && tmp[1].length > 0) res += "$$\\text{ Montrons }" + tmp[1][0].toString() +".$$";
        tmpDemonstration.push(res);
        setDemonstration(tmpDemonstration);
        allFalse(tmp);
      } catch (error) {
        
      }
    }
    setMessageErreur("");
    if (numero === 0) setMessageTutoriel(["Le but du jeu est de réussir à créer la carte qui est dans l’objectif dans le premier deck.", "Vous pouvez sélectionner une carte en cliquant dessus."])
    if (numero === 1) setMessageTutoriel(["Dans cet exercice nous allons apprendre le troisième bouton.", "Ce bouton a besoin de deux cartes pour fonctionner.", "Sélectionner deux cartes."])
    if (numero === 2) setMessageTutoriel(["Dans cet exercice nous allons apprendre le quatrième bouton.", "Ce bouton a besoin de deux cartes pour fonctionner.", "Sélectionner deux cartes."])
    if (numero === 3) setMessageTutoriel(["Dans cet exercice nous allons apprendre le dernier bouton.", "Pour faire fonctionner ce bouton on doit sélectionner l’objectif."])
  }, [mode, ex, numero])

  /**
   * Renvoie un nouveau deck sans la carte passée en paramètre.
   * @param {Array<CardClass>} deck - deck dans lequel il faut supprimer la carte
   * @param {number}     indiceCard - indice de la carte à supprimer
   * @returns {Array<CardClass>} le deck sans la carte d'indice {@link indiceCard}
   */
  const delCard = (deck, indiceCard) => {
    // Le deck que l'on va retourner
    let finalDeck = [];
    // Supprime la carte en la passant null
    deck[indiceCard] = null;
    let cpt = 0;
    // Recopie le deck sauf la carte qui vaut null
    for (let i = 0; i < deck.length; i++) {
      if (deck[i] !== null) {
        let tmpCard = deck[i];
        tmpCard.id = tmpCard.id - cpt;
        finalDeck.push(tmpCard);
      }
      else cpt++;
    }
    // Retourne le nouveau deck
    return finalDeck;
  } 

  /**
   * Renvoie un nouveau tableau sans le deck passé en paramètre.
   * @param {Array<Array<CardClass>} currentGame - tableau de la partie (avec potentiellement des modifications)
   * @param {number}                  indiceDeck - indice du Deck à supprimer
   * @returns {Array<Array<CardClass>} le jeu sans le deck d'indice {@link indiceDeck}
   */
  const delDeck = (currentGame, indiceDeck) => {
    // Le tableau du jeu que l'on va retourner
    let finalGame = [];
    // Supprime le deck en le passant null
    currentGame[indiceDeck] = null;
    // Recopie le jeu sauf le deck qui vaut null
    for (let i = 0; i < currentGame.length; i++) {
      if (currentGame[i] !== null) finalGame.push(currentGame[i]);
    }
    // Retourne le nouveau jeu
    return finalGame;
  }

  /**
   * La carte qui est déjà sélectionnée & celle qui est passée en paramètre utilisent la fonction {@link CardClass.select()} 
   * qui sélectionne toutes les cartes dans le Deck ou déselectionne la première carte sélectionnée si on reclique dessus.
   * Enfin, si on sélectionne une 2ème carte, on appelle la fonction popup qui s'occupera de valider le choix & d'exécuter
   * l'opération.
   * @param {number} i - index du deck
   * @param {number} j - index de la carte
   */
  const update = (i, j) => {
    // Met le message d'erreur en "" ce qui ne l'affiche plus
    setMessageErreur("");
    // N'affiche plus les deux cartes d'aide
    setCardHelp(cardError);
    setCardHelp2(cardError);
    // Copie du jeu dans tmp
    let tmp = [...game];
    // La carte sur laquelle on a cliqué
    let currentCard = tmp[i][j];
    // Copie du nombre de carte sélectionnée
    let tmpNbselec = nbSelec;
    // Copie de la 1ère carte sélectionnée
    let tmpSelecDeck1 = selecDeck1;
    let tmpSelecCard1 = selecCard1;
    // Copie de la 2ème carte sélectionnée
    let tmpSelecDeck2 = selecDeck2;
    let tmpSelecCard2 = selecCard2;
    /** Rentre dans le if si :
     *  - on ne clique pas sur l'objectif
     *  - le jeu n'est pas en mode Create
     *  - si on clique sur l'objectif et qu'il a une liaison =>
     */
    if ((i === game.length-1 && game[i][j].link === "=>" && mode !== "Create") || i !== game.length-1 || mode === "Create") {
      if (tmpSelecDeck1 === i && tmpSelecCard1 === j) {
        // Si la carte sélectionnée est déjà sélectionnée on la désélectionne (1ère carte)
        tmpSelecCard1 = -1;
        tmpSelecDeck1 = -1;
        tmpNbselec--;
        currentCard.select(!currentCard.active);
      }
      else if (tmpSelecDeck2 === i && tmpSelecCard2 === j) {
        // Si la carte sélectionnée est déjà sélectionnée on la désélectionne (2ème carte)
        tmpSelecCard2 = -1;
        tmpSelecDeck2 = -1
        tmpNbselec--;
        currentCard.select(!currentCard.active);
      }
      else if (tmpSelecDeck1 === -1 && tmpSelecCard1 === -1) {
        // Aucune carte n'est sélectionnée
        tmpSelecDeck1 = i;
        tmpSelecCard1 = j;
        tmpNbselec++;
        currentCard.select(!currentCard.active);
      }
      else if (tmpNbselec < 2) {
        // Une seule & unique carte est sélectionnée
        tmpSelecDeck2 = i;
        tmpSelecCard2 = j;
        tmpNbselec++;
        currentCard.select(!currentCard.active);
      }
    }
    // Affecte toute les variables temporaires aux vraies variables
    setNbSelec(tmpNbselec);
    setSelecCard1(tmpSelecCard1);
    setSelecCard2(tmpSelecCard2);
    setSelecDeck1(tmpSelecDeck1);
    setSelecDeck2(tmpSelecDeck2);
    // On remet la carte dans le jeu avec les changements
    tmp[i][j] = currentCard;
    // On actualise le jeu
    setGame(tmp);
    // Affiche le popup de fusion en mode création si 2 cartes sont séléctionnées
    if (tmpNbselec === 2 && mode === "Create") setPopupFusion(true);
    // Affichage des tutoriels en fonction de l'exercice et du nombre de cartes sélectionnées
    if (mode === "Tutoriel") {
      if (numero === 0) {
        setMessageTutoriel([
          "Une fois une carte sélectionnée elle aura un contour noir.", 
          "Vous pouvez utiliser les boutons au-dessus pour effectuer une action.",
          "Dans cet exercice nous allons apprendre le fonctionnement du deuxième bouton.",
          "Ce bouton a besoin de deux conditions :",
          "- Une seule carte doit être sélectionnée",
          "- La carte doit avoir une liaison \"et\"",
          "Quand les conditions sont validées la partie gauche et droite de la carte sont ajoutées au deck."]
        );
      }
      if (tmpNbselec === 2 && numero === 1) {
        setMessageTutoriel([
          "Ce bouton a besoin de trois conditions :",
          "- Avoir deux cartes sélectionnées",
          "- Une des deux cartes doit avoir une liaison \"=>\"",
          "- La partie gauche de la carte avec la liaison \"=>\" doit être identique à l’autre carte",
          "Quand les conditions sont validées la partie droite de la carte avec la liaison \"=>\" est créée dans le deck."]
        );
      }
      if (tmpNbselec === 2 && numero === 2) {
        setMessageTutoriel([
          "Ce bouton a besoin de deux conditions :",
          "- Avoir deux cartes sélectionnées",
          "- Les deux cartes sélectionnées doivent comporter une ou deux cartes.",
          "Quand les conditions sont validées une nouvelle carte est créée avec les deux autres cartes sélectionnées et cette carte aura une liaison \"et\""]
        );
      }
      if (tmpNbselec === 1 && numero === 3 && Math.max(tmpSelecDeck1, tmpSelecDeck2) === game.length-1) {
        setMessageTutoriel([
          "Ce bouton a besoin de deux conditions :",
          "- Une seule carte doit être sélectionnée.",
          "- La carte sélectionnée doit être dans le deck des objectifs.",
          "La carte sélectionnée doit avoir une liaison \"=>\"",
          "Quand les conditions sont validées un objectif secondaire est créée, l’objectif secondaire est la partie droite de la carte sélectionnée, un deck est créée avec la carte qui est à gauche de la carte sélectionnée."]
        );
      }
    }
  };

  /**
   * Désélectionne toutes les cartes dans le tableau reçu et devient le jeu.
   * @param {Array<Array<CardClass>} tmp - tableau du jeu temporaire
   */
  const allFalse = (tmp) => {
    // Supression des messages d'erreur
    setMessageErreur("");
    // On désélectionne tout
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-1);
    setSelecDeck2(-1);
    // On désélectionne toutes les cartes du jeu passé en paramètre
    tmp.forEach((e) => {
      e.forEach((s) => {
        s.select(false);
      });
    });
    // On actualise le jeu
    setGame(tmp);
  };

  /**
   * Désélectionne toutes les cartes du jeu.
   */
  const allFalseGame = () => {
    // Supression des message erreur
    setMessageErreur("");
    // On désélectionne tout
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-1);
    setSelecDeck2(-1);
    // Copie du jeu actuel
    let tmp = [...game];
    // On désélectionne toutes les cartes du jeu actuel
    tmp.forEach((e) => {
      e.forEach((s) => {
        s.select(false);
      });
    });
    // On actualise le jeu
    setGame(tmp);
  };

  /** 
   * /!\ Attention cette fonction doit être uniquement appelée en mode Create ou pour faire des tests !
   * Fait apparaître le popup qui nous demande la couleur de la carte qu'on veut ajouter.
   * @param {number} deckIndice - l'indice du deck où l'on ajoute une carte
   */
  const addCard = (deckIndice) => {
    // Indique dans quel deck on veut ajouter une carte
    setIndiceDeckAddCard(deckIndice);
    // Affiche le popup pour ajouter une carte simple
    setPopupAddCard(true);
  };

  /**
   * /!\ Attention cette fonction doit être uniquement appelée en mode Create ou pour faire des tests !
   * Crée une carte avec la couleur sélectionnée (ne ferme pas le popup quand on sélectionne une couleur).
   * @param {Event} event - reçoit la couleur cliquée ({@link event.target.value}) ;
   *                      - on le met à false si on veut faire plusieurs fois la même couleur ({@link event.target.checked})
   */
  const choixCouleur = (event) => {
    // Sauvegarde le jeu (utilisé pour pouvoir faire des retours en arrière)
    saveGame();
    // Copie du jeu actuel
    let tmp = [...game];
    // Dé-check le bouton radio
    event.target.checked = false;
    // Ajoute la carte dans le deck (indiceDeckAddCard est affecté avant de rentrer dans la fonction)
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length, // id     (taille du deck avant ajout)
        event.target.value,             // color  (reçu avec le bouton radio)
        false,                          // active
        "",                             // link
        null,                           // left
        null                            // right
      )
    );
    // Actualise le jeu et désélectionne tout
    allFalse(tmp);
  };

  /**
   * /!\ Attention cette fonction doit être uniquement appelée en mode Create ou pour faire des tests !
   * Crée une carte complexe avec les 2 cartes sélectionnées (cette fonction est appelée à la fin de {@link update()} en mode création).
   * @param {Event} event - reçoit la liaison cliquée ({@link event.target.value})
   */
  const choixLiaison = (event) => {
    // Sauvegarde le jeu (utilisé pour pouvoir faire des retours en arrière)
    saveGame();
    // Copie du jeu actuel
    let tmp = [...game];
    // Dé-check le bouton radio
    event.target.checked = false;
    // Liaison reçu avec le bouton radio
    const l = event.target.value;
    // Copie les 2 cartes séléctionnées     
    let c1 = game[selecDeck1][selecCard1].copy();
    let c2 = game[selecDeck2][selecCard2].copy();
    c1.id = 0;
    c2.id = 1;
    // Ajoute la carte fusionnée dans le deck de la 1ère carte séléctionnée
    tmp[selecDeck1].push(
      new CardClass(
        game[selecDeck1].length, // id
        null,                    // color
        false,                   // active
        l,                       // link
        c1,                      // left
        c2                       // right
      )
    );
    // Enlève le popup
    setPopupFusion(false);
    // Actualise le jeu et désélectionne tout
    allFalse(tmp);
  };

  /**
   * /!\ Attention cette fonction doit être uniquement appelée en mode Create ou pour faire des tests !
   * Supprime la carte qui est sélectionnée.
   */
  const deleteCard = () => {
    // Enlève le popup
    setPopupDeleteCard(false);
    // Si la carte sélectionnée n'est pas la carte 1 : tout désélectionner
    if (!(selecCard1 === -1 && selecDeck1 === -1)) {
      // Sauvegarde le jeu (utilisé pour pouvoir faire des retours en arrière)
      saveGame();
      // Copie du jeu actuel
      let tmp = [...game];
      // Supprime la carte
      tmp[selecDeck1] = delCard(game[selecDeck1], selecCard1);
      // Actualise le jeu et désélectionne tout
      allFalse(tmp);
    }
    else allFalseGame();
  };

  /**
   * Transforme le tableau en tableau d'objets avec seulement les informations qui nous intéressent (couleur/liaison).
   * @returns un tableau d'objets
   */
  const gameOutput = () => {
    // Le tableau que l'on va retourner
    let res = [[], []];
    /** Transforme toutes les cartes en objets (avec seulement les informations essentielles).
     *  - la couleur ou liaison + left + right
     *  - la carte est ajoutée dans le tableau retourné
     */
    game.forEach(function (deck, index) {
      deck.forEach(function (card) {
        res[index].push(card.toFile());
      });
    });
    // Retourne le tableau
    return res;
  };

  /**
   * Reçoit un tableau d'un fichier JSON à qui on va appliquer la méthode {@link JSON.parse()} dans {@link openFile()}
   * ({@link JSON} ⇒ tableau d'{@link Object}) et renvoie un tableau qui peut être lu par notre site.
   * @param {Object[]} data - tableau d'objets qui va servir pour l'initialisation
   * @returns {Array<Array<CardClass>} un tableau de decks qui constitue le jeu
   */
  const gameInput = (data) => {
    // Tableau que l'on va retourner
    let res = [[], []]
    // id de la future carte
    let i = 0;
    // Création du deck de départ
    data[0].forEach(element => {
        res[0].push(toClass(element, i));
      i++;
    });
    i = 0;
    // Création du deck objectif
    data[1].forEach(element => {
      res[1].push(toClass(element, i));
      i++;
    });
    // Retourne le tableau du jeu
    return res;
  }

  /**
   * @todo Stocker dans un fichier sur le serveur ou sur le PC local ou laisser comme ça (afficher le JSON dans la console).
   */
  const saveAsFile = () => {
    // Variable de copie
    let res;
    // Copie JSON du jeu
    res = gameOutput(game);
    // Copie la variable dans le presse-papier
    navigator.clipboard.writeText(JSON.stringify(res, null, 1)).then(() => {})
  };

  /**
   * Ouvre un fichier JSON et l'affiche à l'écran.
   * @param {Event} event - le bouton qui ouvre les fichiers ({@link event.target.files})
   */
  const openFile = (event) => {
    // Vérifie que l'on a sélectionné un fichier
    if (event.target.files.length > 0 ) {
      // Variable pour lire le fichier 
      var reader = new FileReader();
      // Lit le fichier
      reader.onload = (event) =>{
        // Transforme le fichier JSON en objet
        var obj = JSON.parse(event.target.result);
        // Mis à jour du jeu avec le fichier JSON reçu
        setGame(gameInput(obj));
      }
      // Effectue la fonction onload juste au-dessus avec le 1er fichier reçu
      reader.readAsText(event.target.files[0]);
    }
  }

  /**
   * Transforme un objet JSON en instance {@link CardClass}.
   * @todo Modifier pour que cela marche avec exercices.json.
   * @param {JSON} obj - information mimimum pour créer une carte :
   *                     Carte simple = juste la couleur ;
   *                     Carte complexe = les 2 cartes qui la compose & la liaison
   * @param {number} i - numéro de l'id
   * @returns {CardClass} une carte
   */
  const toClass = (obj, i) => {
    // Si c'est une carte complexe
    if (obj.color === undefined) return new CardClass(i, null, false, obj.link, toClass(obj.left, 0), toClass(obj.right, 1));
    // Si c'est une carte simple
    else return new CardClass(i, obj.color, false, "", null, null);
  }

  /**
   * Renvoie la place de l'objectif cherchée dans le tableau game[game.length-1].
   * @param {CardClass} cardObj - la partie droite de l'objectif que l'on cherche 
   * @returns {number} l'indice de l'objectif dans {@link game[game.length-1]}
   */
  const findObjectifRelative = (cardObj) => {
    // Variable que l'on va retourner (-1 si il trouve pas)
    let num = -1;
    // Deck de l'objectif
    let deck = game.length-1;
    /** Cherche parmi les cartes de l'objectif s'il y a une carte dont la partie droite
     *  est égale à la carte envoyée en paramètre.
     *  Si oui {@link num} prend la valeur de l'index de cette carte.
     */
    game[deck].forEach((element,index) => {
      // Vérifie si la couleur est null (si elle est null la carte est au moins double)
      if (element !== null && element.color === null) {
        if (element.right.equals(cardObj)) num = index;
      }
    })
    // Retourne -1 ou la place de la carte
    return num;
  }

  /**
   * Crée le tableau tabObjectif en fonction des objectifs présents dans tmp.
   * @param {Array<Array<CardClass>} tmp - tableau du jeu temporaire
   * @returns {int} la taille du tableau ajouté à tabObjectif
   */
  const createTabObj = (tmp) => {
    // Création du tableau que l'on va affecter à tabObjectif
    let tmpObj = [];
    // Push l'objectif principal
    tmpObj.push([0, 0, false]);
    /** Parcourt le deck d'objectif à la recherche d'une carte simple qui n'est pas l'objectif principal.
     *  S'il y a en a une elle est ajouté au tableau.
     */
    tmp[tmp.length-1].forEach((element,index) => {
      if (index !== 0) {
        if (element.color !== null) tmpObj.push([tmpObj.length, index, true]);
      }
    })
    // Actualise le tableau des objectifs
    setTabObjectif(tmpObj);
    return tmpObj.length;
  }

  /**
   * Compare l'objectif (game[game.length-1][numObjectif]) et toutes les cartes du deck currentDeck(currentDeck = numObjectif) :
   * si on vérifie le deck 0, renvoie true si on trouve l'objectif ;
   * si on ne vérifie pas le deck 0, si l'objectif est dans le deck on ajoute l'objectif au dessus du deck précédent et 
   * on regarde le deck en dessous (currentDeck-1) pour voir si la carte ajoutée n'est pas l'objectif du dessus.
   * @param {number} numObjectif - le numero de l'objectif
   * @returns {true|false} true ou false
   */
  const isWin = (numObjectif,tmpDemonstration,tmpTabIndentation) => {
    // Objectif à vérifier
    const objectif = game[game.length-1][tabObjectif[numObjectif][1]];
    // Indice du deck lié à l'objectif
    let currentDeck = numObjectif;
    // Variable que l'on va retourner (false par défaut)
    let bool = false;
    // Parcourt le deck lié à l'objectif
    game[currentDeck].forEach((card) => {
      // Si une carte liée à cet objectif est trouvée l'objectif est validé
      if (card.equals(objectif)) {
        // Si c'est l'objectif principal on ne cherche pas plus loin : fin de partie
        if (currentDeck === 0) bool = true;
        else {
          // Si c'est un objectif secondaire : copie du jeu actuel
          let tmp = [...game];
          // Copie de la carte qui a servi à créer l'objectif secondaire
          let tmpCard = game[game.length-1][findObjectifRelative(objectif)].copy();
          tmpCard.id = tmp[tabObjectif[currentDeck][1]-1].length;
          // Ajoute cette carte dans le deck précédent
          tmp[currentDeck-1].push(tmpCard);
          // Supprime l'objectif secondaire
          tmp[tmp.length-1] = delCard(tmp[tmp.length-1],tabObjectif[currentDeck][1]);
          // Vérifie si l'objectif a un objectif lié
          if (tabObjectif[currentDeck][2]) {
            // Si oui supprime également l'objectif qui lui est lié
            tmp[tmp.length-1] = delCard(tmp[tmp.length-1], findObjectifRelative(objectif));
          }
          // Supprime le deck qui a servi pour cet objectif secondaire
          tmp = delDeck(tmp, currentDeck);
          // Met à jour la table des objectifs
          createTabObj(tmp);
          tmpDemonstration.push("$$\\text{On a }" + tmpCard.toString() + ".$$");
          setDemonstration(tmpDemonstration);
          tmpTabIndentation.push(indentationDemonstration-1);
          setTabIndentation(tmpTabIndentation);
          setIndentationDemonstration(indentationDemonstration-1);
          // Met à jour le jeu
          setGame(tmp);
          /** Regarde l'objectif précédent pour voir si le fait d'ajouter l'objectif secondaire ne l'a pas validé.
           *  Si cela valdie l'objectif principal : bool = true
           *  Sinon : bool = false
           */
          bool = isWin(currentDeck-1);
        }
      }
    })
    // Retourne true si l'objectif principal est vrai, sinon retourne false
    return bool;
  }

  /**
   * Prend le dernier élément du tableau {@link lastGame} et remplace la variable {@link game}.
   * @todo Ne marche pas.
   */
  const retourEnArriere = () => {
    // Vérifie s'il y a au moins une sauvegarde du jeu
    if (lastGame.length > 0) {
      // Copie le tableau de sauvegarde
      let tmpLastGame   = [...lastGame];
      // Prend le dernier tableau de jeu ajoutée
      let tmpSavedGame  = tmpLastGame[tmpLastGame.length-1];
      // Initialise le futur tableau de jeu
      let tmpFutureGame = [];
      // Copie le dernier tableau de jeu sauvegardé dans le futur tableau
      for (var i = 0 ; i < tmpSavedGame.length ; i++) {
        tmpFutureGame[i] = [];
        for (var j = 0 ; j < tmpSavedGame[i].length ; j++) {
          tmpFutureGame[i].push(tmpSavedGame[i][j].copy());
        }
      }
      // Refait le tableau des objectifs au cas où on retourne en arrière sur une suppression d'objectif secondaire
      setIndentationDemonstration(createTabObj(tmpFutureGame)-1);
      // Met à jour le jeu avec la dernière sauvegarde & désélectionne toutes les cartes
      allFalse(tmpFutureGame);
      let demonstrationTmp = [...demonstration];
      demonstrationTmp.pop();
      setDemonstration(demonstrationTmp);
      // Supprime la dernière sauvegrade du jeu
      tmpLastGame.pop();
      // Met à jour le tableau des sauvegardes
      let tmpDemonstration = [];
      for (let i = 0 ; i <= lastGame.length-1; i++) tmpDemonstration.push(demonstration[i]);
      let tmpTabDemonstration = [];
      for (let i = 0 ; i <= lastGame.length-1; i++) tmpTabDemonstration.push(tabIndentation[i]);
      setDemonstration(tmpDemonstration);
      setTabIndentation(tmpTabDemonstration);
      setLastGame(tmpLastGame);
    }
    else allFalseGame();
  }

  /**
   * À la base la fonction qui sauvegarde la partie qui est pour l'instant recopiée 3 fois dans les autres fonctions
   * car ne fonctionne pas en appelant une fonction (asynchrone).
   */
  const saveGame = () => {
    // Copie du tableau de sauvegarde
    let tmpLastGame = [...lastGame];
    // Copie du jeu actuel
    let saveGameTmp = copyGame();
    // Ajoute le jeu actuel dans le tableau des sauvegardes
    tmpLastGame.push(saveGameTmp);
    // Met à jour le tableau des sauvegardes
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
    // Si une seule carte est sélectionnée
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      /** Prend la carte qui est sélectionnée.
       *  Si elle n'est pas sélectionné c'est -1 donc on prend la plus haute valeur.
       */
      let deckI = Math.max(selecDeck1, selecDeck2);
      let cardI = Math.max(selecCard1, selecCard2);
      // La carte sélectionnée doit avoir la liaison principal "et"
      if (game[deckI][cardI].link === "et") {
        // Sauvegarde du jeu actuel
        saveGame();
        // Copie du jeu actuel
        let tmp = [...game];
        // Ajoute la partie gauche de la carte dans le jeu
        tmp[deckI].push(game[deckI][cardI].left.copy());
        tmp[deckI][tmp[deckI].length-1].id = tmp[deckI].length-1;
        // Ajoute la partie droite de la carte dans le jeu
        tmp[deckI].push(game[deckI][cardI].right.copy());
        tmp[deckI][tmp[deckI].length-1].id = tmp[deckI].length-1;
        // Met à jour le jeu & désélectionne toutes les cartes
        allFalse(tmp);
        let tmpDemonstration = [...demonstration];
        tmpDemonstration.push("$$\\text{On a }" + game[deckI][cardI].left.toString() + "\\text{. On a }" +game[deckI][cardI].right.toString() + ".$$");
        setDemonstration(tmpDemonstration);
        let tmpTabIndentation = [...tabIndentation];
        tmpTabIndentation.push(indentationDemonstration);
        setTabIndentation(tmpTabIndentation);
        // Vérifie si l'exercice est fini, si oui affiche le popup de victoire
        setPopupWin(isWin(selecDeck1,tmpDemonstration,tmpTabIndentation));
      }
      else setMessageErreur("La carte sélectionnée doit avoir une liaison principale de type \"et\" !");
    }
    else {
      if (nbSelec > 1)   setMessageErreur("Vous devez sélectionner une seule carte !");
      if (nbSelec === 0) setMessageErreur("Vous devez sélectionner une carte !")
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
    // S'il y a 2 cartes sélectionnées
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      // Prend le deck le plus grand
      let finalDeck = Math.max(selecDeck1,selecDeck2);
      if (finalDeck !== game.length-1) {
        // Copie du jeu actuel
        let tmp   = [...game];
        /** Vérifie si la 2ème carte a une liaison => et si sa partie gauche est égale à l'autre carte.
         *  Met le résultat dans {@link bool}.
         *  On ne met pas directement la condition dans le if car on veut savoir avec quelle condition on y est rentré.
         */
        let bool  = (tmp[selecDeck2][selecCard2].link === "=>" && tmp[selecDeck2][selecCard2].left.equals(tmp[selecDeck1][selecCard1]));
        // Une des 2 cartes doit avoir une liaison =>
        if (bool || (tmp[selecDeck1][selecCard1].link === "=>" && tmp[selecDeck1][selecCard1].left.equals(tmp[selecDeck2][selecCard2]))) {
          // Sauvegarde du jeu actuel
          saveGame();
          // Initialisation de la carte où la liaison => va être utilisée
          let deckCarteComplex = -1;
          let cardCarteComplex = -1;
          // Détermine & affecte l'id de la carte => utilisée
          if (bool) {
            deckCarteComplex = selecDeck2;
            cardCarteComplex = selecCard2;
          }
          else {
            deckCarteComplex = selecDeck1;
            cardCarteComplex = selecCard1;
          }
          // Ajoute la partie droite de la carte => utilisée dans le deck le plus haut
          tmp[finalDeck].push(tmp[deckCarteComplex][cardCarteComplex].right.copy());
          tmp[finalDeck][tmp[finalDeck].length-1].id = tmp[finalDeck].length-1;
          // Met à jour le jeu & désélectionne toutes les cartes
          allFalse(tmp);
          let tmpDemonstration = [...demonstration];
          tmpDemonstration.push("$$\\text{Puisque }" + tmp[deckCarteComplex][cardCarteComplex].left + "\\text{, on a }" + tmp[deckCarteComplex][cardCarteComplex].right +"\\text{. }$$");
          setDemonstration(tmpDemonstration);
          let tmpTabIndentation = [...tabIndentation];
          tmpTabIndentation.push(indentationDemonstration);
          setTabIndentation(tmpTabIndentation);
          // Vérifie si l'exercice est résolu, si oui affiche le popup de victoire
          setPopupWin(isWin(Math.max(selecDeck1,selecDeck2),tmpDemonstration,tmpTabIndentation));
        }
        else if (tmp[selecDeck2][selecCard2].link === "<=>" || tmp[selecDeck1][selecCard1].link === "<=>") {
          bool = false;
          let bool2 = false;
          let cardAdd;
          let cardFuse;
          if (tmp[selecDeck1][selecCard1].link === "<=>") {
            if (tmp[selecDeck2][selecCard2].equals(tmp[selecDeck1][selecCard1].left)) {
              bool     = true;
              cardAdd  = tmp[selecDeck1][selecCard1].right.copy();
              cardFuse = tmp[selecDeck1][selecCard1].left;
            }
            if (tmp[selecDeck2][selecCard2].equals(tmp[selecDeck1][selecCard1].right)) {
              bool     = true;
              cardAdd  = tmp[selecDeck1][selecCard1].left.copy();
              cardFuse = tmp[selecDeck1][selecCard1].right;
            }
          }
          if (tmp[selecDeck2][selecCard2].link === "<=>") {
            if (tmp[selecDeck1][selecCard1].equals(tmp[selecDeck2][selecCard2].left)) {
              bool     = true;
              cardAdd  = tmp[selecDeck2][selecCard2].right.copy();
              cardFuse = tmp[selecDeck2][selecCard2].left;
            }
            if (tmp[selecDeck1][selecCard1].equals(tmp[selecDeck2][selecCard2].right)) {
              bool     = true;
              cardAdd  = tmp[selecDeck2][selecCard2].left.copy();
              cardFuse = tmp[selecDeck2][selecCard2].right;
            }
          }
          if (tmp[selecDeck1][selecCard1].link === "<=>" && tmp[selecDeck2][selecCard2].link === "<=>") {
            if (tmp[selecDeck1][selecCard1].left.equals(tmp[selecDeck2][selecCard2].left)) {
              bool     = true;
              bool2    = true;
              cardAdd  = new CardClass(0, null, false, "<=>", tmp[selecDeck1][selecCard1].right.copy(), tmp[selecDeck2][selecCard2].right.copy())
              cardFuse = tmp[selecDeck1][selecCard1].left;
            }
            if (tmp[selecDeck1][selecCard1].left.equals(tmp[selecDeck2][selecCard2].right)) {
              bool     = true;
              bool2    = true;
              cardAdd  = new CardClass(0, null, false, "<=>", tmp[selecDeck1][selecCard1].right.copy(), tmp[selecDeck2][selecCard2].left.copy())
              cardFuse = tmp[selecDeck1][selecCard1].left;
            }
            if (tmp[selecDeck1][selecCard1].right.equals(tmp[selecDeck2][selecCard2].left)) {
              bool     = true;
              bool2    = true;
              cardAdd  = new CardClass(0, null, false, "<=>", tmp[selecDeck1][selecCard1].left.copy(), tmp[selecDeck2][selecCard2].right.copy())
              cardFuse = tmp[selecDeck1][selecCard1].right;
            }
            if (tmp[selecDeck1][selecCard1].right.equals(tmp[selecDeck2][selecCard2].right)) {
              bool     = true;
              bool2    = true;
              cardAdd  = new CardClass(0, null, false, "<=>", tmp[selecDeck1][selecCard1].left.copy(), tmp[selecDeck2][selecCard2].left.copy())
              cardFuse = tmp[selecDeck1][selecCard1].right;
            }
          }
          if (bool) {
            // Sauvegarde du jeu actuel
            saveGame();
            cardAdd.id = tmp[finalDeck].length;
            tmp[finalDeck].push(cardAdd);
            allFalse(tmp);
            let tmpDemonstration = [...demonstration];
            if (bool2) tmpDemonstration.push("$$\\text{On a }"    + cardAdd.left.toString() + "\\text{ }\\Leftrightarrow\\text{ }" + cardFuse.toString() + "\\text{ }\\Leftrightarrow\\text{ }" + cardAdd.right.toString() + ".$$");
            else       tmpDemonstration.push("$$\\text{Puisque }" + cardFuse.toString()     + "\\text{, on a }"                    + cardAdd.toString()                                                                    + "\\text{. }$$");
            setDemonstration(tmpDemonstration);
            let tmpTabIndentation = [...tabIndentation];
            tmpTabIndentation.push(indentationDemonstration);
            setTabIndentation(tmpTabIndentation);
            // Vérifie si l'exercice est résolu, si oui affiche le popup de victoire
            setPopupWin(isWin(Math.max(selecDeck1,selecDeck2), tmpDemonstration, tmpTabIndentation));
          }
        }
        else{
          // Si aucune des deux cartes n'a de liaison =>
          if (tmp[selecDeck2][selecCard2].link !== "=>" && tmp[selecDeck1][selecCard1].link !== "=>")
            setMessageErreur("Une des deux cartes doit avoir une liaison principale de type \"=>\" !");
          else setMessageErreur("La partie gauche de la carte \"=>\" doit être égale à la deuxième carte sélectionnée !")
        }
      }
      else setMessageErreur("Vous ne pouvez pas utilisé une carte de l'objectif avec ce bouton !");
    }
    else setMessageErreur("Vous devez sélectionner deux cartes !");
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
    // Si 2 cartes sont sélectionnées
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      // Prend le deck le plus haut
      let finalDeck = Math.max(selecDeck1,selecDeck2);
      if (finalDeck !== game.length-1) {
        // Copie du jeu actuel
        let tmp = [...game];
        /** Vérifie si la 1ère carte sélectionnée est une carte composé au maximum de 2 cartes.
         *  Le jeu ne prend pas en compte les cartes composées de plus de 4 cartes.
         */
        let bool = tmp[selecDeck1][selecCard1].isSimpleOrDouble();
        /** Vérifie si la 2ème carte sélectionnée est une carte composé au maximum de 2 cartes.
         *  Le jeu ne prend pas en compte les cartes composées de plus de 4 cartes.
         */
        if (bool && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
          // Sauvegarde du jeu actuel
          saveGame();
          // Copie les 2 cartes sélectionnées
          let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
          let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
          tmpCard1.id = 0;
          tmpCard2.id = 1;
          // Ajoute la nouvelle carte dans le deck le plus haut avec les 2 autres cartes & une liaison "et"
          tmp[finalDeck].push(new CardClass(tmp[finalDeck].length, null, false, "et", tmpCard1, tmpCard2));
          // Met à jour le jeu & désélectionne toutes les cartes
          allFalse(tmp);
          let tmpDemonstration = [...demonstration];
          tmpDemonstration.push("$$\\text{On a }" + tmpCard1.toString() + "\\text{ }\\land\\text{ }" + tmpCard2.toString()+". $$");
          setDemonstration(tmpDemonstration);
          let tmpTabIndentation = [...tabIndentation];
          let tmpIndentationDemonstration = indentationDemonstration;
          tmpTabIndentation.push(tmpIndentationDemonstration);
          setTabIndentation(tmpTabIndentation);
          // Vérifie si l'exercice est résolu, si oui affiche le popup de victoire
          setPopupWin(isWin(Math.max(selecDeck1, selecDeck2),tmpDemonstration,tmpTabIndentation));
        }
        else {
          if (bool) setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck2][selecCard2].toString());
          else      setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck1][selecCard1].toString());
        }
      }
      else setMessageErreur("Vous ne pouvez pas utilisé une carte de l'objectif avec ce bouton !");
    }
    else setMessageErreur("Vous devez sélectionner deux cartes !");
  }

  /**
   * Exactement la même fonction que {@link fuseCardAdd()} sauf que la carte créée a une liaison "=>".
   */
  const fuseCardFuse = () => {
    // Si 2 cartes sont sélectionnées
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      // Copie du jeu actuel
      let tmp   = [...game];
      /** Vérifie si la 1ère carte sélectionnée est une carte composé au maximum de 2 cartes.
       *  Le jeu ne prend pas en compte les cartes composées de plus de 4 cartes.
       */
      let bool  = tmp[selecDeck1][selecCard1].isSimpleOrDouble();
      /** Vérifie si la 2ème carte sélectionnée est une carte composé au maximum de 2 cartes.
       *  Le jeu ne prend pas en compte les cartes composées de plus de 4 cartes.
       */
      if (bool && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
        // Sauvegarde du jeu actuel
        saveGame();
        // Prend le deck le plus haut
        let finalDeck = Math.max(selecDeck1,selecDeck2);
        // Copie les 2 cartes sélectionnées
        let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
        let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
        tmpCard1.id = 0;
        tmpCard2.id = 1;
        // Ajoute la nouvelle carte dans le deck le plus haut avec les 2 autres cartes & une liaison "=>"
        tmp[finalDeck].push(new CardClass(tmp[finalDeck].length, null, false, "=>", tmpCard1, tmpCard2));
        // Met à jour le jeu & désélectionne toutes les cartes
        allFalse(tmp);
        // Vérifie si l'exercice est résolu, si oui affiche le popup de victoire
        setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
      }
      else {
        if (bool) setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck2][selecCard2].toString());
        else      setMessageErreur("On ne peut unir que des cartes simples et doubles, ce qui n'est pas le cas de cette carte : " + tmp[selecDeck1][selecCard1].toString());
      }
    }
    else setMessageErreur("Vous devez sélectionner deux cartes !");
  }

  /**
   * Cette fonction sert à déterminer si un objectif est déjà créé.
   * Cherche dans les objectifs s'il existe une carte qui est égale à :
   *    Si le deck est l'objectif alors la partie droite de la carte est reçue ;
   *    Sinon c'est la partie gauche de la carte qui est reçue.
   * @param {number} deck - indice du deck
   * @param {number} card - indice de la carte
   * @returns {true|false} true ou false
   */
  const deckContain = (deck, card) => {
    // Variable que l'on va retourner (false par défaut)
    let bool = false;
    // Parcourt le deck objectif
    game[game.length-1].forEach(element =>{
      // Si le deck passé en paramètre est l'objectif
      if (deck === game.length-1) {
        // si il y a une carte dans les objectif qui est egale
        // a la partie droite de la carte que l'on a passer en paramètre
        /** S'il y a une carte dans les objectifs qui est égale à la partie droite
         * de la carte que l'on a passé en paramètre.
         */
        if (element.equals(game[deck][card].right)) bool = true;
      }
      else {
        /** S'il y a une carte dans les objectifs qui est égale à la partie gauche
         * de la carte que l'on a passé en paramètre.
         */
        if (element.equals(game[deck][card].left))  bool = true;
      }
    })
    return bool;
  }

  /**
   * Fonction appelée après avoir appuyé sur le bouton "Ajouter objectif".
   * 
   * Une seule & unique carte doit être sélectionnée sinon un popup d'erreur apparaît avec ce message : 
   *    Si 2 cartes sont sélectionnées :  "Vous devez sélectionner une seule carte !"
   *    Si 0 carte sont sélectionnées  :  "Vous devez sélectionner une carte !" 
   * 
   * La carte sélectionnée doit avoir une liaison principale de type "=>" sinon un popup d'erreur apparaît avec ce message :
   *    "L'objectif secondaire doit avoir une liaison "=>" !
   * 
   * Si toutes les conditions énumérées au-dessus sont respectées il y a 2 possibilités :
   *    La carte sélectionnée est dans les objectifs : ajoute la partie gauche dans le dernier deck avant l'objectif
   *    et la droite dans l'objectif et défini cet objectif comme un objectif secondaire. 
   *    Le reste : ajoute la partie gauche dans l'objectif et ne le considère pas comme un objectif secondaire.
   */
  const addObjectif = () => {
    // S'il n'y a qu'une carte de sélectionné
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      // Prend la carte sélectionnée
      let deckI = Math.max(selecDeck1,selecDeck2);
      let cardI = Math.max(selecCard1,selecCard2);
      // Si le 1er sous-objectif choisi n'est pas l'objectif principal
      if (true || !(game.length === 2 && (cardI !== 0 || deckI === 0))) {
        // Si le sous-objectif n'existe pas déjà
        if (!deckContain(deckI,cardI)) {
          // Si la carte choisie pour créer le sous-objectif a une liaison principal =>
          if (game[deckI][cardI].link === "=>") {
            // Initialisation de la variable du sous-objectif
            let secondObjectif;
            // Copie du jeu actuel
            let tmp = [...game];
            // Copie du deck objectif
            let tmpObjectif = [...game[game.length-1]];
            // Initialisation d'une variable temporaire
            let tmpCard;
            // Si la carte sélectionnée est dans le deck objectif
            if (deckI === game.length-1) {
              // Sauvegarde du jeu actuel
              saveGame();
              // Message en mode tutoriel
              if (mode === "Tutoriel" && numero === 3) {
                setMessageTutoriel([
                  "Vous devez maintenant compléter l’objectif secondaire.",
                  "Si vous complétez l’objectif secondaire cela créera la carte d’où il a été créé dans deck avant, dans notre cas dans le deck départ cela complétera l’objectif principal."]);
              }
              // Copie de la partie droite de la carte sélectionnée
              secondObjectif = game[deckI][cardI].right.copy();
              // Vide le dernier deck (dans la variable temporaire)
              tmp[game.length-1] = [];
              // Copie de la partie gauche de la carte sélectionnée
              tmpCard = game[deckI][cardI].left.copy();
              tmpCard.id = 0;
              // Ajoute cette partie dans le dernier deck
              tmp[game.length-1].push(tmpCard);
              // Met l'id du sous-objectif que l'on va rajouter de la taille du dernier deck
              secondObjectif.id = game[game.length-1].length;
              // Rajoute le second objectif dans le deck objectif
              tmpObjectif.push(secondObjectif)
              // Rajoute le deck objectif à la fin 
              tmp.push(tmpObjectif);
              // Copie du tableau objectif
              let tmpObj = [...tabObjectif];
              // Ajoute l'objectif secondaire dans le tableau objectif
              tmpObj.push([tabObjectif.length,game[game.length-1].length,true]);
              // Met à jour le tableau objectif
              setTabObjectif(tmpObj);
              let tmpDemonstration = [...demonstration];
              tmpDemonstration.push("$$\\text{Supposons }" + tmpCard.toString()  +"$$\\text{. Montrons }" + secondObjectif.toString() + ".$$");
              setDemonstration(tmpDemonstration);
              let tmpTabIndentation = [...tabIndentation];
              tmpTabIndentation.push(indentationDemonstration);
              setTabIndentation(tmpTabIndentation);
              setIndentationDemonstration(indentationDemonstration+1);
              // Met à jour le jeu & désélectionne toutes les cartes
              allFalse(tmp);
            }
            else {
              // Si la carte est pas dans le deck objectif 1 si la partie gauche de la carte a une liaison => 
              if (game[deckI][cardI].left.link === "=>") {
                // Sauvegarde du jeu actuel
                saveGame();
                // Copie de la partie gauche de la carte sélectionnée
                secondObjectif    = game[deckI][cardI].left.copy();
                secondObjectif.id = game[game.length-1].length;
                // Met la carte copiée dans le deck objectif (ce n'est pas un objectif secondaire)
                tmpObjectif.push(secondObjectif)        
                // Met à jour le deck objectif
                tmp[tmp.length-1] = tmpObjectif;
                // Met à jour le jeu & désélectionne toutes les cartes
                let tmpDemonstration = [...demonstration];
                tmpDemonstration.push("Montrons " + secondObjectif.toString() +".");
                setDemonstration(tmpDemonstration);
                let tmpTabIndentation = [...tabIndentation];
                tmpTabIndentation.push(indentationDemonstration);
                setTabIndentation(tmpTabIndentation);
                allFalse(tmp);
              }
              else setMessageErreur("La partie gauche de l'objectif secondaire doit avoir une liaison \"=>\" !");
            }
          }
          else setMessageErreur("L'objectif secondaire doit avoir une liaison \"=>\" !");
        }
        else setMessageErreur("Cet objectif existe déjà !");
      }
      else setMessageErreur("Le premier objectif secondaire doit être créé avec l'objectif principal !");
    }
    else {
      if      (nbSelec  >  1) setMessageErreur("Vous devez sélectionner une seule carte !");
      else if (nbSelec === 0) setMessageErreur("Vous devez sélectionner une carte !");
    }
  }

  /**
   * Appellée avec le sélecteur, reçoit le numéro puis redirige le site vers l'exercice correspondant.
   * @param {Event} event - le sélecteur (le numéro est dans {@link event.target.value})
   */
  const changeExercise = (event) => {
    // Numéro de l'exercice demandée
    let value = event.target.value;
    // Si le sélecteur n'est pas sur "Choisir un exercice"
    if (value !== "") {
      // Création de l'url
      let url = "/Exercise" + mode + value;
      // Redirection vers l'exercice voulu
      navigate(url);
    }
  }
  
  /**
   * Reçoit plusieurs fichiers puis fusionne ces fichiers pour n'en faire qu'un.
   * @param {Event} event - le bouton qui reçoit les fichiers ({@link event.target.files})
   */
  const convertFile = (event) => {
    // Initialisation de la variable où vont être stockés les fichiers JSON
    filesCopy = "";
    // Si au moins 1 fichier est sélectionné
    if (event.target.files.length > 0) {
      // Boucle sur tous les fichiers sélectionnés
      Array.from(event.target.files).forEach((element) => {
        // Création d'un objet pour lire les fichiers
        var reader = new FileReader();
        // Méthode appelée quand on lit un fichier
        reader.onload = event => {
          // Ajoute le fichier suivi d'une virgule (liste d'exercices, on les sépare par une virgule dans un tableau JSON)
          filesCopy += event.target.result + ",";
        }
        // Lit le fichiers
        reader.readAsText(element);
      })
    }
  }
  
  /**
   * Copie dans le presse-papier le fichier obtenu avec le bouton select fichiers.
   */
  const printConvertFile = () => {
    /** Copie ce qu'il y a dans fileCopy sans le dernier caractère (la dernière virgule) et
     * le met entre crochets pour faire un tableau. Cela est copié dans le presse-papier.
     */
    navigator.clipboard.writeText("[" + filesCopy.substring(0,filesCopy.length-1) + "]").then(() => {})
  }

  /**
   * Redirige vers le prochain exercice si il existe.
   */
  const nextExercise = () => {
    // S'il y a un prochain exercice
    if (numero+2 <= ex.length) {
      // url du prochain exercice
      let url = "/Exercise" + mode + (numero+2);
      // Redirige vers cet url
      navigate(url);
    }
    setPopupWin(false);
  }

  /**
   * Teste une carte pour voir si en utilisant le bouton pour séparer une carte on peut obtenir la carte (carteObjectif).
   * @param {CardClass}         card - la carte que l'on teste
   * @param {CardClass} cardObjectif - la carte que l'on veut obtenir
   * @returns {true|false} true ou false
   */
  const isObtainableEt = (card, cardObjectif) => {
    // Variable que l'on va retourner (false par défaut)
    let bool = false;
    // Si la carte que l'on teste a une liaison
    if (card.color === null) {
      /** Si la carte a une liaison "et" & que la partie gauche ou droite de cette carte est égale
       *  à la carte objectif on retourne true.
       */
      if (card.link === "et" && (card.left.equals(cardObjectif) || card.right.equals(cardObjectif))) bool = true;
    }
    return bool;
  }

  /**
   * Teste une carte pour voir si on peut avoir la carte objectif en utilisant la liaision "=>".
   * @param {CardClass}         card - la carte que l'on teste
   * @param {CardClass} cardObjectif - la carte que l'on veut obtenir
   * @returns {true|false} true ou false
   */
  const isObtainableImplique = (card, cardObjectif) => {
    // Variable que l'on va retourner (false par défaut)
    let bool = false;
    // Si la carte que l'on teste a une liaison
    if (card.color === null) {
      /** Si la carte a une liaison "=>" & que la partie droite de cette carte est égale à la carte
       *  objectif ou si avec la partie droite de la carte on peut avoir l'objectif, on retourne true.
       */
      if ((card.link === "=>" && card.right.equals(cardObjectif) ) || isObtainableImplique(card.right,cardObjectif) || isObtainableEt(card.right,cardObjectif))
        bool = true;
    }
    return bool;
  }

  /**
   * Parcourt le deck passé en paramètre (tmp[deckId]) et regarde s'il existe une carte qui est égale à la
   * carte passée en paramètre.
   *    Si oui renvoie true.
   * @param {Array<Array<CardClass>} tmp - tableau du jeu temporaire
   * @param {number}              deckId - indice du deck de la dernière carte trouvée pour aller à l'objectif
   * @param {CardClass}             card - la carte à trouver
   * @returns {true|false} true ou false
   */
  const containCard = (tmp, deckId, card) => {
    // Variable que l'on va retourner (false par défaut)
    let bool = false;
    // Parcourt le deck passé en paramètre
    tmp[deckId].forEach(cardElement => {
      // Si une carte de ce deck est égale à la carte passée en paramètre alors renvoie true
      if (cardElement.equals(card)) bool = true;
    })
    return bool;
  }

  /**
   * Parcourt le deck passé en paramètre (tmp[deckId]) et regarde s'il existe une carte qui est égale à la
   * carte passée en paramètre.
   *    Si oui renvoie son indice.
   * @param {Array<Array<CardClass>} tmp - tableau du jeu temporaire
   * @param {number}              deckId - indice du deck de la dernière carte trouvée pour aller à l'objectif
   * @param {CardClass}             card - la carte à trouver
   * @returns {number} -1 si la carte n'est pas dans le deck sinon son indice
   */
  const getIndice = (tmp, deckId, card) => {
    // Variable que l'on va retourner (-1 par défaut)
    let num = -1;
    // Parcourt le deck passé en paramètre
    tmp[deckId].forEach((cardElement, index) => {
      // Si une carte de ce deck est égale à la carte passée en paramètre alors renvoie son indice
      if (cardElement.equals(card)) num = index;
    })
    return num;
  }

  /**
   * Cherche de manière récursive un objectif : elle cherche à trouver un moyen de créer cardTest avec une
   * autre carte, s'il y a un moyen elle va chercher à créer cette autre carte jusqu'à tomber sur une carte
   * simple existante.
   * @param {Array<Array<CardClass>} tmp - tableau du jeu temporaire
   * @param {CardClass}         cardTest - la dernière carte trouvée pour aller à l'objectif
   * @param {number}              deckId - indice du deck de la dernière carte trouvée pour aller à l'objectif
   * @param {number}        deckObjectif - numéro de l'objectif
   * @param {Array<CardClass>}    chemin - le chemin de cartes actuel
   * @returns {Array<CardClass>} le chemin
   */
  const recursiveSoluce = (tmp, cardTest, deckId, deckObjectif, chemin) => {
    /** L'indice 1 de chemin est false par défaut : il n'a pas trouvé une carte permettant de créer la carte
     *  {@link cardTest}. On est au début donc il ne sait pour l'instant pas comment la créer.
     */
    chemin[1] = false;
    // Variable temporaire pour le chemin
    let tmpChemin;
    // Comme on effecture la boucle à l'envers, cette variable est le véritable index des cartes de la boucle
    let deckIndex = 0;
    /** Vérifie si la carte que l'on cherche a une liaison "et" et qu'elle n'existe pas dans le numéro du
     *  deck qui correspond à l'objectif.
     */
    if (cardTest.link === "et" && !containCard(tmp, deckObjectif, cardTest)) {
      // console.log("Carte objectif " + cardTest.toString());
      if (containCard(tmp, deckId, cardTest)) {
        // Ajoute la carte test dans le chemin
        chemin[0].push([deckId, tabObjectif[deckObjectif][1]]);
      }
      // Cherche la partie gauche de la carte "et"
      tmpChemin = [...recursiveSoluce(tmp, cardTest.left, deckIndex, deckObjectif, chemin)];
      // Copie le résultat dans le tableau chemin
      chemin = [...tmpChemin];
      // S'il a trouvé une solution pour la partie gauche 
      if (chemin[1]) {
        // Copie le tableau
        tmp = copyGame();
        // Cherche la partie droite de la carte "et"
        tmpChemin = [...recursiveSoluce(tmp, cardTest.right, deckIndex, deckObjectif, chemin)];
        // Copie de tmpChemin dans chemin
        chemin    = [...tmpChemin];
      }
    }
    /** Si aucune solution n'a été trouvé jusque-là et que la carte que l'on cherche est l'objectif
     *  et qu'elle a une liaison "=>".
     */
    if (!chemin[1] && deckId === tmp.length-1 && cardTest.link === "=>") {
      // console.log("Add objectif");
      // Ajoute un deck avant l'objectif
      tmp.splice(tmp.length-1, 0, []);
      // Copie la partie gauche de l'objectif dans le deck qui vient d'être créé
      tmp[tmp.length-2].push(cardTest.left.copy());
      // Copie la partie droite de l'objectif dans le deck objectif
      tmp[tmp.length-1].push(cardTest.right.copy());
      // Ajoute le second objectif dans le chemin
      chemin[0].push([tmp.length-1, tmp[tmp.length-1].length-1]);
      // Cherche à valider ce second objectif 
      tmpChemin = [...recursiveSoluce(tmp, tmp[tmp.length-1][tmp[tmp.length-1].length-1], tmp.length-1, deckObjectif+1, chemin)];
      // Copie le résultat dans le tableau chemin
      chemin = [...tmpChemin];
      // Si le second objectif est résolu
      if (chemin[1]) {
        // Rajoute ce que l'on cherche dans le deck qui a le numéro de l'objectif
        tmp[deckObjectif].push(cardTest.copy());
      }
    }
    // Si aucune solution n'a été trouvé jusque-là
    if (!chemin[1]) {
      // Parcourt tous les decks en commençant par la fin
      tmp.slice().reverse().forEach((deck, i) => {
        // Véritable indice de deck
        deckIndex = tmp.length-1-i;
        // Parcourt les cartes du deck
        deck.forEach((card, cardIndex) => {
          // Si le numéro du deck que l'on parcourt est inférieur ou égal à celui de l'objectif
          if (deckObjectif >= deckIndex) {
            /** Condition d'arrêt si on trouve une solution :
             *  - si aucune solution n'a été trouvé jusque-là ;
             *  - si le deck où l'on est n'est pas dans l'objectif ;
             *  - si le deck est dans le numéro de l'objectif
             *    (@example numéro objectif = 0 & deck départ = 0 & cette carte existe).
             */
            if (!chemin[1] && deckIndex !== tmp.length-1 && deckIndex <= deckObjectif && containCard(tmp, deckIndex, cardTest)) {
              // console.log("fin");
              // On a trouvé une solution
              chemin[1] = true;
              console.log(cardTest + "");
              console.log(deckIndex + "," + getIndice(tmp, deckIndex, cardTest));
              console.log(deck);
              // Vérifie que l'on ajoute pas la carte si elle est déjà ajoutée en dernier
              if (!tmp[chemin[0][chemin[0].length-1][0]][chemin[0][chemin[0].length-1][1]].equals(cardTest)) {
                // Ajoute cette carte dans le chemin
                chemin[0].push([deckIndex, getIndice(tmp, deckIndex, cardTest)]);
              } 
            }
            /** Condition d'arrêt si on trouve une solution :
             *  - si aucune solution n'a été trouvé jusque-là ;
             *  - si le deck où l'on est n'est pas dans l'objectif ;
             *  - si on peut avoir {@link cardTest} en passant par une carte qui a une liaison "=>".
             */
            if (!chemin[1] && deckIndex !== tmp.length-1 && isObtainableImplique(card, cardTest)) {
              // console.log(card.left.toString() + " Implique " + cardTest.toString());
              // Vérifie si la partie droite de la carte que l'on vient de tester est une carte double
              if (card.right.color === null) {
                // Vérifie si la partie droite de la carte que l'on vient de tester a une liaison "=>"
                if (card.right.link === "=>") {
                  /** Vérifie si l'on peut avoir la partie gauche de la partie droite de la carte que l'on
                   *  vient de tester.
                   *  @example : | bleu |    |jaune |
                   *             |  et  | => |  =>  |
                   *             |rouge |    |orange|
                   *  On cherche du orange, on vérifie si on a du jaune car s'il y en a pas ça ne sert à rien
                   *  de chercher "bleu et rouge".
                   */
                  tmpChemin = [...recursiveSoluce(tmp, card.right.left, deckIndex, deckObjectif, chemin)];
                  chemin    = [...tmpChemin];
                }
                /* Pas sûr & pas d'exemple pour le tester.
                else {
                  tmpChemin = [...recursiveSoluce(tmp,card.right,deckIndex,deckObjectif,chemin)];
                  chemin    = [...tmpChemin];
                }
                */
              }
              else {
                // Si la partie droite de la carte est simple on cherche la partie gauche
                chemin[1] = true;
              }
              // Si on a trouvé une solution pour la partie droite
              if (chemin[1]) {
                // Ajoute la carte au chemin
                chemin[0].push([deckIndex,cardIndex]);
                // Cherche la partie gauche de la carte
                tmpChemin = [...recursiveSoluce(tmp, card.left, deckIndex, deckObjectif, chemin)];
                // Copie le résultat dans le tableau chemin
                chemin    = [...tmpChemin];
              }
              // Si l'on n'a pas trouvé de solution
              if (!chemin[1]) {
                // Si la partie gauche de la carte a une liaison "=>"
                if (card.color === null && card.left.link === "=>") {
                  // Ajout de la partie gauche de la carte parcourue dans les objectifs
                  tmp[tmp.length-1].push(card.left.copy());
                  // Cherche la carte ajoutée dans les objectifs
                  tmpChemin = [...recursiveSoluce(tmp, card.left, tmp.length-1, deckObjectif, chemin)];
                  // Copie le résultat dans le tableau chemin
                  chemin    = [...tmpChemin];
                }
              }
            }
            /** Condition d'arrêt si on trouve une solution :
             *  - si aucune solution n'a été trouvé jusque-là ;
             *  - si la carte n'est pas dans le deck objectif ;
             *  - si on peut avoir {@link cardTest} en passant par une carte qui a une liaison "et".
             *  @example On cherche une carte rouge si on a une carte rouge & jaune, on peut la séparer
             *  pour avoir du rouge.
             */
            if (!chemin[1] && deckIndex !== tmp.length-1 && isObtainableEt(card, cardTest)) {
              // console.log(card.toString() + "utilisé ajout des cartes : " + card.left.toString() + " et " + card.right.toString());
              // Ajoute la carte au chemin
              chemin[0].push([deckIndex, cardIndex]);
              // Ajoute les 2 parties de la carte "et" au deck
              tmp[deckId].push(card.right.copy());
              tmp[deckId].push(card.left.copy());
              /** Cherche à nouveau la cardTest avec les 2 nouvelles cartes ajoutées. Cela ajoute une carte
               *  dans le chemin ce qui permet de différencier la séparation d'une carte & l'utilisation
               *  d'une carte "et" avec une carte "=>".
               */
              tmpChemin = [...recursiveSoluce(tmp, cardTest, deckIndex, deckObjectif, chemin)];
              // Copie le résultat dans le tableau chemin
              chemin    = [...tmpChemin];
            }
          }
        })
      })
    }
    return chemin;
  }

  /**
   * Renvoie le numéro de l'objectif associé à l'indice de la carte dans le deck.
   * @param {number} objectif - indice de la carte de l'objectif que l'on cherche dans le deck
   * @returns {number} le numéro de l'objectif
   */
  const getNumObjectif = (objectif) => {
    // Variable que l'on va retourner (0 par défaut i.e. l'objectif principal)
    let res = 0;
    // Parcourt le tableau d'objectif
    tabObjectif.forEach(element => {
      // Rappel : objectif = [numéro objectif, indice de la carte dans le deck, objectif principal = true / objectif secondaire = false]
      if (element[1] === objectif) {
        // Prend le numéro de l'objectif
        res = element[0];
      }
    })
    return res;
  }

  /** Met dans la console tous les mouvements à faire pour gagner la partie.
   *  @todo Fonction inutilisée pour l'instant. Ne marche pas normalement.
   */
  const soluceExercise = () => {
    let tmp      = [...game];
    let chemin   = [[],false];
    let objectif = tmp[1][0];
    let result   = recursiveSoluce(tmp,objectif,1,0,chemin);
    let affiche;
    if (result[1]) {
      console.log("Solution trouvée")
      if (objectif.link === "=>") {
        console.log("Ajout Objectif secondaire : " + result[0][0]);
        console.log("Création d'une LPU avec la carte " + objectif.left.toString());
        affiche = result[0].reverse();
        for (var i=0; i < affiche.length-1; i++) {
          if (affiche[i].color !== null ) {
            if (affiche[i+1].link === "=>") {
              console.log("Utilisation de la carte " + affiche[i] + " et " + affiche[i+1] + " Création de la carte " + affiche[i+1].right);
            }
            i++;
          }
          else if (affiche[i].link === "=>") {
            console.log("Utilisation de la carte " + affiche[i].left + " et " + affiche[i] + " Création de la carte " + affiche[i].right);
          }
        }
        console.log("Objectif secondaire rempli");
      }
      else if (objectif.link === "et") { }
      else { }
    }
    else console.log("Aucune solution trouvée");
    tmp = null;
  }

  /**
   * Fait une copie du jeu actuel en créant un nouveau tableau & en copiant toutes les cartes.
   * @returns une copie de la partie actuelle
   */
  const copyGame = () => {
    // Nouveau tableau vide que l'on va retourner
    let tmp = [];
    // Boucle de la taille du jeu
    for (var i = 0 ; i < game.length ; i++) {
      // Crée le deck vide
      tmp[i] = [];
      for (var j = 0 ; j < game[i].length ; j++) {
        // Ajoute une copie de la carte dans le deck
        tmp[i].push(game[i][j].copy());
      }
    }
    // Retourne le nouveau tableau
    return tmp;
  }

  /**
   * Regarde si la carte passer en paramètre existe dans le jeu actuelle
   * et qu'elle ne sois pas dans les objectifs.
   * @param {CardClass} cardTest - la carte que l'on cherche
   * @returns {true|false} true ou false 
   */
  const cardExist = (cardTest) => {
    // Variable que l'on va retourner (false par défaut)
    let bool = false;
    // Parcourt le jeu
    game.forEach((deck, index) => {
      // Parcourt le deck
      deck.forEach(card => {
        /** La carte ne doit pas être dans les objectifs et on regarde dans le deck si la carte est égale
         *  à {@link cardTest}, si oui {@link bool} est true.
         */
        if (index !== game.length-1 && card.equals(cardTest)) bool = true;
      })
    })
    // Retourne la variable
    return bool;
  }

  const testResolve = () => {
    let tmp       = copyGame();
    let chemin    = [[], false];
    let deckId    = tmp.length-1;
    let cardId    = tmp[tmp.length-1].length-1;
    let objectif  = tmp[deckId][cardId];
    let result    = recursiveSoluce(tmp, objectif, deckId, getNumObjectif(cardId), chemin);
    let tmpResult = [...result[0]]
    let affiche   = tmpResult.reverse();
    console.log(affiche);
  }

  /**
   * Cherche le prochain coup qui amène à finir l'exercice :
   *    S'il y a 1 carte au prochain coup elle ira dans {@link cardHelp} ;
   *    S'il y en a 2 elles iront dans {@link cardHelp} et {@link cardHelp2}.
   */
  const getNextMove = () => {
    /** Copie le jeu dans une variable temporaire. */
    let tmp = copyGame();
    /** Initialise le chemin : indice 0 aucune carte & indice 1 aucune solution trouvé. */
    let chemin = [[], false];
    // On cherche l'objectif le plus éloigné dans le deck objectif
    let deckId = tmp.length-1;
    let cardId = tmp[tmp.length-1].length-1;
    /** L'objectif que l'on cherche. */
    let objectif = tmp[deckId][cardId];
    /** Cherche l'objectif. */
    let result = recursiveSoluce(tmp, objectif, deckId, getNumObjectif(cardId), chemin);
    /** Copie du tableau de cartes pour trouver l'objectif. */
    let tmpResult = [...result[0]]
    /** La 1ère carte dans result est l'objectif donc la dernière est le prochain coup à jouer donc
     *  on inverse le tableau pour jouer avec l'indice 0 & 1.
     */
    let affiche = tmpResult.reverse();
    // Initialisation des variables
    let bool = false;
    let card1;
    let card2;
    try {
      card1 = game[affiche[0][0]][affiche[0][1]];
      if (card1 === undefined) card1 = cardError;
    }
    catch { card1 = cardError; }
    try {
      card2 = game[affiche[1][0]][affiche[1][1]];
      if (card2 === undefined) card2 = cardError;
    }
    catch { card2 = cardError; }
    console.log(card1);
    console.log(card2);
    // Souvent la carte la plus importante
    let res1 = [affiche[0][0], affiche[0][1]];
    let res2 = [affiche[1][0], affiche[1][1]];
    /** Vérifie si les 2 dernières cartes reçues existent dans jeu ou si la 2ème carte est une carte "et"
     *  et qu'elle existe.
     */
    bool = (cardExist(card1) || card2.link === "et") && cardExist(card2) && affiche[1][0] < game.length-1;
    // Vérifie si un objectif avec une liaison "=>" a eu son deck de créé
    if (objectif.link === "=>" && game.length === tabObjectif.length+1) {
      res1 = [deckId, cardId];
      setCardHelp(res1);
      setCardHelp2(cardError);
    }
    // Vérifie si la 2ème carte est une carte "et"
    else if (card2.link === "et") {
      setCardHelp(res2);
      setCardHelp2(cardError);
    }
    else {
      // Si les 2 cartes trouvées existent
      if (bool) {
        setCardHelp(res1);
        setCardHelp2(res2);
      }
      // Si elles n'existent pas
      else {
        // console.log("Les 2 cartes n'existent pas")
        /** Si les 2 cartes n'existent pas, c'est qu'il doit y aboir un sous-objectif à créer
         *  qui ne soit pas dans le deck objectif.
         */
        let tmpCard = cardError;
        game.forEach((deck,decki) => {
          deck.forEach((card,cardi) => {
            /** Cherche une carte avec une liaison "=>" dont la partie gauche a une liaison "=>".
             *  (pour l'instant c'est le seul cas connu pour créer un sous-objectif dans le deck
             *  à partir d'une carte qui ne soit pas dans le deck objectif.
             */
            if (card.color === null && card.link === "=>") {
              if (card.left.color === null && card.left.link === "=>" && (card.left.left.equals(objectif))) {
                tmpCard = [decki, cardi];
              }
            }
          })
        })
        setCardHelp(tmpCard);
        setCardHelp2(cardError);
      }
    }
  }

  /**
   * Recupère le numéro de la démonstration et met le jeu à ce moment-là de la partie.
   * @param {Event} event - on utilise event.target.id 
   */
  const demonstrationClickHandler = (event) => {
    var indiceRetour = event.target.id;
    if (indiceRetour !== lastGame.length) {
      let tmpLastGame = [...lastGame];
      let tmpSavedGame  = tmpLastGame[indiceRetour];
      // Initialise le futur tableau de jeu
      let tmpFutureGame = [];
      // Copie le dernier tableau de jeu sauvegardé dans le futur tableau
      for (let i = 0 ; i < tmpSavedGame.length ; i++) {
        tmpFutureGame[i] = [];
        for (let j = 0 ; j < tmpSavedGame[i].length ; j++) tmpFutureGame[i].push(tmpSavedGame[i][j].copy());
      }
      setIndentationDemonstration(createTabObj(tmpFutureGame)-1);
      allFalse(tmpFutureGame);
      // if (indiceRetour !== 0 || indiceRetour === lastGame.length-1) tmpSavedGame.pop();
      let tmpDemonstration = [];
      for (let i = 0 ; i <= indiceRetour; i++) tmpDemonstration.push(demonstration[i]);
      let tmpTabDemonstration = [];
      for (let i = 0 ; i <= indiceRetour; i++) tmpTabDemonstration.push(tabIndentation[i]);
      //if (indiceRetour !== 0 || indiceRetour === lastGame.length-1) tmpDemonstration.pop();
      let futurLastGame = [];
      for (let i = 0 ; i < indiceRetour; i++) futurLastGame.push(lastGame[i]);
      setLastGame(futurLastGame);
      setDemonstration(tmpDemonstration);
      setTabIndentation(tmpTabDemonstration);
      // allFalse(lastGame[indiceRetour]);
    }
  }

  return (
    <div className="game" >
      <div className="bouton">
      {/* Bouton pour ouvrir plusieurs fichiers JSON pour n'en avoir qu'1 à la fin */}
      {mode === "Create" && <input type="file" accept="application/json" multiple="multiple" onChange={convertFile} ></input>}
      {/* Bouton pour copier le résultat du bouton au-dessus dans le presse-papier */}
      {mode === "Create" && <button onClick={printConvertFile}>Copier les fichiers regroupés</button>}
      {/* Bouton pour ouvrir un fichier JSON et afficher l'exercice à l'écran pour le modifier */}
      {mode === "Create" && <input type="file" accept="application/json" onChange={openFile}></input>}
      {/* Copie du jeu actuel en format JSON dans le presse-papier */}
      {mode === "Create" && <button onClick={saveAsFile}>Copier le fichier</button>}
      {/* Affiche la ou les 2 cartes qui sont le prochain mouvement logique dans le but de finir l'exercice */}
        {false && <button onClick={getNextMove}>Aide</button>}
        {/* Revient à la partie avant l'ajout d'une carte */}
        <button id="back" onClick={retourEnArriere}><img src={"img/retour_arriere.png"} alt={"Retour arrière"} width={"17"} height={"23"}/></button>
        {/* Bouton pour obtenir les 2 parties d'une carte "et" */}
        {mode !== "Create" && <button id= "addAnd" className={(mode === "Tutoriel" && numero === 0) ? "boutonSelection" : ""} onClick={addCardAnd}><img src={"img/ajout_carte_et.png"} alt={"Ajout carte et"} width={"89"} height={"23"}/></button>}
        {/* Bouton pour obtenir la partie droite d'une carte "=>" si l'on a sélectionné une autre carte qui
            est égale à la partie gauche */}
        {mode !== "Create" && <button id= "addImplique" className={(mode === "Tutoriel" && numero === 1) ? "boutonSelection" : ""} onClick={addCardFuse}><img src={"img/ajout_carte_implique.png"} alt={"Ajout carte =>"} width={"106"} height={"23"}/></button>}
        {/* Fusionne 2 cartes (taille double max) et crée une 3ème carte composée de la partie gauche (1ère carte
            sélectionnée) & la partie droite (2ème carte sélectionnée). La carte créée aura une liaison "et" */}
        {mode !== "Create" && <button id= "fuseAnd" className={(mode === "Tutoriel" && numero === 2) ? "boutonSelection" : ""} onClick={fuseCardAdd}><img src={"img/fusion_carte_et.png"} alt={"Fusion carte et"} width={"106"} height={"23"}/></button>}
        {/* Fusionne 2 cartes (taille double max) et crée une 3ème carte composée de la partie gauche (1ère carte
            sélectionnée) & la partie droite (2ème carte sélectionnée). La carte créée aura une liaison "et".
            /!\ Pour l'instant ce bouton n'est pas affiché car je n'y vois aucune utilité à voir pour les prochains exercices ! */}
        {false && mode !== "Create" && <button onClick={fuseCardFuse}>Fusion carte {"=>"}</button>}
        {/* Ajout objectif secondaire */}
        {mode !== "Create" && <button id= "addGoal" className={(mode === "Tutoriel" && numero === 3) ? "boutonSelection" : ""} onClick={addObjectif}>Ajout objectif</button>}
      </div>
      {/* Message d'aide en mode tutoriel */}
      {mode === "Tutoriel" && messageTutoriel !== "" && <div className="message tutoriel">
        {messageTutoriel.map((element,index) => {
          return <div key={index}>{element}</div>
        })}
      </div>}
      {/* Message d'erreur si on essaye de faire un mouvement illégal (ex: vouloir séparer une carte qui n'a pas une liaison "et") */}
      {messageErreur !== "" && <div className="message error">
        {messageErreur}
      </div>}
      <GameTab.Provider value={game}>
        {/* Ajout des decks */}
        {game.map((deck, index) => (
            <Deck
              updateGame     = {update}
              indice         = {index}
              addCardFunc    = {addCard}
              deleteCardFunc = {deleteCard}
              nbDeck         = {game.length}
              mode           = {mode}
              objectif       = {tabObjectif}
              cardHelp       = {cardHelp}
              cardHelp2      = {cardHelp2}
              key            = {index}
            ></Deck>
        ))}
      </GameTab.Provider>
      {/* Affichage de la démonstration de logique mathématique de l'exercice */}
      <div className="demonstration">
        {demonstration.map((element, index) => {
            return <div key={index} id={index} style={{ marginLeft : tabIndentation[index]*20 }} onClick={demonstrationClickHandler}><Latex>{element}</Latex></div>
        })}
      </div>
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
                <input type="radio" value="black"  name="couleur" /> Noir
                <input type="radio" value="white"  name="couleur" /> Blanc
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
      {/* Popup disponible en mode création quand on sélectionne 2 cartes pour choisir la liaison de la future carte */}
      {popupFusion && (
        <Popup
          content={
            <>
              <b>Choisissez une liaison</b>
              <div onChange={choixLiaison}>
                <input type="radio" value="et" name="liaison" /> et
                <input type="radio" value="=>" name="liaison" /> {"=>"}
                <input type="radio" value="<=>" name="liaison" /> {"<=>"}
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
      {/* Popup disponible en mode création pour supprimer une carte avec un bouton qui lui est dédié */}
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
      {/* Popup de victoire quand on réussit l'objectif principal */}
      {popupWin && (
        <Popup
          content={
            <>
              <b>Bravo, vous avez gagné !</b>
              <button
                //onClick={nextExercise}
                onClick={function () {
                  setPopupWin(false);
                }}
              >
                ✖
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

export default Game;
