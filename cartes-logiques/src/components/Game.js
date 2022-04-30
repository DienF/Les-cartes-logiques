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
    if (this.color  !== null) res += this.color.toString();
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
  // carte qui n'existera jamais dans un deck
  var cardError = new CardClass(-1,"error",false,null,null); 

  // tableau ou sont réunie toute les cartes et deck
  // il est disposer comme ca
  //  deck départ       deck sous objectif      deck objectif
  //    game[0]              game[...]            game[n-1]
  //    game[0][0]          game[...][0]          game[n-1][0]
  //    game[0][1]
  //    game[0][2]

  // game[0][0] = une carte
  // game[...][0] = la partie gauche d'un objectif =>
  // game[n-1][0] = objectif principal
  const [game, setGame] = useState([[]]);

  // le nombre de carte séléctionner
  const [nbSelec, setNbSelec] = useState(0);

  // indice du deck de la première carte séléctionenr
  const [selecDeck1, setSelecDeck1] = useState(-1);

  // inidice de la carte dans le deck de la premiere carte séléctionner
  const [selecCard1, setSelecCard1] = useState(-1);

  // indice du deck de la deuxième carte séléctionenr
  const [selecDeck2, setSelecDeck2] = useState(-1);

  // inidice de la carte dans le deck de la deuxième carte séléctionner
  const [selecCard2, setSelecCard2] = useState(-1);

  // variable gerant le popup d'ajout de carte en mode création
  // false = on voit pas le popup
  // true  = on voit le popup
  const [popupAddCard, setPopupAddCard] = useState(false);

  // variable gerant le popup de supression de carte en mode création
  // false = on voit pas le popup
  // true  = on voit le popup
  const [popupDeleteCard, setPopupDeleteCard] = useState(false);

  // indice du deck dans lequel sera ajouté la carte en mode création
  // avec le bouton ajout carte ou en séléctionnant deux carte
  // en choisissant la liasion 
  const [indiceDeckAddCard, setIndiceDeckAddCard] = useState(0);
  
  // popup aparait en mode création pour choisir la liasion 
  // quand deux carte sont séléctionne
  // false = on voit pas le popup
  // true  = on voit le popup
  const [popupFusion, setPopupFusion] = useState(false);
  
  // popup quand on finit un exercice (objectif principal dans le deck 0)
  // false = on voit pas le popup
  // true  = on voit le popup
  const [popupWin,setPopupWin] = useState(false);

  // tableau de sauvegarde de copie d'ancien tableau "game"
  const [lastGame, setLastGame] = useState([]);

  // message a afficher en cas de coup illégal
  // si le message est "" on affiche rien
  const [messageErreur, setMessageErreur] = useState("");
  
  // message tutoriel a afficher en mode tutoriel
  // Attention c'est un tableau de string
  // si la variable = "" on affiche rien
  const [messageTutoriel, setMessageTutoriel] = useState("");
  
  // tableau des objectifs
  // sous cette forme [numero objectif , indice de la carte dans le deck , (numero != indice)]
  // il se peut qu'il y est des cartes entre les sous objectif 
  // comme dans l'exercice 5
  const [tabObjectif , setTabObjectif] = useState([[0,0,false]]);

  // change les contoures des cartes qui sont egale au carte help
  // elle sont changer dans la fonction getNextMove
  const [cardHelp , setCardHelp] = useState(cardError);
  const [cardHelp2 , setCardHelp2] = useState(cardError);

  //variable pour les redirection
  // utilisation : navigate(url)
  const navigate = useNavigate();

  // variable qui recois les jsons des fichiers
  // voir fonction convertFile et printConvertFile
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
    if (lastGame.length > 0) {
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
    else{
      allFalseGame();
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
    // si une seule carte est séléctionner
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      // prendre la carte qui est séléctionner
      // si elle est pas séléction c'est -1 donc on prend la plus haute valeur
      let deckI = Math.max(selecDeck1,selecDeck2);
      let cardI = Math.max(selecCard1,selecCard2);
      // la carte séléctionner doit avoir la liaison principal et
      if (game[deckI][cardI].link === "et") {
        //sauvegarde
        saveGame();
        //copie du tableau de jeu
        let tmp = [...game];
        // ajoute la partie gauche de la carte dans le jeu
        tmp[deckI].push(game[deckI][cardI].left.copy());
        tmp[deckI][tmp[deckI].length-1].id = tmp[deckI].length-1;
        // ajoute la partie droite de la carte dans le jeu
        tmp[deckI].push(game[deckI][cardI].right.copy());
        tmp[deckI][tmp[deckI].length-1].id = tmp[deckI].length-1;
        //mise a jour du jeu + désélectionne toute les cartes
        allFalse(tmp);
        // verifie si l'exercice est fini si oui affichie popup victoire
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
    // si il y a deux carte séléctionner
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      // prend le deck le plus grand
      let finalDeck = Math.max(selecDeck1,selecDeck2);
      if(finalDeck !== game.length-1){
        //copie du tableau de jeu
        let tmp   = [...game];
        // regarde si la deuxieme carte a une liaison => et si sa partie gauche est egale a l'autre carte
        // met le resultat dans bool
        // on ne met pas directement la condition dans le if car on veut savoir avec quel condition on est rentré dans le if
        let bool  = (tmp[selecDeck2][selecCard2].link === "=>" && tmp[selecDeck2][selecCard2].left.equals(tmp[selecDeck1][selecCard1]));
        // une des deux carte doit avoir une lisaion =>
        if (bool || (tmp[selecDeck1][selecCard1].link === "=>" && tmp[selecDeck1][selecCard1].left.equals(tmp[selecDeck2][selecCard2]))) {
          //sauvegarde
          saveGame();
          // initialisation de la carte ou la liaison => va etre utiliser
          let deckCarteComplex = -1;
          let cardCarteComplex = -1;
          // determine et affecter l'id de la carte => utiliser
          if (bool) {
            deckCarteComplex = selecDeck2;
            cardCarteComplex = selecCard2;
          }
          else {
            deckCarteComplex = selecDeck1;
            cardCarteComplex = selecCard1;
          }
          // ajoute la partie droite de la carte => utiliser dans le deck le plus haut
          tmp[finalDeck].push(tmp[deckCarteComplex][cardCarteComplex].right.copy());
          tmp[finalDeck][tmp[finalDeck].length-1].id = tmp[finalDeck].length-1;
          // met a jour le jeu + désélectionne tout
          allFalse(tmp);
          // regarde si l'exercice est resolue si oui affiche le popup
          setPopupWin(isWin(Math.max(selecDeck1,selecDeck2)));
        }
        else {
          // si aucune des deux cartes n'a de liaison =>
          if (tmp[selecDeck2][selecCard2].link !== "=>" && tmp[selecDeck1][selecCard1].link !== "=>") {
            setMessageErreur("Une des deux cartes doit avoir une liaison principale de type \"=>\" !");
          }
          else {
            setMessageErreur("La partie gauche de la carte \"=>\" doit être égale à la deuxième carte sélectionnée !")
          }
        }

      }
      else{
        setMessageErreur("Vous ne pouvez pas utilisé une carte de l'objectif avec ce bouton !");
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
    // si deux carte sont séléctionner
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      // prend le deck le plus haut
      let finalDeck = Math.max(selecDeck1,selecDeck2);
      if(finalDeck !== game.length-1){
        // copie du jeu
        let tmp   = [...game];
        // regarde si la première carte séléctionner est une carte au maximum composé de deux carte
        // le jeu ne prend pas en compte les cartes composer de plus de 4 cartes
        let bool  = tmp[selecDeck1][selecCard1].isSimpleOrDouble();
        // regarde si la deuxième carte séléctionner est une carte au maximum composé de deux carte
        // le jeu ne prend pas en compte les cartes composer de plus de 4 cartes
        if (bool && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
          //sauvegarde
          saveGame();
          // copie les deux cartes
          let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
          let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
          tmpCard1.id = 0;
          tmpCard2.id = 1;
          // ajoute la nouvelle cartes dans le deck le plus haut avec une les deux autres carte 
          // et une liaison et
          tmp[finalDeck].push(new CardClass(tmp[finalDeck].length,null,false,"et",tmpCard1,tmpCard2));
          // mis a jour du jeu + désélectionne tout
          allFalse(tmp);
          // regarde si l'exercice est fini si oui affiche le popup
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
      else{
        setMessageErreur("Vous ne pouvez pas utilisé une carte de l'objectif avec ce bouton !");
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
    // si deux carte sont séléctionner
    if (selecCard1 !== -1 && selecCard2 !== -1 && selecDeck1 !== -1 && selecDeck2 !== -1) {
      // copie du jeu
      let tmp   = [...game];
      // regarde si la première carte séléctionner est une carte au maximum composé de deux carte
      // le jeu ne prend pas en compte les cartes composer de plus de 4 cartes
      let bool  = tmp[selecDeck1][selecCard1].isSimpleOrDouble();
      // regarde si la deuxième carte séléctionner est une carte au maximum composé de deux carte
      // le jeu ne prend pas en compte les cartes composer de plus de 4 cartes
      if (bool && tmp[selecDeck2][selecCard2].isSimpleOrDouble()) {
        // sauvegarde
        saveGame();
        // prend le deck le plus haut
        let finalDeck = Math.max(selecDeck1,selecDeck2);
        // copie les deux carte séléctionner
        let tmpCard1 = tmp[selecDeck1][selecCard1].copy();
        let tmpCard2 = tmp[selecDeck2][selecCard2].copy();
        tmpCard1.id = 0;
        tmpCard2.id = 1;
        // ajoute la nouvelle cartes dans le deck le plus haut avec une les deux autres carte 
        // et une liaison =>
        tmp[finalDeck].push(new CardClass(tmp[finalDeck].length,null,false,"=>",tmpCard1,tmpCard2));
        // mis a jour du jeu + désélectionne toute les cartes
        allFalse(tmp);
        // regarde si l'exercice est fini
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
    // variable que l'on renvoie de base false
    let bool = false;
    // parcourt le deck objectif
    game[game.length-1].forEach(element =>{
      // si le deck passer en paramètre est l'objectif
      if(deck === game.length-1) {
        // si il y a une carte dans les objectif qui est egale
        // a la partie droite de la carte que l'on a passer en paramètre
        if(element.equals(game[deck][card].right))bool = true;
      }
      else {
        // si il y a une carte dans les objectif qui est egale
        // a la partie gauche de la carte que l'on a passer en paramètre
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
    // si il y a qu'une carte de séléctionner
    if ((selecCard1 !== -1 && selecCard2 === -1 && selecDeck1 !== -1 && selecDeck2 === -1) || (selecCard1 === -1 && selecCard2 !== -1 && selecDeck1 === -1 && selecDeck2 !== -1)) {
      // prendre la carte séléctionner
      let deckI = Math.max(selecDeck1,selecDeck2);
      let cardI = Math.max(selecCard1,selecCard2);
      // si le premier sous objectif choisi n'est pas l'objectif princpale
      if(true || !(game.length === 2 && (cardI !== 0 || deckI === 0))){
        // si le sous objectif n'existe pas deja
        if(!deckContain(deckI,cardI)){
          // si la carte choisi pour créer le sous objectif a une liaison principal =>
          if (game[deckI][cardI].link === "=>"){
            // initialisation de la variable du sous objectif
            let secondObjectif;
            // copie du tableau de jeu
            let tmp = [...game];
            // copie du deck objectif
            let tmpObjectif = [...game[game.length-1]];
            // initialisation d'une variable temporaire
            let tmpCard;
            // si la carte séléctionner est dans le deck objectif
            if (deckI === game.length-1){
              // sauvegarde
              saveGame();
              // message mode tutoriel
              if(mode === "Tutoriel" && numero === 3){
                setMessageTutoriel(["Vous devez maintenant compléter l’objectif secondaire.",
                "Si vous compléter l’objectif secondaire cela créera la carte d’où il a été créer dans deck avant, dans notre cas dans le deck départ cela complétera l’objectif principal dans notre cas."]);
              }
              // copie de la partie droite de la carte séléctionner
              secondObjectif = game[deckI][cardI].right.copy();
              // video le dernier deck (dans la variable temporaire)
              tmp[game.length-1] = [];
              // copie la partie gauche de la carte séléctionner
              tmpCard = game[deckI][cardI].left.copy();
              tmpCard.id = 0;
              // ajoute cette partie dans le dernier deck
              tmp[game.length-1].push(tmpCard);
              // met l'id du sous objectif que l'on va rajouter de la taille du dernier deck
              secondObjectif.id = game[game.length-1].length;
              // rajoute le seconde objectif dans le deck d'objectif
              tmpObjectif.push(secondObjectif)
              // rajoute le deck objectif a la fin 
              tmp.push(tmpObjectif);
              // copie du tableau d'objectif
              let tmpObj = [...tabObjectif];
              // Ajoute l'objectif secondaire dans le tableau d'objectif
              tmpObj.push([tabObjectif.length,game[game.length-1].length,true]);
              // mis a jour tableau objectif
              setTabObjectif(tmpObj);
              // mise a jour du jeu + désélctionne toute les cartes
              allFalse(tmp);
            }
            else{      
              
              // si la carte (est pas dans le deck objectif) et si la partie 
              // gauche de la carte a une liaison => 
              if(game[deckI][cardI].left.link === "=>"){
                // sauvegarde
                saveGame();
                // copie la partie gauche de la carte séléctionner
                secondObjectif = game[deckI][cardI].left.copy();
                secondObjectif.id = game[game.length-1].length;
                // mettre la carte copier dans le deck objectif (ce n'est pas un objectif secondaire)
                tmpObjectif.push(secondObjectif)        
                // mise a jour du deck objectif
                tmp[tmp.length-1] = tmpObjectif;
                // mise a jour du jeu + désélctionne toute les cartes
                allFalse(tmp);
              }
              else{
                setMessageErreur("La partie gauche de l'objectif secondaire doit avoir une liaison \"=>\" !");
              }   
  
            }
          }
          else {
            setMessageErreur("L'objectif secondaire doit avoir une liaison \"=>\" !");
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
      else if (nbSelec === 0) setMessageErreur("Vous devez sélectionner une carte !")
      
    }
  }

  /**
   * Appeler avec le selecteur recoie le numero puis redirige le site vers l'exercice corespondans
   * @param {*} event - le selecteur ( le numero est dans event.target.value)
   */
  const changeExercise = (event) =>{
    // numero de l'exercice demander
    let value = event.target.value;
    // si le sélécteur n'est pas sur "choisir exercice"
    if(value !== ""){
      // création de l'url
      let url = "/Exercise" +mode + value ;
      // redirection vers l'exercice voulu
      navigate(url);
    }

  }
  
  /**
   * Recoie plusieur fichier puis transforme ces fichier en un seul
   * @param {*} event - le bouton qui recois les fichier (event.target.files)
   */
  const convertFile = (event) =>{
    // initialisation de la variable ou va etre stoquer les fichiers json
    filesCopy = "";
    // si au moins un fichier est séléctionner
    if(event.target.files.length >0)
    {
      // boucle sur tout les fichies séléctionner
      Array.from(event.target.files).forEach((element) =>{
        // création d'un objet pour lire les fichiers
        var reader = new FileReader();
        // méthode appeler quand on lit un fichier
        reader.onload = event =>{
          // ajouter le fichier + une , (liste d'exercice on les sépare par une , dans un tableau json)
          filesCopy += event.target.result + ",";
        }
        // lit le fichiers
        reader.readAsText(element);
      })
    }
  }
  
  /**
   * Copie dans le presse-papier le fichier obtenue avec le bouton select fichiers
   */
  const printConvertFile = () =>{
    // copie ce qu'il y a dans fileCopy sans le dernier charactère (la dernière virgule) et met ca entre crocher pour faire un tableau
    // cela est copier dans le presse papier
    navigator.clipboard.writeText("[" + filesCopy.substring(0,filesCopy.length-1) + "]").then(() => {})
  }

  /**
   * Redirige vers le prochain exercice si il existe
   */
  const nextExercise = () =>{
    // si il y a un prochainne exercice
    if(numero+2 <= ex.length){
      // url du prochaine exercice
      let url = "/Exercise" +mode + (numero+2) ;
      // redirge vers l'url au dessus
      navigate(url);
    }

    setPopupWin(false);
  }

  /**
   * test une carte pour voir si en utilisant le bouton pour séparer
   * une carte et on peut obtenire la carte (carteObjectif)
   * 
   * @param {CardClass} card - la carte que l'on test 
   * @param {CardClass} cardObjectif - la carte que l'on veut obtenir
   * @returns true/false
   */
  const isObtainableEt = (card,cardObjectif) =>{
    // variable que l'on renvoie
    let bool = false;
    // si la carte test a une liaison
    if(card.color === null){
      // si la carte a une liaison 'et' et la partie gauche ou la partie droite de cette carte 
      // est egal a la carte Objectif si oui on renvoie true
      if(card.link === "et" && (card.left.equals(cardObjectif) || card.right.equals(cardObjectif))){
        bool = true;
      }
    }
  

    return bool;
  }

  /**
   * test une carte pour voir si on peut avoir la carte objectif
   * en utilisant la liasion =>
   * 
   * @param {CardClass} card - la carte que l'on test 
   * @param {CardClass} ardObjectif - la carte que l'on veut obtenir
   * @returns true/false
   */
  const isObtainableImplique = (card,cardObjectif) =>{
    // variable que l'on renvoie
    let bool = false;
    // si la carte que l'on test a une liasion
    if(card.color === null){
      //si la carte a une liasion '=>' et que la partie droite est egale a la carte objectif
      // ou si avec la partie droite de la carte on peut avoir l'objectif
      // si oui renvoie true 
      if((card.link === "=>" && card.right.equals(cardObjectif) ) || isObtainableImplique(card.right,cardObjectif) || isObtainableEt(card.right,cardObjectif)){
        bool = true;
      }
    }
    
    return bool;
  }

  /**
   * Parcourt le deck passer en paramètre (tmp[deckId]) et regarde si il existe une carte qui est egale 
   * a la carte passer en paramètre
   * si oui renvoie true
   * @param {tableau du jeu} tmp 
   * @param {int} deckId 
   * @param {CardClass} card 
   * @returns 
   */
  const containCard = (tmp,deckId , card) =>{
    // la variable a renvoyer
    let bool = false;
    // parcour le deck passer en paramètre
    tmp[deckId].forEach(cardElement =>{
      // si une carte de ce deck est egal a la carte passer en paramètre alors renvoie true
      if(cardElement.equals(card)){
        bool = true;
      }
    })
    return bool;
  }

  const getIndice = (tmp,deckId , card) =>{
    // la variable a renvoyer
    let num = -1;
    // parcour le deck passer en paramètre
    tmp[deckId].forEach((cardElement,index) =>{
      // si une carte de ce deck est egal a la carte passer en paramètre alors renvoie true
      if(cardElement.equals(card)){
        num = index;
      }
    })
    return num;
  }

  /**
   * cette fonction cherche de manière récurcive un objectif
   * elle cherche a trouvé un moyen de créer cardTest avec une autre carte
   * si il y a un moyen elle va chercher a créer cette autre carte jusqu'a tombé sur une carte simple existante
   * 
   * @param {tableau du jeu} tmp - tableau du jeu temporaire
   * @param {CardClass} cardTest - la derniere carte trouvé pour aller a l'objectif
   * @param {int} deckId - deck de la derniere carte trouvé pour aller a l'objectif
   * @param {int} deckObjectif - numero de l'objectif
   * @param {*} chemin - le chemin de carte actuelle
   * @returns le chemin
   */
  const recursiveSoluce = (tmp,cardTest,deckId , deckObjectif , chemin) =>{
    // l'indice 1 de chemin est un boolean false = il n'a pas trouvé 
    // une carte permettant de créer la carte cardTest
    // on est au début donc pour l'instant il ne sait pas comment
    // créer la carte cardTest
    chemin[1] = false;
    // variable temporaire pour le chemin
    let tmpChemin;
    // comme on effectue la boucle a l'envers cette variable
    // est le veritable index des cartes de la boucle
    let deckIndex = 0;
    // regarde si la carte que l'on cherche a une liaison et 
    // et n'existe pas dans le numero de deck qui corespond a l'objectif
    if(cardTest.link === "et" && !containCard(tmp,deckObjectif,cardTest)){
      //console.log("Carte objectif " + cardTest.toString());

      
      if(containCard(tmp,deckId,cardTest)){
        // ajoute la carte test dans le chemin
        chemin[0].push([deckId,tabObjectif[deckObjectif][1]]);
      }
      
      //cherche la partie gauche de la carte et
      tmpChemin = [...recursiveSoluce(tmp,cardTest.left,deckIndex,deckObjectif,chemin)];
      // copie de tmp chemin dans la variable chemin
      chemin = [...tmpChemin];
      // si il a trouvé une solution pour la partie gauche 
      if(chemin[1]){
        // copie le tableau
        tmp = copyGame();
        // cherche la partie droite de la carte et
        tmpChemin = [...recursiveSoluce(tmp,cardTest.right,deckIndex,deckObjectif,chemin)];
        // copie de tmpChemin dans chemin
        chemin = [...tmpChemin];
      }
        
     
    }
    // si aucune solution a était trouvé jusque la
    // et la carte que l'on cherche est l'objectif
    // et il a une liaison =>
    if(!chemin[1] && deckId === tmp.length-1 && cardTest.link === "=>"){
      //console.log("Add objectif");


      // ajoute un deck avant l'objectif
      tmp.splice(tmp.length-1,0,[]);
      // copie la partie gauche de l'objectif dans le deck qui vient d'etre créer
      tmp[tmp.length-2].push(cardTest.left.copy());
      // copie la partie droite de l'objectif dans le deck objectif
      tmp[tmp.length-1].push(cardTest.right.copy());
      // ajoute le seconde objectif dans le chemin
      chemin[0].push([tmp.length-1,tmp[tmp.length-1].length-1]);
      // cherche a valider ce second objectif 
      tmpChemin = [...recursiveSoluce(tmp,tmp[tmp.length-1][tmp[tmp.length-1].length-1],tmp.length-1,deckObjectif+1,chemin)];
      // copie le resultat dans chemin
      chemin = [...tmpChemin];
      // si on a resolue le second objectif
      if(chemin[1]){
        // on rajoute ce que l'on chercher dans le
        // deck qui a le numero de l'objectif
        tmp[deckObjectif].push(cardTest.copy());
      }
    }
    // si aucune solution trouvé jusque la
    if(!chemin[1]){
      // parcourire tout les deck en commencant par la fin
      tmp.slice().reverse().forEach((deck,i) =>{
        // veritable indice de deck
        deckIndex = tmp.length-1-i;
        // parcourir les cartes du deck
        deck.forEach((card,cardIndex) =>{
          // si le deck que l'on parcourt est inferieur ou egale
          // au numero de l'objectif
          if(deckObjectif>=deckIndex){
            // si aucune solution a était trouvé jusque la
            // si le deck ou l'on est n'est pas dans l'objectif
            // si le deck est dans le numero de l'objectif 
            // (exemple objectif principal et deck de depart) numero objectif = 0 et deck depart = 0
            // et cette carte existe 
            // il sagit de la condition d'arret si on trouve une solution
            if(!chemin[1]  && deckIndex !== tmp.length-1 && deckIndex <= deckObjectif && containCard(tmp,deckIndex,cardTest)){
              //console.log("fin");
              // on a trouvé une solution
              chemin[1] = true;
              console.log(cardTest +"");
              console.log(deckIndex + ","+ getIndice(tmp,deckIndex,cardTest));
              console.log(deck);
              // verification que l'on ajoute pas la carte si elle est deja ajouté en dernier
              if(!tmp[chemin[0][chemin[0].length-1][0]][chemin[0][chemin[0].length-1][1]].equals(cardTest)){
                // ajoute cette carte dans le chemin
                chemin[0].push([deckIndex,getIndice(tmp,deckIndex,cardTest)]);
              }
              
            }
            // si aucune solution a était trouvé jusque la
            // si on ne se trouve pas dans le deck objectif
            // si on peut avoir la cardTest en passant par une carte qui a une liasion =>
            if(!chemin[1] && deckIndex !== tmp.length-1 &&  isObtainableImplique(card,cardTest)){
              //console.log(card.left.toString() + " Implique " +cardTest.toString());

              // regarde si la partie droite de la carte que l'on vien de tester
              // est une carte double
              if(card.right.color === null){
                // regarde si la partie droite de la carte que l'on vien de tester
                // a une liaison =>
                if(card.right.link === "=>"){
                  // regarde si on peut avoir la partie gauche de la partie droite de la carte que l'on vient de tester
                  // exemple :
                  //            bleu          jaune
                  //             et     =>      =>
                  //            rouge         orange
                  // on cherche du orange on regarde si on a du jaune car si on en a pas 
                  // ca sert a rien de chercher bleu et rouge
                  tmpChemin = [...recursiveSoluce(tmp,card.right.left,deckIndex,deckObjectif,chemin)];
                  chemin = [...tmpChemin];
                }
                /* pas sur et pas d'exemple pour le tester
                else{
                  tmpChemin = [...recursiveSoluce(tmp,card.right,deckIndex,deckObjectif,chemin)];
                  chemin = [...tmpChemin];
                }*/

              }
              else {
                // si la partie droite de la carte est simple on cherche la partie gauche
                chemin[1] = true;
              }
              // si on a trouvé une solution pour la partie droite
              if(chemin[1]){
                // ajoute la carte au chemin
                chemin[0].push([deckIndex,cardIndex]);
                // cherche la partie gauche de la carte
                tmpChemin = [...recursiveSoluce(tmp,card.left,deckIndex,deckObjectif,chemin)];
                // copie le resultat
                chemin = [...tmpChemin];
              }
              // si on a pas trouvé de solution
              if(!chemin[1]){
                // si la parti gauche de la carte a une liasion =>
                if(card.color === null && card.left.link === "=>"){
                  // ajout de la partie gauche de la carte parcourut dans les objectif
                  tmp[tmp.length-1].push(card.left.copy());
                  // cherche a trouvé la carte ajouté dans les objectifs
                  tmpChemin = [...recursiveSoluce(tmp,card.left,tmp.length-1,deckObjectif,chemin)];
                  // copie le resultat
                  chemin = [...tmpChemin];
                }
              }
  
            }
            // si aucune solution a était trouvé jusque la
            // si la carte n'est pas dans le deck objectif
            // si on peut l'avoir avec une carte et existante
            // exemple : 
            // on cherche une carte rouge si on a une carte rouge et jaune 
            // on peut la séparer pour avoir du rouge
            if(!chemin[1] && deckIndex !== tmp.length-1 &&  isObtainableEt(card,cardTest)){
              //console.log(card.toString() + "utilisé ajout des cartes : " + card.left.toString() +" et " + card.right.toString() );

              // ajoute la carte au chemin
              chemin[0].push([deckIndex,cardIndex]);
              // ajoute les deux partie de la cartes et au deck
              tmp[deckId].push(card.right.copy());
              tmp[deckId].push(card.left.copy());
              // cherche a nouveau la cardTest avec les deux nouvelles cartes ajouter
              // cela ajoute une carte dans le chemin 
              // ce qui permet de diferencier
              // la séparation d'une carte et 
              // et l'utilisation d'une carte et avec une carte =>
              tmpChemin = [...recursiveSoluce(tmp,cardTest,deckIndex,deckObjectif,chemin)];
              //copie le resultat dans chemin
              chemin = [...tmpChemin];
            }
  
          }
        })
      })
    }
    return chemin;
  }

  /**
   * Renvoie le numero de l'objectif assossier a l'indice de la carte dans le deck
   * 
   * @param {*} objectif indice de la carte de l'objectif que l'on cherche dans le deck
   * @returns le numeros de l'objectif
   */
  const getNumObjectif = (objectif) =>{
    // variable que l'on renvoie
    // si on trouve pas on renvoie l'objectif principal
    let res = 0;
    // parcourt le tableau d'objectif
    tabObjectif.forEach(element =>{
      // rappel le tableau objectif est comme ca
      // [numero objectif , indice de la carte dans le deck , et objectif principal = true / objectif secondaire = false]
      if(element[1] === objectif){
        // prend le numero d'objectif
        res = element[0];
      }
    })
    return res;
  }

  // une fonction que l'on utilise pas pour l'instant
  // cette fonction est sensé mettre dans la console tout les mouvement a faire
  // pour gagné la partie
  // ne marche pas normalement
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

  /**
   * copie le jeu actuelle 
   * crée un nouveau tableau et fait une copie de toute les cartes
   * 
   * @returns une copie de la partie actuelle
   */
  const copyGame = () =>{
    // crée le nouveau tableau vide que l'on renvoie
    let tmp = [];
    // fait une boucle de la taille du jeu
    for (var i = 0 ; i < game.length ; i++) {
      // créer le deck vide
      tmp[i] = [];
      for (var j = 0 ; j < game[i].length ; j++) {
        // ajoute une copie de la carte dans le deck
        tmp[i].push(game[i][j].copy());
      }
    }
    // renvoie le nouveau tableau
    return tmp;
  }

  /**
   * Regarde si la carte passer en paramètre existe dans le jeu actuelle
   * et qu'elle ne sois pas dans les objectif
   * 
   * @param {CardClass} cardTest - la carte que l'on cherche
   * @returns true/false 
   */
  const cardExist = (cardTest) =>{
    // variable que l'on renvoie de base false
    let bool = false;
    // parcourt le jeu
    game.forEach((deck,index) =>{
      // parcourt le deck
      deck.forEach(card =>{
        // la carte ne doit pas etre dans les objectif
        // et on regarde dans le deck si la carte est egale a la carte
        // passer en paramètre si oui bool devien true
        if(index !== game.length-1 && card.equals(cardTest)) bool = true;
      })
    })
    // renvoie la variable
    return bool;
  }

  const testResolve = () =>{
    let tmp = copyGame();
    let chemin = [[],false];
    let deckId = tmp.length-1;
    let cardId = tmp[tmp.length-1].length-1;
    let objectif = tmp[deckId][cardId];
    let result = recursiveSoluce(tmp,objectif,deckId,getNumObjectif(cardId),chemin);
    let tmpResult = [...result[0]]
    let affiche = tmpResult.reverse();
    console.log(affiche);
  }
  /**
   * Cherche le prochain coup qui amène a finir l'exercice
   * si il y a une carte au prochain coup elle ira dans cardHelp
   * si il y en a deux elles iront dans CardHelp et CardHelp2
   */
  const getNextMove = () =>{
    // copie le jeu dans une variable temporaire
    let tmp = copyGame();
    // initialise le chemin
    // donc indice 0 aucune carte 
    // et indice 1 aucune solution trouvé
    let chemin = [[],false];
    // on cherche a trouvé l'objectif le plus éloigné dans le deck objectif
    let deckId = tmp.length-1;
    let cardId = tmp[tmp.length-1].length-1;
    // l'objectif que l'on cherche
    let objectif = tmp[deckId][cardId];
    // cherche l'objectif
    let result = recursiveSoluce(tmp,objectif,deckId,getNumObjectif(cardId),chemin);
    // copie du tableau de carte pour trouvé l'objectif
    let tmpResult = [...result[0]]
    // la premiere carte dans result est l'objectif donc la dernier c'est le prochain coup a jouer
    // donc on inverse le tableau pour jouer avec l'indice 0 et 1
    let affiche = tmpResult.reverse();
    // intialisation variable
    let bool = false;
    let card1;
    let card2;
    try{
      card1 = game[affiche[0][0]][affiche[0][1]];
      if(card1 === undefined){
        card1 = cardError;
      }
    }
    catch{
      card1 = cardError;
    }
    try{
      card2 = game[affiche[1][0]][affiche[1][1]];
      if(card2 === undefined){
        card2 = cardError;
      }
    }
    catch{
      card2 = cardError;
    }
    console.log(card1);
    console.log(card2);
    // souvent la carte la plus importante
    let res1 = [affiche[0][0],affiche[0][1]];
    let res2 = [affiche[1][0],affiche[1][1]]
    // regarde si les deux derniere carte recu existe dans jeu
    // ou si la deuxième carte et une carte 'et' et elle existe
    bool = (cardExist(card1) || card2.link === "et") && cardExist(card2) && affiche[1][0] < game.length-1;
    

    // regarde si un objectif avec une liaison => a eu sont deck de créer
    if(objectif.link === "=>" && game.length === 1+tabObjectif.length){

      res1 = [deckId,cardId];
      setCardHelp(res1);
      setCardHelp2(cardError);

    }
    // regarde si la deuxième carte est une carte et
    else if(card2.link === "et"){
      setCardHelp(res2);
      setCardHelp2(cardError);
    }
    else{
      // si les deux carte trouvé existent
      if(bool){
        setCardHelp(res1);
        setCardHelp2(res2);
      }
      // si elles n'existent pas
      else{
        console.log("oui")
        // si les deux cartes n'existent pas
        // c'est qu'il doit y avoir un sous objectif 
        // a créer qui ne soit pas dans le deck objectif
        let tmpCard = cardError;
        game.forEach((deck,decki) =>{
          deck.forEach((card,cardi) =>{
            // cherche une carte avec une liaison => dont la partie gauche a une liaison =>
            // seul cas conue (pour l'instant) pour créer un sous objectif dans le deck$
            // a partir d'une carte qui ne sois pas dans le deck objectif
            if(card.color === null && card.link === "=>"){
              
              if(card.left.color === null && card.left.link === "=>" && (card.left.left.equals(objectif))){
                tmpCard = [decki,cardi];
              }
            }
          })
        })
        setCardHelp(tmpCard);
        setCardHelp2(cardError);
      }
    }
  }
  return (
    <div className="game" >
      <div className="bouton">
        {/* Sélécteur d'exercice */}
        {mode !== "Create" && <select name="exo" id="exo-select" onChange={changeExercise}>
        <option value="">Choisir un exercice</option>
          {ex.map((exercise,index) =>(
            <option key={index} value={index+1} >Exercice {index+1}</option>
          ))}
          
      </select>}
      {/* bouton pour ouvrir plusieur fichier json pour en avoir qu'un a la fin */}
      {mode === "Create" && <input type="file" accept="application/json" multiple="multiple" onChange={convertFile} ></input>}
      {/* bouton pour copier le resultat du bouton au dessus dans le presse papier */}
      {mode === "Create" && <button onClick={printConvertFile}>Copier les fichiers regrouper</button>}
      {/* bouton pour ouvir un fichier json et affiche l'exercice a l'ecran pour le modifier */}
      {mode === "Create" && <input type="file" accept="application/json" onChange={openFile} ></input>}
      {/* copie le jeu actuelle en format json dans le presse papier */}
      {mode === "Create" && <button onClick={saveAsFile}>Copier le fichier</button>}
      {/* affiche la ou les deux cartes qui sont le prochain mouvement logique dans le but de 
          finir l'exercice */}
        {true && <button onClick={getNextMove}>Aide</button>}
        {/* revient a la partie avant l'ajout d'une carte  */}
        <button onClick={retourEnArriere}>Retour en arrière</button>
        {/* bouton pour obtenir les deux partie d'une carte et */}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 0) ? "boutonSelection" : ""} onClick={addCardAnd}>Ajout carte et</button>}
        {/* bouton pour obtenir la partie droite d'une carte =>
            si on a séléctionner une autre carte qui est égale a la partie
            gauche */}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 1) ? "boutonSelection" : ""} onClick={addCardFuse}>Ajout carte {"=>"}</button>}
        {/* fusionne deux carte (taille double max) et créer une troisième carte 
            composer de la partie gauche (première carte séléctionner)
            et la partie droite (deuxième carte séléctionner)
            la carte créer aura une liasion et */}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 2) ? "boutonSelection" : ""} onClick={fuseCardAdd}>Fusion carte et</button>}
        {/* fusionne deux carte (taille double max) et créer une troisième carte 
            composer de la partie gauche (première carte séléctionner)
            et la partie droite (deuxième carte séléctionner) 
            la carte créer aura une liasion =>
            !!! pour l'instant ce bouton n'est pas afficher
            car je n'y vois aucune utilité a voir pour les
            porchain exercice !!!*/}
        {false && mode !== "Create" && <button onClick={fuseCardFuse}>Fusion carte {"=>"}</button>}
        {/* Ajout objectif secondaire */}
        {mode !== "Create" && <button className={(mode === "Tutoriel" && numero === 3) ? "boutonSelection" : ""}onClick={addObjectif}>Ajout objectif</button>}
      </div>
      {/* message d'aide en mode tutoriel */}
      {mode === "Tutoriel" && messageTutoriel !== "" && <div className="message tutoriel">
        {messageTutoriel.map((element,index) =>{
          return<div key={index}>{element}</div>
          
        })}
      </div>}
      {/*   message d'erreur si on esseye de faire un mouvement illégal
            exemple vouloir séparter une carte qui n'a pas une liaison et*/}
      {messageErreur !== "" && <div className="message error">
        {messageErreur}
      </div>}
      <GameTab.Provider value={game}>
        {/* ajout des deck */}
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
      {/* popup disponible en mode création pour ajouter une 
          carte simple et choisir ca couleur 
          un bouton lui est dédié*/}
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
      {/* popup disponible en mode création quand on sélétionne deux cartes pour choisir la liaison
          de la future carte */}
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
      {/* popup disponible en mode création pour suprimmer une carte
          un bouton lui est dédié */}
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
      {/* popup de victoir quand on reussi l'objectif princpal */}
      {popupWin && (
        <Popup
          content={
            <>
              <b>Bravo, vous avez gagné !</b>
              <button
                onClick={nextExercise}
              >
                X
              </button>
            </>
          }
        />
      )}
    </div>
  );
};

export default Game;
