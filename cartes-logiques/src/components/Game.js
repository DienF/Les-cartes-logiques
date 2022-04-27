import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
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
  const cardError = new CardClass(9,"error",false,null,null);
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
  const [lastGame, setLastGame] = useState([]);
  const [messageErreur, setMessageErreur] = useState("");
  const [messageTutoriel, setMessageTutoriel] = useState("");
  const [tabObjectif , setTabObjectif] = useState([[0,0,false]]);
  const [cardHelp , setCardHelp] = useState(cardError);
  const [cardHelp2 , setCardHelp2] = useState(cardError);
  const navigate = useNavigate();
  let filesCopy = "";

  /**
   * Initialise l'exercice.
   */
  useEffect(() => {
    setTabObjectif([[0,0,false]]);
    setGame([[], []]);
    setLastGame([]);
    if (ex !== undefined && numero !== undefined && mode !== "Create") {
      allFalse(gameInput(ex[numero]));
    }
    setMessageErreur("");
    if(numero === 0){
      setMessageTutoriel(["Le but du jeu est de réussir à créer la carte qui est dans l’objectif dans le premier deck.","Vous pouvez sélectionner une carte en cliquant dessus."])
    }
    if(numero === 1){
      setMessageTutoriel(["Dans cet exercice nous allons apprendre le troisième bouton.","Ce bouton a besoin de deux cartes pour fonctionner.","Sélectionner deux cartes."])
    }
    if(numero === 2){
      setMessageTutoriel(["Dans cet exercice nous allons apprendre le quatrième bouton.","Ce bouton a besoin de deux cartes pour fonctionner.","Sélectionner deux cartes."])
    }
    if(numero === 3){
      setMessageTutoriel(["Dans cet exercice nous allons apprendre le dernier bouton.","Pour faire fonctionner ce bouton on doit sélectionner l’objectif."])

    }

  }, [mode, ex, numero])

  /**
   * Renvoie un nouveau Deck sans la carte passée en paramètre.
   * @param {Array}        deck - Deck dans lequel il faut supprimer la carte
   * @param {number} indiceCard - indice de la carte à supprimer
   * @returns {Array}
   */
  const delCard = (deck, indiceCard) => {
    //Le deck que l'on return
    let finalDeck = [];
    //met la carte a supprimer en null
    deck[indiceCard] = null;
    let cpt = 0;
    //recopie le deck sauf la carte qui est egale a null
    for (let i = 0; i < deck.length; i++) {
      if (deck[i] !== null) {
        let tmpCard = deck[i];
        tmpCard.id = tmpCard.id - cpt;
        finalDeck.push(tmpCard);
      }
      else cpt++;
    }
    //renvoie le nouveau deck
    return finalDeck;
  } 

  /**
   * Renvoie un nouveau tableau sans le Deck passé en paramètre.
   * @param {Array} currentGame - tableau de la partie (avec potentiellement des modifications)
   * @param {number} indiceDeck - indice du Deck à supprimer
   * @returns 
   */
  const delDeck = (currentGame, indiceDeck) => {
    // le tableau du jeu que l'on renvoie
    let finalGame = [];
    //met le deck a supprimer en null
    currentGame[indiceDeck] = null;
    //recopie le jeu sauf le deck qui est egale a null
    for (let i = 0;i<currentGame.length;i++) {
      if (currentGame[i] !== null) finalGame.push(currentGame[i]);
    }
    // renvoie le jeu sans le deck
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
    //met le message erreur en "" ce qui ne l'afiche plus
    setMessageErreur("");
    //n'affiche plus les deux cartes d'aide
    setCardHelp(cardError);
    setCardHelp2(cardError);
    //copie du jeu dans tmp
    let tmp = [...game];
    // la carte sur laquelle on a cliqué
    let currentCard = tmp[i][j];
    //copie du nombre de carte séléctionner
    let tmpNbselec = nbSelec;
    //copie de la permière carte séléctionner
    let tmpSelecDeck1 = selecDeck1;
    let tmpSelecCard1 = selecCard1;
    //copie de la deuxième carte séléctionne
    let tmpSelecDeck2 = selecDeck2;
    let tmpSelecCard2 = selecCard2;
    //rentre dans le if si
    //on ne clique pas sur l'objectif
    //le jeu n'est pas en mode create
    //si on clique sur l'objectifet qu'il a une liaison =>
    if ((i === game.length-1 && game[i][j].link === "=>" && mode !== "Create") || i !== game.length-1 || mode === "Create") {
      
      if (tmpSelecDeck1 === i && tmpSelecCard1 === j) {
        //la carte séléctionner est deja selectionner on la deselectionne (premiere carte)
        tmpSelecCard1 = -1;
        tmpSelecDeck1 = -1;
        tmpNbselec--;
        currentCard.select(!currentCard.active);
      }
      else if (tmpSelecDeck2 === i && tmpSelecCard2 === j) {
        //la carte séléctionner est deja selectionner on la deselectionne (deuxième carte)
        tmpSelecCard2 = -1;
        tmpSelecDeck2 = -1
        tmpNbselec--;
        currentCard.select(!currentCard.active);
      }
      else if (tmpSelecDeck1 === -1 && tmpSelecCard1 === -1) {
        //aucune carte n'est séléctionner
        tmpSelecDeck1 = i;
        tmpSelecCard1 = j;
        tmpNbselec++;
        currentCard.select(!currentCard.active);
      }
      else if (tmpNbselec < 2) {
        //une seul est unique carte est séléctionner
        tmpSelecDeck2 = i;
        tmpSelecCard2 = j;
        tmpNbselec++;
        currentCard.select(!currentCard.active);
      }
    }
    //affecte toute les variable temporaire au vrai variable
    setNbSelec(tmpNbselec);
    setSelecCard1(tmpSelecCard1);
    setSelecCard2(tmpSelecCard2);
    setSelecDeck1(tmpSelecDeck1);
    setSelecDeck2(tmpSelecDeck2);
    //on remet la carte dans le jeu avec les changement
    tmp[i][j] = currentCard;
    //on actualise le jeu
    setGame(tmp);
    // affiche le popup de fusion en mode creation si deux cartes sont séléctionner
    if (tmpNbselec === 2 && mode === "Create") setPopupFusion(true);
    //Affichage des tutoriel en fonction de l'exercice et du nombre de carte sél
    if(mode === "Tutoriel"){
      if(numero === 0){
        setMessageTutoriel(["Une fois une carte sélectionner elle aura un contoure noire", 
        "Vous pouvez utiliser les boutons au-dessus pour effectuer une action.",
        "Dans cet exercice nous allons apprendre le deuxième bouton.",
        "Ce bouton a besoin de deux conditions :",
        "- Une seule carte doit être sélectionner",
        "- La carte doit avoir une liaison \"et\".",
        "Quand les conditions sont validées la partie gauche et droite de la carte est ajouter au deck."]
        );
      }
      if(tmpNbselec === 2 && numero === 1){
        setMessageTutoriel(["Ce bouton a besoin de trois conditions :",
        "- Avoir deux cartes sélectionner",
        "- Une des deux cartes doit avoir une liaison \"=>\"",
        "- La partie gauche de la carte avec la liaison \"=>\" doit être identique à l’autre carte",
        "Quand les conditions sont validées la partie droite de la carte avec la liaison \"=>\" est créer dans le deck."]
        );
      }
      if(tmpNbselec === 2 && numero === 2){
        setMessageTutoriel(["Ce bouton a besoin de deux conditions :",
        "- Avoir deux cartes sélectionner",
        "- Les deux cartes sélectionner doivent comporter une ou deux cartes.",
        "Quand les conditions sont validées une nouvelle carte est créée avec les deux autres cartes sélectionner et cette carte aura une liaison \"et\""]
        );
      }
      if(tmpNbselec === 1 && numero === 3 && Math.max(tmpSelecDeck1,tmpSelecDeck2) === game.length-1){
        setMessageTutoriel(["Ce bouton a besoin de deux conditions :",
        "- Une seule carte doit être sélectionner.",
        "- La carte sélectionner doit être dans le deck des objectifs.",
        "La carte sélectionner doit avoir une liaison \"=>\"",
        "Quand les conditions sont validées un objectif secondaire se créer, l’objectif secondaire est la partie droite de la carte sélectionner, un deck se créer avec la carte qui est à gauche de la carte sélectionner."]
        );
      }
    }
    
  };

  /**
   * Déselectionne toute les cartes dans le tableau recu et devien le jeu.
   */
  const allFalse = (tmp) => {
    // supression des message erreur
    setMessageErreur("");
    // on deselectionne tout
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-1);
    setSelecDeck2(-1);
    // on met toute les carte du jeu passer en paramètre en mode non sélectionner
    tmp.forEach((e) => {
      e.forEach((s) => {
        s.select(false);
      });
    });
    // on actualise le jeu
    setGame(tmp);
  };

  /**
   * Déselectionne toute les cartes du jeu.
   */
  const allFalseGame = () => {
    // supression des message erreur
    setMessageErreur("");
    // on deselectionne tout
    setNbSelec(0);
    setSelecCard1(-1);
    setSelecDeck1(-1);
    setSelecCard2(-1);
    setSelecDeck2(-1);
    // copie du jeu actuelle
    let tmp = [...game];
    // on met toute les carte du jeu actuelle en mode non sélectionner
    tmp.forEach((e) => {
      e.forEach((s) => {
        s.select(false);
      });
    });
    // on actualise le jeu
    setGame(tmp);
  };



  /** 
   * !!!Attention cette fonction doit etre uniquement appeller en mode create ou pour faire des tests !!!
   * Fait apparaître le popup qui nous demande la couleur de la carte qu'on veut ajouter.
   * @param {number} deckIndice - l'indice du deck où l'on ajoute une carte
   */
  const addCard = (deckIndice) => {
    // indique dans quel deck on veut ajouter une cartes
    setIndiceDeckAddCard(deckIndice);
    //affiche le popup pour ajouter une carte simple
    setPopupAddCard(true);
  };

  /**
   * !!!Attention cette fonction doit etre uniquement appeller en mode create ou pour faire des tests !!!
   * Crée une carte avec la couleur selectionnée (ne ferme pas le popup quand on sélectionne une couleur).
   * @param {*} event (event.target.value)   - reçoit la couleur cliquée ;
   *                  (event.target.checked) - on le met à false si on veut faire plusieurs fois la même couleur
   */
  const choixCouleur = (event) => {
    // sauvgarde le jeu (utiliser pour pouvoir faire des retour en arrière)
    saveGame();
    // copie le jeu
    let tmp = [...game];
    // met le radio bouton cliquer en non chequer
    event.target.checked = false;
    // ajoute la carte dans le deck (indiceDeckAddCard est affecter avant de rentrée dans la fonction)
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length, // id (taille du deck avant ajout)
        event.target.value,             // color (recu avec le radio bouton)
        false,                          // active
        "",                             // link
        null,                           // left
        null                            // right
      )
    );
    // actualise le jeu et met tout le monde en mode non séléctionner
    allFalse(tmp);
  };

  /**
   * !!!Attention cette fonction doit etre uniquement appeller en mode create ou pour faire des tests !!!
   * Crée une carte complexe avec les 2 cartes sélectionnées (cette fonction est appelée à la fin de {@link update()} en mode création).
   * @param {*} event (event.target.value) - reçoit la liaison cliquée
   */
  const choixLiaison = (event) => {
    // sauvgarde le jeu (utiliser pour pouvoir faire des retour en arrière)
    saveGame();
    //copie du jeu
    let tmp = [...game];
    // met le radio bouton cliquer en non chequer
    event.target.checked = false;
    //liaison recu avec le radio bouton
    const l = event.target.value;
    // copie les deux cartes séléctionner     
    let c1 = game[selecDeck1][selecCard1].copy();
    let c2 = game[selecDeck2][selecCard2].copy();
    c1.id = 0;
    c2.id = 1;
    //ajoute la carte fusionner dans le deck de la premiere carte séléctionner
    tmp[selecDeck1].push(
      new CardClass(
        game[selecDeck1].length,           // id
        null,                                     // color
        false,                                    // active
        l,                                        // link
        c1,                                       // left
        c2                                        // right
      )
    );
    //enleve le popup
    setPopupFusion(false);
    // actualise le jeu et met tout le monde en mode non séléctionner
    allFalse(tmp);
  };

  /**
   * !!!Attention cette fonction doit etre uniquement appeller en mode create ou pour faire des tests !!!
   * Supprime la carte qui est sélectionnée.
   */
  const deleteCard = () => {
    //enleve le popup
    setPopupDeleteCard(false);
    // si la carte séléctionner n'est pas la carte 1 tout deselectionner
    if (!(selecCard1 === -1 && selecDeck1 === -1)) {
      // sauvgarde le jeu (utiliser pour pouvoir faire des retour en arrière)
      saveGame();
      //copie le jeu
      let tmp = [...game];
      // suprimme la carte
      tmp[selecDeck1] = delCard(game[selecDeck1],selecCard1);
      // actualise le jeu et met tout le monde en mode non séléctionner
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
    // le tableau que l'on renvoie
    let res = [[], []];
    // transforme toute les carte en objet (avec seulement les information essentielle)
    // la couleur ou liaison + left + right
    // la carte est ajouter dans le tableau renvoyer
    game.forEach(function (deck, index) {
      deck.forEach(function (card) {
        res[index].push(card.toFile());
      });
    });
    // renvoie le tableau
    return res;
  };

  /**
   * Reçoit un tableau d'un fichier JSON à qui on va appliquer la méthode {@link JSON.parse()} dans {@link openFile()}
   * ({@link JSON} ⇒ tableau d'{@link Object}) et renvoie un tableau qui peut être lu par notre site.
   * @param {Object[]} data - tableau d'objets qui va servir pour l'initialisation
   * @returns un tableau de Deck
   */
  const gameInput = (data) => {
    // tableau que l'on renvoie
    let res = [[], []]
    // id de la future carte
    let i = 0;
    // créeation du deck de départ
    data[0].forEach(element => {
        res[0].push(toClass(element, i));
      i++;
    });
    i = 0;
    //création du deck objectif
    data[1].forEach(element => {
      res[1].push(toClass(element, i));
      i++;
    });
    //renvoie le tableau de jeu
    return res;
  }

  /**
   * @todo Stocker dans un fichier sur le serveur ou sur le PC local ou laisser comme ça (afficher le JSON dans la console).
   */
  const saveAsFile = () => {
    // variable copier
    let res;
    // copie json du jeu
    res = gameOutput(game);
    //copie la variable dans le presse papier
    navigator.clipboard.writeText(JSON.stringify(res, null, 1)).then(() => {})
  };

  /**
   * Ouvre un fichier Json et l'affiche à l'écran.
   */
  const openFile = (event) => {
    //verifie que l'on est séléctionenr un fichier
    if(event.target.files.length >0)
    {
      // variable pour lire le fichier 
      var reader = new FileReader();
      // lit le fichier
      reader.onload = (event) =>{
        // transforme le fichier json en objet
        var obj = JSON.parse(event.target.result);
        //met le jeux a jour avec le fichier json recu
        setGame(gameInput(obj));
      }
      // effectue la fonction onload juste au dessus avec le premier fichier recu
      reader.readAsText(event.target.files[0]);
    }

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
   * Renvoie la place de l'objectif chercher dans le tableau game[game.length-1]
   * 
   * @param {CardClass} cardObj - La partie droite de l'objectif que l'on cherche 
   * @returns int
   */
  const findObjectifRelative = (cardObj) =>{
    // variable renvoyer (-1 si il trouve pas)
    let num = -1;
    // deck objectif
    let deck = game.length-1;
    // cheche parmis les cartes de l'objectif si il y a une 
    // carte dont la partie droite est egale a la carte envoyer en paramètre
    // si oui num prend la valeur de l'index de cette carte
    game[deck].forEach((element,index) =>{
      // regarde si la couleur est null (si elle est null la carte est au moins double)
      if(element !== null && element.color === null){
        if(element.right.equals(cardObj)){
          num = index;
        }
      }
    })
    // renvoie -1 ou la place de la carte
    return num;
  }

  /**
   * Créer le tableau tabObjectif en fonction des objectifs présents dans tmp
   * 
   * @param {*} tmp un tableau (une game)
   */
  const createTabObj = (tmp) =>{
    // creation du tableau que l'on va affecter a tabObjectif
    let tmpObj = [];
    // push l'objectif principal
    tmpObj.push([0,0,false]);
    // parcourt le deck objectif a la recherche d'une simple qui ne soit
    // pas l'objectif principal
    // si il y en a une elle ajoute dans le tableau
    tmp[tmp.length-1].forEach((element,index) =>{
      if(index !== 0){
        if(element.color !== null){
          tmpObj.push([tmpObj.length,index,true]);
        }
      }
    })
    // actualise le tableau des objectif
    setTabObjectif(tmpObj);
  }
  /**
   * Compare l'objectif (game[game.length-1][numObjectif]) et toutes les cartes du deck currentDeck(currentDeck = numObjectif) :
   * si on vérifie le deck 0, renvoie true si on trouve l'objectif ;
   * si on ne vérifie pas le deck 0, si l'objectif est dans le deck on ajoute l'objectif au dessus du deck précédent et 
   * on regarde le deck en dessous (currentDeck-1) pour voir si la carte ajoutée n'est pas l'objectif du dessus.
   * @param {number} numObjectif - le numero de l'objectif
   * @returns {true|false} true ou false
   */
  const isWin = (numObjectif) => {
    // objectif a verifier
    const objectif = game[game.length-1][tabObjectif[numObjectif][1]];
    // indice du deck lié a l'objectif
    let currentDeck = numObjectif;
    // variable a renvoyer de base on renvoie false
    let bool = false;
    // parcourt le deck lié a l'objectif
    game[currentDeck].forEach((card) => {
      // si une carte lié a cette objectif est trouvé l'objectif est validé
      if (card.equals(objectif)) {
        // si c'est l'objectif principal on cherche pas plus loin
        // fin de partie
        if (currentDeck === 0) bool = true;
        else {
          // si c'est un objectif secondaire
          
          // copie du jeu
          let tmp = [...game];
          // la carte qui a servie a créer l'objectif secondaire
          let tmpCard = game[game.length-1][findObjectifRelative(objectif)].copy();
          tmpCard.id = tmp[tabObjectif[currentDeck][1]-1].length;
          // ajoute cette carte dans le deck précédent
          tmp[currentDeck-1].push(tmpCard);
          // surpprime l'objectif
          tmp[tmp.length-1] = delCard(tmp[tmp.length-1],tabObjectif[currentDeck][1]);
          // verifie si l'objectif a un objectif lié
          if(tabObjectif[currentDeck][2]){
            // si oui supprime egalement l'objectif qui lui est lié
            tmp[tmp.length-1] = delCard(tmp[tmp.length-1],findObjectifRelative(objectif));
          }
          // supprime le deck qui a servie pour cette objectif secondaire
          tmp = delDeck(tmp, currentDeck);
          //met a jour la table des objectif
          createTabObj(tmp);
          // met a jour le jeu
          setGame(tmp);
          // regarde l'objectif precedent pour voir si le fait
          // d'ajouter l'objectif secondaire ne la pas validé
          // si cela valide l'objectif principale
          // bool = true
          // sinon bool = false
          bool = isWin(currentDeck-1);
        }
      }
    })
    // renvoie true si l'obejctif principal est vrai
    // sinon renvoie false
    return bool;
  }

  /**
   * Prend le dernier élément du tableau {@link lastGame} et remplace la variable {@link game}.
   * (ne marche pas)
   */
  const retourEnArriere = () => {
    // regarde si il y a au moin une sauvegarde du jeu
    if (lastGame.length !== 0) {
      // copie le tableau de sauvegrade
      let tmpLastGame   = [...lastGame];
      // prend le dernier tableau de jeu ajouter
      let tmpSavedGame  = tmpLastGame[tmpLastGame.length-1];
      // initialise le future tableau de jeu
      let tmpFutureGame = [];
      // copie le dernier tableau de jeu sauvegardé dans le futur tableau
      for (var i = 0 ; i < tmpSavedGame.length ; i++) {
        tmpFutureGame[i] = [];
        for (var j = 0 ; j < tmpSavedGame[i].length ; j++) {
          tmpFutureGame[i].push(tmpSavedGame[i][j].copy());
        }
      }
      // refait le tableau des objectifs au cas ou
      // le retour en arrière est suprimmer un objectif secondaire
      createTabObj(tmpFutureGame);
      // met a jour le jeu avec la dernier sauvegarde
      // met toute les cartes en mode désélectionner
      allFalse(tmpFutureGame);
      // suprimme la dernière sauvegrade du jeu
      tmpLastGame.pop();
      // met a jour le tableau des sauvegardes
      setLastGame(tmpLastGame);

    }
  }

  /**
   * À la base la fonction qui sauvegarde la partie qui est pour l'instant recopié 3 fois dans les autres fonctions
   * car ne fonctionne pas en appelant une fonction (asynchrone).
   */
  const saveGame = () => {
    // copie du tableau de sauvegarde
    let tmpLastGame = [...lastGame];
    // copie le jeu actuelle
    let saveGameTmp = copyGame();
    // ajoute le jeu actuelle dans le tableau des sauvegardes
    tmpLastGame.push(saveGameTmp);
    // met a jour le tableau des sauvegardes
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
      }
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
      }
    }
    else {
      setMessageErreur("Vous devez sélectionner deux cartes !");
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
      }
    }
    else {
      setMessageErreur("Vous devez sélectionner deux cartes !");
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
      }
    }
    else {
      setMessageErreur("Vous devez sélectionner deux cartes !");
    }
  }

  /**
   * Cette Fonction sert a determiner si un objectif est deja créer
   * 
   * Cherche dans les objectifs si il existe une carte qui est égale a:
   * - Si le deck est l'objectif la partie droite de la carte recue
   * - Sinon la partie gauche de la carte recue
   * 
   * @param {int} deck - indice du deck
   * @param {int} card - indice de la carte
   * @returns true/false
   */
  const deckContain = (deck , card) =>{
    let bool = false;
    game[game.length-1].forEach(element =>{
      if(deck === game.length-1) {
        if(element.equals(game[deck][card].right))bool = true;
      }
      else {
        if(element.equals(game[deck][card].left))bool = true;
      }
      
    })

    return bool;
  }

  /**
   * Fonction appelée après avoir appuyé sur le bouton "Ajouter objectif".
   * 
   * Une seule et unique carte doit être sélectionner sinon un popup d'erreur apparaît avec ce message : 
   *    Si deux cartes sont sélectionnées :  "Vous devez sélectionner une seule carte !"
   *    Si zéro carte sont sélectionnées  :  "Vous devez sélectionner une carte !" 
   * 
   * La carte sélectionner doit avoir une liaison principale de type "=>" sinon un popup d'erreur apparait avec ce message :
   *    "L'objectif secondaire doit avoir une liaison "=>" !
   * 
   * Si toutes les conditions énumérées au-dessus sont respectées il y a deux possibilité :
   *    La carte selectionné est dans les objectifs : Ajoute la partie gauche dans le dernier deck avant l'objectif et la droite dans l'objectif et 
   *          defini cette objectif comme un objectif secondaire. 
   *    Le reste : Ajoute la partie gauche dans l'objectif et ne le considere pas comme un objectif secondaire.
   */
  const addObjectif = () =>{
    
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      let deckI = Math.max(selecDeck1,selecDeck2);
      let cardI = Math.max(selecCard1,selecCard2);
      if(true || !(game.length === 2 && (cardI !== 0 || deckI === 0))){
        if(!deckContain(deckI,cardI)){
          if (game[deckI][cardI].link === "=>"){
            let secondObjectif;
            let tmp = [...game];
            let tmpObjectif = [...game[game.length-1]];
            saveGame();
            let tmpCard;
            if (deckI === game.length-1){
              if(mode === "Tutoriel" && numero === 3){
                setMessageTutoriel(["Vous devez maintenant compléter l’objectif secondaire.",
                "Si vous compléter l’objectif secondaire cela créera la carte d’où il a été créer dans deck avant, dans notre cas dans le deck départ cela complétera l’objectif principal dans notre cas."]);
              }
              secondObjectif = game[selecDeck1][selecCard1].right.copy();
              tmp[game.length-1] = [];
              tmpCard = game[selecDeck1][selecCard1].left.copy();
              tmpCard.id = 0;
              tmp[game.length-1].push(tmpCard);
              tmp.push(tmpObjectif);
              secondObjectif.id = game[game.length-1].length;
              tmpObjectif.push(secondObjectif)
              let tmpObj = [...tabObjectif];
              if(game[game.length-1].length >1){
                tmpObj.push([tabObjectif.length,game[game.length-1].length,true]);
              }
              else{
                tmpObj.push([tabObjectif.length,game[game.length-1].length,false]);
              }
              
              setTabObjectif(tmpObj);
            }
            else{       
              if(game[deckI][cardI].left.link === "=>"){
                secondObjectif = game[selecDeck1][selecCard1].left.copy();
                secondObjectif.id = game[game.length-1].length;
                tmpObjectif.push(secondObjectif)        
                tmp[tmp.length-1] = tmpObjectif;
              }
              else{
                setMessageErreur("L'objectif secondaire doit avoir une liaison \"=>\" !");
              }   
  
            }
            allFalse(tmp);
          }
        }
        else {
          setMessageErreur("Cette objectif existe deja !");
        }
      }
      else{
        setMessageErreur("Le premier objectif secondaire doit être créer avec l'objectif principal !");
      }
      

    }
    else{
      if (nbSelec > 1)   setMessageErreur("Vous devez sélectionner une seule carte !");
      if (nbSelec === 0) setMessageErreur("Vous devez sélectionner une carte !")
    }
  }

  /**
   * Appeler avec le selecteur recoie le numero puis redirige le site vers l'exercice corespondans
   * @param {*} event - le selecteur ( le numero est dans event.target.value)
   */
  const changeExercise = (event) =>{
    let value = event.target.value;
    if(value !== ""){
      let url = "/Exercise" +mode + value ;
      navigate(url);
    }

  }
  
  /**
   * Recoie plusieur fichier puis transforme ces fichier en un seul
   * @param {*} event - le bouton qui recois les fichier (event.target.files)
   */
  const convertFile = (event) =>{
    filesCopy = "";
    if(event.target.files.length >0)
    {
      
      Array.from(event.target.files).forEach((element) =>{
        var reader = new FileReader();
        reader.onload = event =>{
          filesCopy += event.target.result + ",";
        }
        reader.readAsText(element);
      })
    }
  }
  
  /**
   * Copie dans le presse-papier le fichier obtenue avec le bouton select fichiers
   */
  const printConvertFile = () =>{
    navigator.clipboard.writeText("[" + filesCopy.substring(0,filesCopy.length-1) + "]").then(() => {})
  }

  /**
   * Redirige vers le prochain exercice si il existe
   */
  const nextExercise = () =>{
    if(numero+2 <= ex.length){
      let url = "/Exercise" +mode + (numero+2) ;
      navigate(url);
    }

    setPopupWin(false);
  }

  const isObtainableEt = (card,cardTest) =>{
    let bool = false;
    if(card.color === null){
      if(card.link === "et" && (card.left.equals(cardTest) || card.right.equals(cardTest))){
        bool = true;
      }
    }
  

    return bool;
  }
  const isObtainableImplique = (card,cardTest) =>{
    let bool = false;
    if(card.color === null){
      if((card.link === "=>" && card.right.equals(cardTest) ) || isObtainableImplique(card.right,cardTest) || isObtainableEt(card.right,cardTest)){
        bool = true;
      }
    }
    
    return bool;
  }
  const containCard = (tmp,deckId , card) =>{
    let bool = false;
    tmp[deckId].forEach(cardElement =>{
      if(cardElement.equals(card)){
        bool = true;
      }
    })
    return bool;
  }
  const recursiveSoluce = (tmp,cardTest,deckId , deckObjectif , chemin) =>{
    let tmpCard;
    chemin[1] = false;
    let tmpChemin;
    let deckIndex = 0;
    if(cardTest.link === "et" && !containCard(tmp,deckObjectif,cardTest)){
      //console.log("Carte objectif " + cardTest.toString());
      chemin[0].push(cardTest.copy());
      tmpChemin = [...recursiveSoluce(tmp,cardTest.left,deckIndex,deckObjectif,chemin)];
      chemin = [...tmpChemin];
      if(chemin[1]){
        tmp = copyGame();
        tmpChemin = [...recursiveSoluce(tmp,cardTest.right,deckIndex,deckObjectif,chemin)];
        chemin = [...tmpChemin];
      }
        
     
    }
    if(!chemin[1] && deckId === tmp.length-1 && cardTest.link === "=>"){
      //console.log("Add objectif");
      tmp.splice(tmp.length-1,0,[]);
      tmp[tmp.length-2].push(cardTest.left.copy());
      tmp[tmp.length-1].push(cardTest.right.copy());
      chemin[0].push(tmp[tmp.length-1][tmp[tmp.length-1].length-1].copy());
      tmpChemin = [...recursiveSoluce(tmp,tmp[tmp.length-1][tmp[tmp.length-1].length-1],tmp.length-1,deckObjectif+1,chemin)];
      chemin = [...tmpChemin];
    }
    if(!chemin[1]){
      tmp.slice().reverse().forEach((deck,i) =>{
        deckIndex = tmp.length-1-i;
        deck.forEach((card,cardIndex) =>{
          if(deckObjectif>=deckIndex){
            if(!chemin[1]  && deckIndex !== tmp.length-1 && deckIndex === deckObjectif && containCard(tmp,deckIndex,cardTest)){
              chemin[1] = true;
              if(!chemin[0][chemin[0].length-1].equals(cardTest)){
                chemin[0].push(cardTest.copy());
              }
              
            }
            if(!chemin[1] && deckIndex !== tmp.length-1 &&  isObtainableImplique(card,cardTest)){
              //console.log(card.left.toString() + " Implique " +cardTest.toString());
              if(card.right.color === null){
                tmpChemin = [...recursiveSoluce(tmp,card.right.left,deckIndex,deckObjectif,chemin)];
                chemin = [...tmpChemin];
              }
              if(chemin[0]){
                chemin[0].push(card.copy());
                tmpChemin = [...recursiveSoluce(tmp,card.left,deckIndex,deckObjectif,chemin)];
                chemin = [...tmpChemin];
              }
  
            }
            if(!chemin[1] && deckIndex !== tmp.length-1 &&  isObtainableEt(card,cardTest)){
              //console.log(card.toString() + "utilisé ajout des cartes : " + card.left.toString() +" et " + card.right.toString() );
              chemin[0].push(card.copy());
              if(card.left.equals(cardTest)){
                tmpCard = card.left;
              }
              else{
                tmpCard = card.right;
              }
              tmp[deckId].push(card.right.copy());
              tmp[deckId].push(card.left.copy());
              tmpChemin = [...recursiveSoluce(tmp,tmpCard,deckIndex,deckObjectif,chemin)];
              chemin = [...tmpChemin];
            }
            if(!chemin[1] && deckId !== tmp.length-1 && cardTest.link === "=>"){
              if(card.color === null && card.left.link === "=>"){
                tmp[tmp.length-1].push(card.left.copy());
                tmpChemin = [...recursiveSoluce(tmp,tmp[tmp.length-1][tmp[tmp.length-1].length-1],tmp.length-1,deckObjectif+1,chemin)];
                chemin = [...tmpChemin];
              }
        
            }
  
          }
        })
      })
    }
    return chemin;
  }
  const soluceExercise = () =>{
    let tmp = [...game];
    let chemin = [[],false];
    let objectif = tmp[1][0];
    let result = recursiveSoluce(tmp,objectif,1,0,chemin);
    let affiche;
    if(result[1]){
      console.log("Solution trouvé")
      if(objectif.link === "=>"){
        console.log("Ajout Objectif secondaire : " + result[0][0] );
        console.log("Création d'une LPU avec la carte " + objectif.left.toString());
        affiche = result[0].reverse();
        for(var i=0;i<affiche.length-1;i++){
          if(affiche[i].color !== null ){
            if(affiche[i+1].link === "=>"){
              console.log("Utilisation de la carte " + affiche[i] + " et " + affiche[i+1] + " Création de la carte "+affiche[i+1].right);
            }
            i++;
          }
          else if(affiche[i].link === "=>"){
            console.log("Utilisation de la carte " + affiche[i].left + " et " + affiche[i]+ " Création de la carte "+affiche[i].right);
          }
        }
        console.log("Objectif secondaire remplie");

      }
      else if(objectif.link === "et"){
      
      }
      else{

      }
    }
    else{
      console.log("Aucune solution trouvé")
    }
    tmp = null;
  }

  const copyGame = () =>{
    let tmp = [];
    for (var i = 0 ; i < game.length ; i++) {
      tmp[i] = [];
      for (var j = 0 ; j < game[i].length ; j++) {
        tmp[i].push(game[i][j].copy());
      }
    }
    return tmp;
  }
  const getNextMove = () =>{
    let tmp = copyGame();
    let chemin = [[],false];
    let deckId = tmp.length-1;
    let cardId = tmp[tmp.length-1].length-1;
    let objectif = tmp[deckId][cardId];
    let result = recursiveSoluce(tmp,objectif,deckId,cardId,chemin);
    let affiche = result[0].reverse();
    let res = affiche[1];
    if(objectif.link === "=>" && game.length === 2){
      res = objectif;
      setCardHelp(res);
      setCardHelp2(cardError);
    }
    else if(res.link === "et"){
      setCardHelp(res);
      setCardHelp2(cardError);
    }
    else{
      setCardHelp(res);
      setCardHelp2(affiche[0]);
    }
    return res;
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
        {true && <button onClick={getNextMove}>Aide</button>}
        <button onClick={retourEnArriere}>Retour en arrière</button>
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 0) ? "boutonSelection" : ""} onClick={addCardAnd}>Ajout carte et</button>}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 1) ? "boutonSelection" : ""} onClick={addCardFuse}>Ajout carte {"=>"}</button>}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 2) ? "boutonSelection" : ""} onClick={fuseCardAdd}>Fusion carte et</button>}
        {false && mode !== "Create" && <button onClick={fuseCardFuse}>Fusion carte {"=>"}</button>}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 3) ? "boutonSelection" : ""}onClick={addObjectif}>Ajout objectif</button>}
      </div>
      {mode === "Tutoriel" && messageTutoriel !== "" && <div className="message tutoriel">
        {messageTutoriel.map((element,index) =>{
          return<div key={index}>{element}</div>
          
        })}
      </div>}
      {messageErreur !== "" && <div className="message error">
        {messageErreur}
      </div>}
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
            <Deck
              updateGame     = {update}
              indice         = {index}
              addCardFunc    = {addCard}
              deleteCardFunc = {setPopupDeleteCard}
              nbDeck         = {game.length}
              mode           = {mode}
              objectif       = {tabObjectif}
              cardHelp       = {cardHelp}
              cardHelp2      = {cardHelp2}
              key            = {index}
            ></Deck>
        ))}
      </GameTab.Provider>
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
                onClick={nextExercise}
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
