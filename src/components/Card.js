import React from "react";
import { GameTab } from "./Game";
var Latex = require("react-latex");

const Card = ({
	deckIndice,
	cardIndice,
	update,
	cardHelp,
	cardHelp2,
	isWin,
}) => {
	/**
	 * Fonction qui détecte le clique sur une carte & qui appelle la fonction {@link update()} passée par le
	 * component Deck.
	 */
	const handleClick = () => {
		update(cardIndice);
	};

	/**
	 * Détermine le type de carte.
	 * @param {CardClass} card - la carte
	 * @returns {"card_simple"|"card_double"|"card_triple_a"|"card_triple_b"|"card_quadruple"} le nom de la classe
	 * correspondant à la carte
	 */
	const getClassType = (card) => {
		if (
			card.left !== null &&
			card.link === "=>" &&
			card.right.color === "white"
		)
			return getClassType(card.left);
		if (card.left === null && card.right === null) return "card_simple";
		if (
			card.left !== null &&
			card.right !== null &&
			card.left.left === null &&
			card.left.right === null &&
			card.right.left === null &&
			card.right.right === null
		)
			return "card_double";
		if (
			card.left !== null &&
			card.right !== null &&
			card.left.left === null &&
			card.left.right === null &&
			card.right.left !== null &&
			card.right.right !== null
		)
			return "card_triple_a";
		if (
			card.left !== null &&
			card.right !== null &&
			card.left.left !== null &&
			card.left.right !== null &&
			card.right.left === null &&
			card.right.right === null
		)
			return "card_triple_b";
		if (
			card.left !== null &&
			card.right !== null &&
			card.left.left !== null &&
			card.left.right !== null &&
			card.right.left !== null &&
			card.right.right !== null
		)
			return "card_quadruple";
	};

	/**
	 * Permet de savoir si l'on doit afficher une carte à la verticale ou à l'horizontale.
	 * @param {CardClass} card - la carte à afficher
	 * @param {number}       k - la position de la carte dans les cartes complexes ;
	 *                           ex: dans une carte double la fonction est appelée 2 fois, une fois avec k=0 & l'autre fois avec k=1
	 * @returns {"card_simple_h"|"card_simple_w"} une carte verticale ou une carte horizontale
	 */
	const getTabClass = (card, k) => {
		const className = getClassType(card);
		let res = "";
		if (
			card.right !== null &&
			card.link === "=>" &&
			card.right.color === "white"
		)
			res = "card_non ";
		if (className.includes("card_simple")) return (res += "card_simple_h");
		if (className.includes("card_double")) return (res += "card_simple_h");
		if (className.includes("card_triple_a")) {
			if (k === 0) return (res += "card_simple_h");
			else return (res += "card_simple_w");
		}
		if (className.includes("card_triple_b")) {
			if (k === 2) return (res += "card_simple_h");
			else return (res += "card_simple_w");
		}
		if (className.includes("card_quadruple"))
			return (res += "card_simple_w");
	};

	/**
	 * Renvoie un tableau qui va être utilisé par la fonction {@link Array.map()} pour afficher toutes les cartes.
	 * @param {CardClass} card - la carte à mettre dans le tableau
	 * @returns {Array<CardClass>} un tableau de cartes
	 */
	const getTab = (card) => {
		const className = getClassType(card);
		let tab = [];
		if (
			card.right !== null &&
			card.link === "=>" &&
			card.right.color === "white"
		)
			card = card.left;
		if (className.includes("card_simple")) tab.push(card);
		else if (className.includes("card_double")) {
			tab.push(card.left);
			tab.push(card.right);
		} else if (className.includes("card_triple_a")) {
			tab.push(card.left);
			tab.push(card.right.left);
			tab.push(card.right.right);
		} else if (className.includes("card_triple_b")) {
			tab.push(card.left.left);
			tab.push(card.left.right);
			tab.push(card.right);
		} else if (className.includes("card_quadruple")) {
			tab.push(card.left.left);
			tab.push(card.right.left);
			tab.push(card.left.right);
			tab.push(card.right.right);
		}
		return tab;
	};

	/**
	 * Donne la carte de gauche dans une implication si la carte de droite est blanche ("Vrai").
	 * @param {CardClass} card - la carte à vérifier
	 * @returns {CardClass} la carte gauche si c'est une implication & que la carte de droite est blanche sinon la carte passée en paramètre
	 * @example "Jaune => Blanc" renvoie "Jaune"
	 */
	const getGoodCard = (card) => {
		if (
			card.right !== null &&
			card.link === "=>" &&
			card.right.color === "white"
		)
			return card.left;
		return card;
	};

	/**
	 * Convertit les liaisons en symboles Latex.
	 * @param {String} str - la liaison
	 * @returns {String} le symbole Latex
	 */
	const afficheLink = (str) => {
		if (str === "=>") return "$$\\Rightarrow$$";
		else if (str === "<=>") return "$$\\Leftrightarrow$$";
		else return str;
	};

	return (
		<div className="card">
			<GameTab.Consumer>
				{(game) => {
					return (
						<div
							className={
								getClassType(game[deckIndice][cardIndice]) +
								" " +
								(game[deckIndice][cardIndice].hover && !isWin
									? getClassType(
											game[deckIndice][cardIndice]
									  ) + "_hover"
									: "") +
								" " +
								(isWin
									? ""
									: getClassType(
											game[deckIndice][cardIndice]
									  ) + "_accept_hover")
							}
							onClick={handleClick}
						>
							{getTab(game[deckIndice][cardIndice]).map(
								(cardAffiche, index) => (
									<div
										key={index.toString()}
										className={"card" + index.toString()}
									>
										<div
											style={{
												backgroundColor:
													cardAffiche.color,
											}}
											className={
												getTabClass(
													game[deckIndice][
														cardIndice
													],
													index
												) +
												(cardAffiche.active
													? " card_selec"
													: "") +
												((cardHelp[0] === deckIndice &&
													cardHelp[1] ===
														cardIndice) ||
												(cardHelp2[0] === deckIndice &&
													cardHelp2[1] === cardIndice)
													? " card_help"
													: "")
											}
										></div>
										{index === 0 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_double" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].link
														) === "et"
															? "affix_h no_rotate"
															: "affix_h"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).link
														)}
													</Latex>
												</div>
											)}
										{index === 0 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_triple_a" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].link
														) === "et"
															? "affix_h no_rotate"
															: "affix_h"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).link
														)}
													</Latex>
												</div>
											)}
										{index === 1 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_triple_a" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].right.link
														) === "et"
															? "affix_v no_rotate"
															: "affix_v"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).right.link
														)}
													</Latex>
												</div>
											)}
										{index === 0 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_triple_b" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].left.link
														) === "et"
															? "affix_v no_rotate"
															: "affix_v"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).left.link
														)}
													</Latex>
												</div>
											)}
										{index === 1 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_triple_b" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].link
														) === "et"
															? "affix_h no_rotate"
															: "affix_h"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).link
														)}
													</Latex>
												</div>
											)}
										{index === 0 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_quadruple" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].left.link
														) === "et"
															? "affix_v no_rotate"
															: "affix_v"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).left.link
														)}
													</Latex>
												</div>
											)}
										{index === 1 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_quadruple" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].right.link
														) === "et"
															? "affix_v no_rotate"
															: "affix_v"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).right.link
														)}
													</Latex>
												</div>
											)}
										{index === 2 &&
											getClassType(
												getGoodCard(
													game[deckIndice][cardIndice]
												)
											) === "card_quadruple" && (
												<div
													className={
														getGoodCard(
															game[deckIndice][
																cardIndice
															].link
														) === "et"
															? "affix_h no_rotate"
															: "affix_h"
													}
												>
													<Latex>
														{afficheLink(
															getGoodCard(
																game[
																	deckIndice
																][cardIndice]
															).link
														)}
													</Latex>
												</div>
											)}
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
