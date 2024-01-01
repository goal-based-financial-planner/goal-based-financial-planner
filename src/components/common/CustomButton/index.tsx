import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

interface CustomButtonProps extends ButtonProps {
	text: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, ...rest }) => {
	return (
		<Button variant="contained" {...rest}>
			{text}
		</Button>
	);
};

export default CustomButton;
