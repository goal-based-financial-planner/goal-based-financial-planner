import {
  Box,
  Card,
  Typography,
  Backdrop,
  Portal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import { DEFAULT_INVESTMENT_OPTIONS } from '../../../../domain/constants';
import { InvestmentPerOptionType } from '../../../../components/GoalWiseInvestmentSuggestion';

const InvestmentSuggestionCard = ({
  investmentName,
  totalValue,
  goalDetails,
}: {
  investmentName: string;
  totalValue: number;
  goalDetails: InvestmentPerOptionType[];
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpandAndFlip = () => {
    if (isExpanded) {
      setIsFlipped((prev) => !prev);
      setTimeout(() => setIsExpanded(false));
    } else {
      setIsExpanded((prev) => !prev);
      setTimeout(() => setIsFlipped((prev) => !prev));
    }
  };

  const cardContent = (
    <ReactCardFlip
      flipDirection="horizontal"
      isFlipped={isFlipped}
      containerStyle={{
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      <Card
        sx={{
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.3s ease-in-out',
        }}
        onClick={toggleExpandAndFlip}
      >
        <Box
          sx={{
            height: '60%',
            backgroundColor: '#CDB3A1',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontSize: '64px', color: '#000000' }}
            >
              {DEFAULT_INVESTMENT_OPTIONS.find(
                (o) => o.investmentName === investmentName,
              )?.materialIconName || 'account_balance'}
            </span>
          </Box>
        </Box>
        <Box sx={{ padding: 1, height: '15%' }}>
          <Typography sx={{ fontSize: '16px' }}>{investmentName}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            px: 1,
            height: '25%',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '20px' }}>
            {totalValue.toLocaleString(navigator.language, {
              maximumFractionDigits: 0,
            })}
          </Typography>
        </Box>
      </Card>

      <Card
        sx={{
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          transition: 'transform 0.3s ease-in-out',
        }}
        onClick={toggleExpandAndFlip}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
            backgroundColor: 'teal',
            padding: 1,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            color: '#fff',
          }}
        >
          <Box>
            <Typography sx={{ textAlign: 'center', mb: 1, fontSize: '32px' }}>
              {investmentName}
            </Typography>
            <Typography sx={{ textAlign: 'center', mb: 2, fontSize: '24px' }}>
              Total:{' '}
              {totalValue.toLocaleString(navigator.language, {
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Box>

          <Box
            sx={{
              borderRadius: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: 2,
              flexGrow: 1,
            }}
          >
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableBody>
                  {goalDetails.map((goal, idx) => (
                    <TableRow key={idx}>
                      <TableCell
                        sx={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontSize: '14px',
                          textAlign: 'left',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {goal.goalName}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontSize: '14px',
                          textAlign: 'right',
                          fontWeight: 'bold',
                        }}
                      >
                        ₹
                        {goal.amount.toLocaleString(navigator.language, {
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Card>
    </ReactCardFlip>
  );

  return (
    <>
      <Backdrop
        open={isExpanded}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onClick={toggleExpandAndFlip}
      />
      {isExpanded ? (
        <Portal>
          <Box
            sx={{
              perspective: '1000px',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '310px',
              height: '510px',
              transition: 'all 0.3s ease-in-out',
              zIndex: (theme) => theme.zIndex.drawer + 2,
            }}
          >
            {cardContent}
          </Box>
        </Portal>
      ) : (
        <Box
          sx={{
            perspective: '1000px',
            width: '155px',
            height: '255px',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {cardContent}
        </Box>
      )}
    </>
  );
};

export default InvestmentSuggestionCard;
