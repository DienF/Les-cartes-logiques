import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const Choice = () => {
	const jsonCount = 35;
	const alljson = [];
	for (let i = 1; i <= jsonCount; i++) {
		alljson.push(i);
		}

	return (
		<div className="choice">
			<div className="choicebar">
				<ul>
					{alljson.map((json, index) => (
							<li key={index}>
								<NavLink
									exact="true"
									to={"/Exercise-Play-" + (index + 1)}
								>
									Niveau {index + 1}
								</NavLink>
							</li>
						))}
				</ul>
			</div>
		</div>
	);
};

export default Choice;
