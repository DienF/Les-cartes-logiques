import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Game from "../components/Game";
import Navigation from "../components/Navigation";
import PopupForms from "../components/PopupForms";

const Exercise = () => {
	const [num, setNum] = useState();
	let tmp = useParams().num;
	let mode = useParams().mode;
	const [ex, setEx] = useState();
	const navigate = useNavigate();
	const nbExo = 32;

	useEffect(() => {
		let tmpEx = [];
		if (mode === "Play") {
			setNum(tmp);
			fetch("json/exos_feuilles/ex" + tmp + ".json")
				.then((response) => response.text())
				.then((data) => {
					tmpEx = JSON.parse(data);
					setEx(tmpEx);
				});
		} else if (mode === "Tutorial") {
			setNum(tmp);
			fetch("json/tuto" + tmp + ".json")
				.then((response) => response.text())
				.then((data) => {
					tmpEx = JSON.parse(data);
					setEx(tmpEx);
				});
		} else if (mode === "Create" && tmp === undefined) setEx([[], []]);
		else navigate("/NotFound");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tmp, mode]);

	return (
		<div className="home">
			<Navigation />
			{ex !== undefined && (
				<Game mode={mode} ex={ex} numero={num - 1} nbExo={nbExo} />
			)}
			<PopupForms />
		</div>
	);
};

export default Exercise;
