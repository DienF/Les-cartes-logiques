import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
	const [ex, setEx] = useState();
	const [exTuto, setExTuto] = useState();

	useEffect(() => {
		fetch("exercices.json")
			.then((response) => response.text())
			.then((data) => {
				setEx(JSON.parse(data));
			});
		fetch("tutoriel.json")
			.then((response) => response.text())
			.then((data) => {
				setExTuto(JSON.parse(data));
			});
	}, []);

	return (
		<div className="navigation">
			<ul className="navbar">
				<li>
					<a href="#">Menu</a>
					<ul>
						<li>
							<NavLink exact="true" to="/">
								Accueil
							</NavLink>
						</li>
						<li>
							<NavLink exact="true" to="/Exercise-Create">
								Créer un exercice
							</NavLink>
						</li>
						<li className="choose">
							<a>Choisir un exercice</a>
							<ul>
								{ex !== undefined &&
									ex.map((exercice, index) => (
										<li className="exo" key={index}>
											<NavLink
												exact="true"
												to={
													"/Exercise-Play-" +
													(index + 1)
												}
											>
												Exercice {index + 1}
											</NavLink>
										</li>
									))}
							</ul>
						</li>
						<li className="choose">
							<a>Tutoriel</a>
							<ul id="tuto">
								{exTuto !== undefined &&
									exTuto.map((exercice, index) => (
										<li className="exo" key={index}>
											<NavLink
												exact="true"
												to={
													"/Exercise-Tutorial-" +
													(index + 1)
												}
											>
												Tutoriel {index + 1}
											</NavLink>
										</li>
									))}
							</ul>
						</li>
						<li>
							<NavLink exact="true" to="/About">
								À propos
							</NavLink>
						</li>
						<li>
							<NavLink exact="true" to="/Forms">
								Votre avis
							</NavLink>
						</li>
					</ul>
				</li>
			</ul>
			<h1>Les Cartes Logiques</h1>
			{window.location.pathname.substring(10, 14) === "Play" && (
				<div id="titrePage">
					{"Exercice " + window.location.pathname.substring(15, 30)}
				</div>
			)}
			{window.location.pathname === "/" && (
				<div id="titrePage">{"Accueil"}</div>
			)}
			{window.location.pathname === "/About" && (
				<div id="titrePage">{"À propos"}</div>
			)}
			{window.location.pathname.substring(10, 18) === "Create" && (
				<div id="titrePage">{"Créer un exercice"}</div>
			)}
			{window.location.pathname.substring(10, 18) === "Tutorial" && (
				<div id="titrePage">
					{"Tutoriel " + window.location.pathname.substring(19, 30)}
				</div>
			)}
		</div>
	);
};

export default Navigation;
