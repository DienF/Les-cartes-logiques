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
	const recurciveRender = (
		currentCard,
		count,
		selec,
		help,
		originalCount
	) => {
		if (currentCard.color !== null) {
			return (
				<span
					className={
						`card_simple ` +
						(selec ? "selectioner " : "") +
						(help ? "help " : "")
					}
					style={{ backgroundColor: currentCard.color }}
				></span>
			);
		}
		let className = "carte_container_horizon";
		let link = "link_vertical";
		className = "carte_container_vertical";
		if (count % 2 !== 0 || (originalCount === 2 && count === 2)) {
			className = "carte_container_horizon";
			link = "";
		}
		return (
			<span className={className}>
				{[
					recurciveRender(
						currentCard.left,
						count - 1,
						selec,
						help,
						originalCount
					),
					<span className={`link ${link}`}>
						<Latex>
							{afficheLink(getGoodCard(currentCard).link)}
						</Latex>
					</span>,
					recurciveRender(
						currentCard.right,
						count - 1,
						selec,
						help,
						originalCount
					),
				]}
			</span>
		);
	};
	function RenderCard(props) {
		const currentCard = props.currentCard;
		const selec = props.selec;
		const help = props.help;
		if (currentCard === undefined) {
			return <span></span>;
		}
		const profondeurCard = currentCard.getProfondeur();
		recurciveRender.count = 0;
		return recurciveRender(
			currentCard,
			profondeurCard,
			selec,
			help,
			profondeurCard
		);
	}
	function calcSizeCard(card) {
		if (card === undefined) {
			return {
				minWidth: 0,
				minHeight: 0,
			};
		}
		const prof = card.getProfondeur();
		console.log(prof);
		if (prof === 1) {
			return {
				width: "5vw",
				height: "13vh",
			};
		}
		if (prof < 4) {
			return {
				width: "11vw",
				height: "13vh",
			};
		}
		if (prof < 7) {
			return {
				width: "11vw",
				height: "20vh",
			};
		}
		return {
			width: "15vw",
			height: "28vh",
		};
	}
	return (
		<GameTab.Consumer>
			{(game) => {
				return (
					<div
						onClick={handleClick}
						className={
							"card " +
							(isWin ? "" : "hoverable ") +
							(game[deckIndice][cardIndice].hover && !isWin
								? "activeHover "
								: "")
						}
						style={calcSizeCard(game[deckIndice][cardIndice])}
					>
						{console.log(
							calcSizeCard(game[deckIndice][cardIndice])
						)}
						<RenderCard
							currentCard={game[deckIndice][cardIndice]}
							selec={game[deckIndice][cardIndice].active}
							help={
								(cardHelp[0] === deckIndice &&
									cardHelp[1] === cardIndice) ||
								(cardHelp2[0] === deckIndice &&
									cardHelp2[1] === cardIndice)
							}
						></RenderCard>
					</div>
				);
			}}
		</GameTab.Consumer>
	);
};

export default Card;
