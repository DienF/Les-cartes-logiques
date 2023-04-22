import React from "react";
import { useNavigate } from "react-router-dom";

const Choice = () => {
	const jsonCount = 36;
	const Difficulty = [[1,20,"Démonstrations"],[21,35,"Raisonnements"],[36,37,"Autres"]];
	const navigate = useNavigate();

	function goToExo(event) {
		const url = event.target.getAttribute("url");
		navigate(url);
	}

	const createRow = (start, end) => {
		let row = [];
		for (let index = start; index < end; index++) {
			if (index < jsonCount) {
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
			else {
				row.push(<td key={index}><p>   </p></td>);
			}
		}
		return <tr>{row}</tr>;
	};

	function AfficheChoice(props) {
		const res = [];
		Difficulty.forEach(category => {
			let table = [];
			res.push(<h2>{category[2]}</h2>);
			console.log(category[0]);
			console.log(category[1]);
			res.push(<table>{table}</table>);
			for (let i = category[0]-1; i < category[1]-1; i += 5){
				if (i > category[1]) res.push(table.push(<table>{createRow(i, category[1])}</table>))
				else table.push(createRow(i, i + 5));
			}
		});
		
		return res;
	}

	return (
		<div className="choice">
			<AfficheChoice></AfficheChoice>
		</div>
	);
};

export default Choice;