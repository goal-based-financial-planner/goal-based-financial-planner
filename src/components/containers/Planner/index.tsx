import React from "react";
import FinancialGoals from "../FinancialGoals";
import { Container } from "@mui/material";

const Planner: React.FC = () => {
	return (
		<Container maxWidth={false}>
			<FinancialGoals />
		</Container>
	);
};

export default Planner;
