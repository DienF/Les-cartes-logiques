export default class Card {
	/**
	 * @param {number} id
	 * @param {string|null} color - couleurs disponibles :
	 *                              rouge  ("red")    ;
	 *                              jaune  ("yellow") ;
	 *                              bleu   ("blue")   ;
	 *                              orange ("orange")
	 * @param {true|false} active
	 * @param {""|"et"|"=>"} link - ""    = carte simple ;
	 *                              "¬"   = liaison "¬"  ;
	 *                              "et"  = liaison "et" ;
	 *                              "ou"  = liaison "ou" ;
	 *                              "=>"  = liaison "⇒" ;
	 *                              "<=>" = liaison "⟺"
	 * @param {Card|null} left
	 * @param {Card|null} right
	 */
	constructor(id, color, active, link, left, right) {
		this.id = id;
		this.color = color;
		this.active = active;
		this.link = link;
		this.left = left;
		this.right = right;
		this.hover = false;
	}

	/**
	 * Traduit la couleur de la carte, de base en anglais, en français afin de l'afficher en format LaTeX.
	 * @param {string} color - la couleur de la carte
	 * @returns {string} la traduction de la couleur
	 */
	getColor = (color) => {
		switch (color) {
			case "red":
				return "Rouge";
			case "yellow":
				return "Jaune";
			case "blue":
				return "Bleue";
			case "orange":
				return "Orange";
			case "green":
				return "Verte";
			case "purple":
				return "Violette";
			case "black":
				return "True";
			case "white":
				return "False";
			default:
				return "Non definie";
		}
	};

	/**
	 * Renvoie un objet {@link Card} sous la forme d'un string.
	 * Carte simple : "couleur"
	 * Carte double : "(couleur liaison couleur)"
	 * Carte triple : "(couleur liaison (couleur liaison (couleur))"
	 * Carte quadruple : ((couleur liaison couleur) liaison (couleur liaison couleur))
	 * @example "(rouge∧jaune) ⇒ bleu"
	 * @returns {string} un string plus lisible
	 */
	toString() {
		let res = "";
		// Couleur de la carte
		if (this.color !== null) res += this.getColor(this.color);
		// Carte gauche
		if (this.left !== null) res += "(" + this.left.toString();
		// Liaison
		if (this.link === "et") res += "^";
		// else if (this.link === "") res += ""; // ou
		else if (this.link === "=>") res += "=>";
		else if (this.link === "<=>") res += "<=>";
		else res += this.link;
		// Carte droite
		if (this.right !== null) res += this.right.toString() + ")";
		return res;
	}

	/**
	 * Transforme un objet Card en objet JSON.
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
		else
			return {
				left: this.left.toFile(),
				link: this.link,
				right: this.right.toFile(),
			};
	}

	/**
	 * Renvoie une nouvelle instance d'une carte.
	 * Si la carte est composée de 2 autres cartes ces dernières sont également de nouvelles instances.
	 * @returns {Card} une nouvelle instance d'une même carte
	 */
	copy() {
		let l = null,
			r = null;
		if (this.left !== null) l = this.left.copy();
		if (this.right !== null) r = this.right.copy();
		return new Card(this.id, this.color, this.active, this.link, l, r);
	}

	/**
	 * Fonction récursive qui :
	 * change l'attribut 'active' ;
	 * regarde si left & right sont null, si ils ne le sont pas on appelle la même fonction sur eux.
	 * @param {true|false} state - booléen qui définit si une carte est sélectionnée ou pas
	 */
	select(state) {
		this.active = state;
		if (this.left != null) this.left.select(state);
		if (this.right != null) this.right.select(state);
	}

	/**
	 * Compare les attributs de 2 cartes.
	 * @param {Card} card - l'autre carte à comparer
	 * @returns {true|false} true si identiques sinon false
	 */
	equals(card) {
		if (this.color !== null && card.color !== null)
			return this.color === card.color;
		else {
			let bool = true;
			if (
				(this.left === null && card.left !== null) ||
				(this.left !== null && card.left === null)
			)
				return false;
			if (
				(this.right === null && card.right !== null) ||
				(this.right !== null && card.right === null)
			)
				return false;
			if (this.link !== card.link) return false;
			if (this.left !== null && card.left !== null)
				bool = this.left.equals(card.left);
			if (this.right !== null && card.right !== null)
				bool = bool && this.right.equals(card.right);
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
		if (this.color !== null) return "On a" + this.getColor(this.color);
		else if (this.link === "et")
			return "On a" + this.left.toString() + "∧" + this.right.toString();
		else if (this.link === "ou")
			return "On a" + this.left.toString() + "∨" + this.right.toString();
		else
			return (
				"Puisque" +
				this.left.toString() +
				", on a " +
				this.right.toString()
			);
	}
	getProfondeur() {
		let res = 1;
		if (this.color !== null) {
			return res;
		}
		const tmp1 = this.left.getProfondeur();
		const tmp2 = this.right.getProfondeur();
		const finalTmp = Math.max(tmp1, tmp2);
		res += finalTmp;

		return res;
	}
	isDoubleArraow() {
		if (this.color !== null) {
			return false;
		}
		if (this.link !== "et") {
			return false;
		}
		if (this.left.link !== "=>" || this.right.link !== "=>") {
			return false;
		}
		return true;
	}
	ifDoubleArraowReturnGoodCard() {
		if (!this.isDoubleArraow()) {
			return this;
		}
		return new Card(
			this.id,
			null,
			this.active,
			"<=>",
			this.left.left,
			this.left.right
		);
	}
	ifNonReturnNonCard() {
		if (this.color !== null) {
			return this;
		}
		if (this.right.color !== "white") {
			return this;
		}
		if (this.link !== "=>") {
			return this;
		}
		return new Card(
			this.id,
			null,
			this.active,
			"non",
			new Card(0, "transparent", this.active, "", null, null),
			this.left
		);
	}
	displayGoodCard() {
		let tmp = this.ifDoubleArraowReturnGoodCard();
		tmp = tmp.ifNonReturnNonCard();
		return tmp;
	}
}
