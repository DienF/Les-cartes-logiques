import React from "react";
import { NavLink } from "react-router-dom";

const Choice = () => {
	const jsonCount = 35;
	const alljson = [];
	for (let i = 1; i <= jsonCount; i++) {
		alljson.push(i);
	}
	const rownumber = alljson.length/5;

	const createRow = (start, end) => {
		let row = [];
		for (let index = start; index < end; index++) {
			row.push(<td key={index}>
					<NavLink
						exact="true"
						to={"/Exercise-Play-" + (index + 1)}
					>
						Niveau {index + 1}
					</NavLink>
				</td>)
		}
		return row
	}

	return (
		<div className="choice">
			<table>
				<tr>
					{createRow(0,5)}
				</tr>
				<tr>
					{createRow(5,10)}
				</tr>
				<tr>
					{createRow(10,15)}
				</tr>
				<tr>
					{createRow(15,20)}
				</tr>
				<tr>
					{createRow(20,25)}
				</tr>
				<tr>
					{createRow(25,30)}
				</tr>
				<tr>
					{createRow(30,35)}
				</tr>
			</table>
		</div>
	);
};

export default Choice;
