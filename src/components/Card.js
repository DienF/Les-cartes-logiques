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
						<Latex>{afficheLink(currentCard.link)}</Latex>
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
		if (prof < 5) {
			return {
				width: "11vw",
				height: "20vh",
			};
		}
		if (prof < 6) {
			return {
				width: "15vw",
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
