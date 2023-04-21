import React from "react";
import { useNavigate } from "react-router-dom";

const Choice = () => {
	const jsonCount = 36;
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
		}
		return <tr>{row}</tr>;
	};
	function AfficheChoice(props) {
		const res = [];
		for (let i = 0; i < jsonCount; i += 5) {
			res.push(<tbody>{createRow(i, i + 5)}</tbody>);
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
