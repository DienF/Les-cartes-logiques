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
  /**
   *  renvoie sous la forme : exemple couleur : red, liaison possible : "^" et "=>"
   * carte simple : (couleur)
   * carte double : (couleur) liaison (couleur)
   * carte triple : (couleur) liaison ((couleur) laision (couleur))
   * carte quadruple : ((couleur) laision (couleur)) laision ((couleur) laision (couleur))
   * @returns un string plus lisible
   */
  toString() {
    var res = "(";
    if (this.color != null) {
      res += this.color.toString();
    }
    if (this.left !== null) {
      res += this.left.toString();
    }
    if (this.liaison === 1) {
      res += " ^ ";
    }
    if (this.liaison === 2) {
      res += " => ";
    }
    if (this.right !== null) {
      res += this.right.toString();
    }

    return res + ")";
  }
  /**
   * renvoie un objet que l'on va stocker dans un fichier json
   * voci un exemple :
   * {color : "couleur"}
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
   *              "left": { "color": "couleur" }, 
   *              "liaison": num,
   *              "right": { "color": "couleur" } 
   *            },
   *  "laision":num, 
   *  "right": { 
   *              "left": { "color": "couleur" }, 
   *              "liaison": num,
   *              "right": { "color": "couleur" } 
   *            }
   *
   * }
   * 
   * @returns un onjet destiner au fichier json
   */
  toFile() {
    if (this.color !== null) {
      return { color: this.color };
    } else {
      return {
        left: this.left.toFile(),
        liaison: this.liaison,
        right: this.right.toFile(),
      };
    }
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
   * initialise l'exercice.
   */
  useEffect(() => {
    
    if (mode !== "create") {
      setGame([[], []]);
      fetch(mode+'.json')
      .then(response => response.text())
      .then(data => {
        setGame(gameInput(JSON.parse(data)));
      });
      console.log(game);
    } else {
      setGame([[], []]);
    }
  }, [mode]);
  /**
   * met la variable popupSelect en true ce qui affiche le popup.
   */
  const popup = () => {
    setPopupSelect(true);
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
          card !== null &&
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
      setSelecCard1(temposelecCard1);
      setSelecDeck1(temposelecDeck1);

      if (tempoNbSelec === 2) {
        setSelecDeck2(i);
        setSelecCard2(j);
        if (mode !== "create") {
          popup();
        } else {
          setPopupFusion(true);
        }
        
      }
    }
  };
  /**
   * deselectionne toute les cartes.
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
   * ferme le popup  et deselectionne toute les cartes.
   */
  const closePopup = () => {
    setPopupSelect(false);
    allFalse();
  };
  /**
   * fait apparaitre le popup qui nous demande la couleur de la carte qu'on veut ajouter
   * @param {*} deckIndice - l'indice du deck ou on ajoute une carte 
   */
  const addCard = (deckIndice) => {
    setIndiceDeckAddCard(deckIndice);
    setPopupAddCard(true);
  };
  /**
   *  creer une carte avec la couleur selectionner (ne ferme pas le popup quand on selectionne une couleur)
   * @param {*} event (event.target.value)recois la couleur cliquer
   *                  (event.target.checked)on le met a false si on veut faire plusieur fois la meme couleur
   */
  const choixCouleur = (event) => {
    var tmp = [...game];
    event.target.checked = false;
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length,
        event.target.value,
        false,
        0,
        null,
        null
      )
    );
    setGame(tmp);
  };
  /**
   *  creer une carte complexe avec les 2 cartes selectionner (cette fonction est apeller a la fin de update en mode creation)
   * @param {*} event (event.target.value)recois la liaison cliquer
   */
  const choixLiaison = (event) => {
    console.log(game);
    var tmp = [...game];
    event.target.checked = false;
    const l = parseInt(event.target.value);
    const c1 = game[selecDeck1][selecCard1];
    const c2 = game[selecDeck2][selecCard2];
    tmp[indiceDeckAddCard].push(
      new CardClass(
        game[indiceDeckAddCard].length,
        null,
        false,
        l,
        new CardClass(0,c1.color,false,c1.liaison,c1.left,c1.right),
        new CardClass(1,c2.color,false,c2.liaison,c2.left,c2.right)
      )
    );
    setGame(tmp);
    setPopupFusion(false);
    allFalse();
    console.log(game);
  };
  /**
   * suprime une carte la carte qui est selectionner
   */
  const deleteCard = () => {
    setPopupDeleteCard(false);
    var tmp = [...game];
    tmp[selecDeck1][selecCard1] = null;
    setGame(tmp);
    allFalse();
  };
  /**
   * transforme le tableau en tableau d'objet avec seulement les information qui nous interesse (couleur/liaison)
   * 
   * @returns renvoie une tableau d'objet
   */
  const gameOutput = () => {
    var res = [[], []];
    game.map(function (deck, index) {
      deck.map(function (card) {
        if (card != null) {
          res[index].push(card.toFile());
        }
      });
    });

    return res;
  };
  /**
   * recois un tableau d'un fichier json a qui on a apliquer la methode parse (json ==> tableau object) et renvoie un tableau qui peut etre lu par notre site
   * @param {*} data tableau d'objet qui va servir pour l'initialisation
   * @returns un tableau de deck
   */
  const gameInput = (data) =>{
    var res = [[],[]]
    var i=0;
    data[0].forEach(element => {
        res[0].push(toClass(element,i));
      i++;
    });
    i=0;
    data[1].forEach(element => {
      res[1].push(toClass(element,i));
      i++;
    });
    console.log(res);
    return res;
  }
  /**
   * @todo stocker dans un fichier sur le serveur ou sur le pc local ou laisser comme ca (afficher le json dans la console)
   */
  const saveAsFile = () => {
    console.log(JSON.stringify(gameOutput()));
  };
  /**
   * créer une instance CardClass et la renvoie 
   *  @param obj - information mimimum pour creer une carte 
   *               carte simple juste la couleur
   *               carte complex les 2 cartes qui la compose et la liaison
   *  @param i - numero de l'id  
   */
  const toClass = (obj,i) =>{
    if(obj.color === undefined){
      console.log(new CardClass(i,null,false,obj.liaison,toClass(obj.left,0),toClass(obj.right,1)));
      return new CardClass(i,null,false,obj.liaison,toClass(obj.left,0),toClass(obj.right,1));
    }
    else{
      return new CardClass(i,obj.color,false,0,null,null);
    }
  }
  return (
    <div className="game" >
      <p>{mode}</p>
      <button onClick={saveAsFile}>convertir en fichier</button>
      <GameTab.Provider value={game}>
        {game.map((deck, index) => (
          <Deck
            updateGame={update}
            indice={index}
            addCardFunc={addCard}
            deleteCardFunc={setPopupDeleteCard}
            nbDeck={game.length}
            key={index}
          ></Deck>
        ))}
      </GameTab.Provider>
      {popupSelect && (
        <Popup
          content={
            <>
              <b>
                Voulez vous fusionner cette carte{" "}
                {game[selecDeck1][selecCard1].toString()} : [{selecDeck1}][
                {selecCard1}] avec elle{" "}
                {game[selecDeck2][selecCard2].toString()}: [{selecDeck2}][
                {selecCard2}] ?
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
      {popupDeleteCard && (
        <Popup
          content={
            <>
              <b>
                Voulez vous suprimer cette carte{" "}
                {game[selecDeck1][selecCard1].toString()} : [{selecDeck1}][
                {selecCard1}] ?
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
