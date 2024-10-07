import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DEFAULT_INVESTMENT_OPTIONS } from '../../../domain/constants';
import { InvestmentChoiceType } from '../../../domain/InvestmentOptions';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '14px 0',
    },
    '& .MuiMenuItem-root': {
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.light,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

const CustomMenu = ({
  allocations,
  handleMenuChange,
}: {
  allocations: InvestmentChoiceType[];

  handleMenuChange: (option: string) => void;
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (selectedOption: string) => {
    handleMenuChange(selectedOption);
    handleClose();
  };

  const filteredOptions = DEFAULT_INVESTMENT_OPTIONS.filter(
    (opt) => !allocations.map((a) => a.id).includes(opt.investmentName),
  );
  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Options
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {filteredOptions.map((option) => (
          <MenuItem
            onClick={() => handleMenuItemClick(option.investmentName)}
            disableRipple
          >
            {option.investmentName}
          </MenuItem>
        ))}
      </StyledMenu>
    </div>
  );
};

export default CustomMenu;
