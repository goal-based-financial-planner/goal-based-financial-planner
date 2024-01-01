import {
	Unstable_Grid2 as Grid,
	Modal,
	Paper,
	Stack,
	TextField,
} from "@mui/material";
import React from "react";
// import { FormProvider, useForm } from "react-hook-form";
import CustomButton from "../../../common/CustomButton";
import { CancelRounded, SaveAltOutlined } from "@mui/icons-material";

interface AddFinancialGoalsProps {
	showAddGoalsModal: boolean;
	handleClose: () => void;
}
const AddFinancialGoals: React.FC<AddFinancialGoalsProps> = ({
	showAddGoalsModal,
	handleClose,
}: AddFinancialGoalsProps) => {
	// const methods = useForm<FormData>();

	return (
		<Modal
			component={Stack}
			open={showAddGoalsModal}
			alignItems="center"
			justifyContent="center"
			onClose={handleClose}
		>
			<Paper
				component={Stack}
				p={3}
				sx={{
					position: "absolute",
					minWidth: {
						xs: "90%",
						sm: null,
						md: 400,
					},
					maxWidth: 400,
					width: {
						xs: "80%",
						md: 400,
					},
				}}
			>
				<h2 style={{ marginTop: 0 }}>Add Goal</h2>

				{/* <FormProvider {...methods}> */}
				<Grid container spacing={2}>
					<Grid xs={6}>
						<TextField label="Goal Name" required />
					</Grid>
					<Grid xs={6}>
						<TextField label="Amount" />
					</Grid>
					<Grid xs={6}>
						<TextField label="Investment Start Year" />
					</Grid>
					<Grid xs={6}>
						<TextField label="Investment End Year" />
					</Grid>
					<Grid xs={6}>
						<CustomButton
							text="Cancel"
							startIcon={<CancelRounded />}
							variant="outlined"
							onClick={handleClose}
						/>
					</Grid>
					<Grid
						xs={6}
						sx={{
							display: "flex",
							justifyContent: "flex-end",
							alignItems: "flex-end",
						}}
					>
						<CustomButton
							text="Add"
							startIcon={<SaveAltOutlined />}
							onClick={() => {}}
						/>
					</Grid>
				</Grid>
				{/* </FormProvider> */}
			</Paper>
		</Modal>
	);
};

export default AddFinancialGoals;
