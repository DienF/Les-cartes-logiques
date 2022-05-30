import React from "react";
import { GameTab } from "./Game";

const Card = ({ deckIndice, cardIndice, update, cardHelp, cardHelp2}) => {
  /**
   * Fonction qui détecte le clique sur une carte & qui appelle la fonction {@link update()} passée par le
   * component Deck.
   */
  const handleClick = () => {
    update(cardIndice);
  };
  
  /**
   * Détermine le type de carte.
   * @param {Array<CardClass>} game - le tableau qui contient toutes les cartes
   * @param {number}              i - le numéro du Deck
   * @param {number}              j - la position de la carte dans le Deck
   * @returns {"card_simple"|"card_double"|"card_triple_a"|"card_triple_b"|"card_quadruple"} le nom de la classe
   * correspondant à la carte
   */
  const getClassType = (card) => {
    
    if (card.left !== null && card.link === "=>" && card.right.color === "white" )
      return getClassType(card.left);
    if (card.left === null && card.right === null)
      return "card_simple";
    if (
      card.left        !== null &&
      card.right       !== null &&
      card.left.left   === null &&
      card.left.right  === null &&
      card.right.left  === null &&
      card.right.right === null
    ) return "card_double";
    if (
      card.left        !== null &&
      card.right       !== null &&
      card.left.left   === null &&
      card.left.right  === null &&
      card.right.left  !== null &&
      card.right.right !== null
    ) return "card_triple_a";
    if (
      card.left        !== null &&
      card.right       !== null &&
      card.left.left   !== null &&
      card.left.right  !== null &&
      card.right.left  === null &&
      card.right.right === null
    ) return "card_triple_b";
    if (
      card.left        !== null &&
      card.right       !== null &&
      card.left.left   !== null &&
      card.left.right  !== null &&
      card.right.left  !== null &&
      card.right.right !== null
    ) return "card_quadruple";
  };

  /**
   * Permet de savoir si l'on doit afficher une carte à la verticale ou à l'horizontale.
   * @param {Array<CardClass>} game - le tableau qui contient toutes les cartes
   * @param {number}              i - le numéro du Deck
   * @param {number}              j - la position de la carte dans le Deck
   * @param {number}              k - la position de la carte dans les cartes complexes ;
   *                                  ex: dans une carte double la fonction est appelée 2 fois, une fois avec k=0 & l'autre fois avec k=1
   * @returns {"card_simple_h"|"card_simple_w"} une carte verticale ou une carte horizontale
   */
  const getTabClass = (card, k) => {
    const className = getClassType(card);
    let res = "";
    if (card.right !== null && card.link === "=>" && card.right.color === "white" ) res = "card_non ";
    if (className.includes("card_simple")) return res += "card_simple_h";
    if (className.includes("card_double")) return res += "card_simple_h";
    if (className.includes("card_triple_a")) {
      if (k === 0) return res += "card_simple_h";
      else         return res += "card_simple_w";
    }
    if (className.includes("card_triple_b")) {
      if (k === 2) return res += "card_simple_h";
      else         return res += "card_simple_w";
    }
    if (className.includes("card_quadruple")) return res += "card_simple_w";
  };

  /**
   * Renvoie un tableau qui va être utilisé par la fonction {@link Array.map()} pour afficher toutes les cartes.
   * @param {Array<CardClass>} game - le tableau qui contient toutes les cartes
   * @param {number}              i - le numéro du deck
   * @param {number}              j - la position de la carte dans le deck
   * @returns {Array<CardClass>} un tableau de cartes
   */
  const getTab = (card) => {
    const className = getClassType(card);
    var tab = [];
    if (card.right !== null && card.link === "=>" && card.right.color === "white")
      card = card.left;
    if (className.includes("card_simple"))
      tab.push(card);
    else if (className.includes("card_double")) {
      tab.push(card.left);
      tab.push(card.right);
    }
    else if (className.includes("card_triple_a")) {
      tab.push(card.left);
      tab.push(card.right.left);
      tab.push(card.right.right);
    }
    else if (className.includes("card_triple_b")) {
      tab.push(card.left.left);
      tab.push(card.left.right);
      tab.push(card.right);
    }
    else if (className.includes("card_quadruple")) {
      tab.push(card.left.left);
      tab.push(card.right.left);
      tab.push(card.left.right);
      tab.push(card.right.right);
    }
    return tab;
  };

  const getGoodCard = (card) => {
    if (card.right !== null && card.link === "=>" && card.right.color === "white" )
      return card.left;
    return card;
  }
  return (
    <div className="card">
      <GameTab.Consumer>
        {(game) => {
          return (
            <div
              className={getClassType(game[deckIndice][cardIndice])}
              onClick={handleClick}
            >
              {getTab(game[deckIndice][cardIndice]).map(
                (cardAffiche, index) => (
                  <div key={index.toString()} className={"card"+index.toString()}>
                    <div
                      style={{ backgroundColor: cardAffiche.color }}
                      className={
                        getTabClass(game[deckIndice][cardIndice], index) +
                        (cardAffiche.active ? " card_selec" : "") +
                        ((cardHelp[0] === deckIndice && cardHelp[1] === cardIndice) || (cardHelp2[0] === deckIndice && cardHelp2[1] === cardIndice) ? " card_help" : "")
                      }
                    ></div>
                    {index === 0 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_double"    &&(<div className="affix_h">{getGoodCard(game[deckIndice][cardIndice]).link}</div>)}
                    {index === 0 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_triple_a"  &&(<div className="affix_h">{getGoodCard(game[deckIndice][cardIndice]).link}</div>)}
                    {index === 1 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_triple_a"  &&(<div className="affix_v">{getGoodCard(game[deckIndice][cardIndice]).right.link}</div>)}
                    {index === 0 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_triple_b"  &&(<div className="affix_v">{getGoodCard(game[deckIndice][cardIndice]).left.link}</div>)}
                    {index === 1 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_triple_b"  &&(<div className="affix_h">{getGoodCard(game[deckIndice][cardIndice]).link}</div>)}
                    {index === 0 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_quadruple" &&(<div className="affix_v">{getGoodCard(game[deckIndice][cardIndice]).left.link}</div>)}
                    {index === 1 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_quadruple" &&(<div className="affix_v">{getGoodCard(game[deckIndice][cardIndice]).right.link}</div>)}
                    {index === 2 && getClassType(getGoodCard(game[deckIndice][cardIndice])) === "card_quadruple" &&(<div className="affix_h">{getGoodCard(game[deckIndice][cardIndice]).link}</div>)}
                  </div>
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
