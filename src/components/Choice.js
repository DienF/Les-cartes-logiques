import React from "react";
import { useNavigate } from "react-router-dom";

const Choice = () => {
	const jsonCount = 35;
	const alljson = [];
	for (let i = 1; i <= jsonCount; i++) {
		alljson.push(i);
	}
	const rownumber = alljson.length / 5;
	const navigate = useNavigate();

	function goToExo(event) {
		const url = event.target.getAttribute("url");
		navigate(url);
	}

	const createRow = (start, end) => {
		let row = [];
		for (let index = start; index < end; index++) {
			row.push(
				<td
					key={index}
					onClick={goToExo}
					url={"/Exercise-Play-" + (index + 1)}
				>
					<p url={"/Exercise-Play-" + (index + 1)}>
						Niveau {index + 1}
					</p>
				</td>
			);
		}
		return <tr>{row}</tr>;
	};
	function AfficheChoice(props) {
		const res = [];
		for (let i = 0; i < jsonCount; i += 5) {
			res.push(createRow(i, i + 5));
		}
		return res;
	}
	return (
		<div className="choice">
			<table>
				<AfficheChoice></AfficheChoice>
			</table>
		</div>
	);
};

export default Choice;
