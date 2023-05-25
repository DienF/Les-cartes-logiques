import React, { useEffect } from "react";
import { GameTab } from "./Game";
var Latex = require("react-latex");

const Card = ({
	deckIndice,
	cardIndice,
	update,
	cardHelp,
	cardHelp2,
	isWin,
	affichageSimple,
}) => {
	
	/**
	 * Fonction qui détecte le clique sur une carte & qui appelle la fonction {@link update()} passée par le
	 * component Deck.
	 */
	const handleClick = () => {
		update(cardIndice);
	};

	/**
	 * Convertit les liaisons en symboles Latex.
	 * @param {String} str - la liaison
	 * @returns {String} le symbole Latex
	 */
	const afficheLink = (str) => {
		if (str === "=>") return "$$\\Rightarrow$$";
		else if (str === "<=>") return "$$\\Leftrightarrow$$";
		else if (str === "non") return "$$\\neg$$";
		else return str;
	};

	/**
	 * 
	 * @param {*} currentCard 
	 * @param {*} count 
	 * @param {*} selec 
	 * @param {*} help 
	 * @param {*} originalCount 
	 * @returns 
	 */
	const recurciveRender = (currentCard, count, selec, help, originalCount) => {
		recurciveRender.count++;
		if (currentCard.color !== null) {
			let style = { backgroundColor: currentCard.color };
			if (currentCard.color === "transparent") style["border"] = "none";
			return (
				<span
					key={recurciveRender.count}
					className={
						`card_simple ` +
						(selec && currentCard.color !== "transparent"
							? "selectioner "
							: "") +
						(help ? "help " : "")
					}
					style={style}
				></span>
			);
		}
		if (affichageSimple) currentCard = currentCard.displayGoodCard();
		let className = "carte_container_horizon",
			link = "link_vertical";
		className = "carte_container_vertical";
		if (count % 2 !== 0 || (originalCount === 2 && count === 2)) {
			className = "carte_container_horizon";
			link = "";
		}
		if (count % 4 === 0) {
			link = "link_vertical2";
		}
		return (
			<span className={className} key={recurciveRender.count}>
				{[
					recurciveRender(
						currentCard.left,
						count - 1,
						selec,
						help,
						originalCount
					),
					<span
						key={recurciveRender.count + "link"}
						className={`link ${link}`}
					>
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

	/**
	 * 
	 * @param {*} props 
	 * @returns 
	 */
	function RenderCard(props) {
		let currentCard = props.currentCard,
			selec = props.selec,
			help = props.help;
		if (currentCard === undefined) return <span></span>;
		if (affichageSimple) {
			currentCard = currentCard.displayGoodCardRecur();
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

	/**
	 * 
	 * @param {*} card 
	 * @returns 
	 */
	function calcSizeCard(card) {
		if (card === undefined)
			return {
				minWidth: 0,
				minHeight: 0,
			};
		if (affichageSimple) {
			card = card.displayGoodCardRecur();
		}
		const prof = card.getProfondeur();
		if (prof === 1)
			return {
				width: "5vw",
				height: "13vh",
			};
		if (prof < 4)
			return {
				width: "11vw",
				height: "13vh",
			};
		if (prof < 5)
			return {
				width: "11vw",
				height: "20vh",
			};
		if (prof < 6)
			return {
				width: "15vw",
				height: "20vh",
			};
		return {
			width: "15vw",
			height: "28vh",
		};
	}

	useEffect((_) => {
		return (_) => {
			if (false) {
				console.log("lol");
			}
		};
	});

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
								: "") +
							(game[deckIndice][cardIndice].nouveau
								? "nouveau "
								: "")
						}
						style={calcSizeCard(game[deckIndice][cardIndice])}
					>
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
