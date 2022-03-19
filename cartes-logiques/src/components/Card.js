import React from "react";
import { GameTab } from "./Game";

const Card = ({ deckIndice, cardIndice, update }) => {
  /**
   * Fonction qui détecte le clique sur une carte & qui appelle la fonction update passée par le component Deck.
   */
  const handleClick = () => {
    update(cardIndice);
  };
  
  /**
   * Détermine le type de carte.
   * @param game - le tableau qui contient toutes les cartes
   * @param i - le numéro de Deck
   * @param j - la position de la carte dans le Deck
   * @returns le nom de la classe corespondant à la carte
   */
  const getClassType = (game, i, j) => {
    if (game[i][j].left === null && game[i][j].right === null)
      return "card_simple";
    if (
      game[i][j].left !== null &&
      game[i][j].right !== null &&
      game[i][j].left.left === null &&
      game[i][j].left.right === null &&
      game[i][j].right.left === null &&
      game[i][j].right.right === null
    ) return "card_double";
    if (
      game[i][j].left !== null &&
      game[i][j].right !== null &&
      game[i][j].left.left === null &&
      game[i][j].left.right === null &&
      game[i][j].right.left !== null &&
      game[i][j].right.right !== null
    ) return "card_triple_a";
    if (
      game[i][j].left !== null &&
      game[i][j].right !== null &&
      game[i][j].left.left !== null &&
      game[i][j].left.right !== null &&
      game[i][j].right.left === null &&
      game[i][j].right.right === null
    ) return "card_triple_b";
    if (
      game[i][j].left !== null &&
      game[i][j].right !== null &&
      game[i][j].left.left !== null &&
      game[i][j].left.right !== null &&
      game[i][j].right.left !== null &&
      game[i][j].right.right !== null
    ) return "card_quadruple";
  };

  /**
   * Renvoie soit "card_simple_h" (carte verticale), soit "card_simple_w" (carte horizontale)
   * @param game - le tableau qui contient toutes les cartes
   * @param i - le numéro de deck
   * @param j - la position de la carte dans le Deck
   * @param k - la position de la carte dans les cartes complexes
   *            ex: dans une carte double la fonction est appelée 2 fois, une fois avec k=0 & l'autre fois avec k=1
   * @returns le nom de la classe corespondant à la carte
   */
  const getTabClass = (game, i, j, k) => {
    const className = getClassType(game, i, j);

    if (className === "card_simple") return "card_simple_h";
    if (className === "card_double") return "card_simple_h";
    if (className === "card_triple_a") {
      if (k === 0) return "card_simple_h";
      else return "card_simple_w";
    }
    if (className === "card_triple_b") {
      if (k === 2) return "card_simple_h";
      else return "card_simple_w";
    }
    if (className === "card_quadruple") return "card_simple_w";
  };

  /**
   * Renvoie un tableau qui va être utilisé par la fonction map pour afficher toutes les cartes.
   * @param game - le tableau qui contient toutes les cartes
   * @param i - le numéro de Deck
   * @param j - la position de la carte dans le Deck
   * @returns un tableau de cartes
   */
  const getTab = (game, i, j) => {
    const className = getClassType(game, i, j);
    var tab = [];

    if (className === "card_simple") {
      tab.push(game[i][j]);
    }
    if (className === "card_double") {
      tab.push(game[i][j].left);
      tab.push(game[i][j].right);
    }
    if (className === "card_triple_a") {
      tab.push(game[i][j].left);
      tab.push(game[i][j].right.left);
      tab.push(game[i][j].right.right);
    }
    if (className === "card_triple_b") {
      tab.push(game[i][j].left.left);
      tab.push(game[i][j].left.right);
      tab.push(game[i][j].right);
    }
    if (className === "card_quadruple") {
      tab.push(game[i][j].left.left);
      tab.push(game[i][j].right.left);
      tab.push(game[i][j].left.right);
      tab.push(game[i][j].right.right);
    }
    return tab;
  };

  return (
    <div className="card">
      <GameTab.Consumer>
        {(game) => {
          return (
            <div
              className={getClassType(game, deckIndice, cardIndice)}
              onClick={handleClick}
            >
              {getTab(game, deckIndice, cardIndice).map(
                (cardAffiche, index) => (
                  <div
                    key={index}
                    style={{ backgroundColor: cardAffiche.color }}
                    className={
                      getTabClass(game, deckIndice, cardIndice, index) +
                      (cardAffiche.active ? " card_selec" : "")
                    }
                  ></div>
                )
              )}
            </div>
          );
        }}
      </GameTab.Consumer>
    </div>
  );
};

export default Card;
