import { styled } from "@mui/material/styles";
import {Box, Button, Card, Chip} from "@mui/material";

export const StyledBox = styled(Box)`
    display: flex;
    padding: 41px 41px 41px 41px;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    align-self: stretch;
    //grid-row: 1 / span 1;
    //grid-column: 1 / span 1;
    justify-self: stretch;
    
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.40);
    background: rgba(255, 255, 255, 0.40);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10);
`

export const StyledHeader = styled(Box)`
    display: flex;
    align-items: center;
    gap: 16px;
    color: #101828;
    // font-family: Inter;
    font-size: 30px;
    font-style: normal;
    font-weight: 400;
    line-height: 36px; /* 120% */
    letter-spacing: 0.396px;
`

export const StyledDescription = styled(Box)`
    color: #4A5565;
    // font-family: Inter;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 28px; /* 155.556% */
    letter-spacing: -0.439px;
`

export const StyledWhiteCard = styled(Card)`
    display: flex;
    padding: 65px 65px 65px 65px;
    flex-direction: column;
    align-items: center;

    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.40);
    background: rgba(255, 255, 255, 0.40);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`

export const StyledGradientCard = styled(Card)(({ theme }) => ({
    background: 'linear-gradient(135deg, #4F39F6 0%, #9810FA 50%, #E60076 100%)',
    borderRadius: '24px',
    padding: theme.spacing(6, 5),
    margin: '0 auto',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
        padding: theme.spacing(4, 3),
    },
}));

export const StyledWhiteButton = styled(Button)`
    // height: 40px;
    padding: 10px 24px 10px 24px;
    text-transform: none;
    font-size: 16px;
    color: #000;

    border-radius: 8px;
    background: #FFF;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10);
`

export const RobotCatIllustration = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: '-20px',
    left: '-20px',
    width: '120px',
    height: '120px',
    opacity: 0.8,
    [theme.breakpoints.down('md')]: {
        width: '80px',
        height: '80px',
        bottom: '-10px',
        left: '-10px',
    },
}));

export const StyledExampleCard = styled(Card)(({ theme }) => ({
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.50)',
    border: '1px solid rgba(255, 255, 255, 0.40)',
    padding: theme.spacing(3),
    maxWidth: '500px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}));

export const StyledExampleHeader = styled(Box)`
    display: flex;
    align-items: center;
    gap: 16px;
`

export const StyledSideA = styled(Box)`
    color: #101828;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px; /* 150% */
    letter-spacing: -0.312px;
`

export const StyledSideB = styled(Box)`
    color: #6A7282;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 142.857% */
    letter-spacing: -0.15px;
`

export const StyledTranslateBlock = styled(Box)`
    width: 100%;
    padding: 17px 17px 17px 17px;
    margin-top: 24px;

    border-radius: 14px;
    border: 1px solid rgba(198, 210, 255, 0.50);
    background: linear-gradient(135deg, #EEF2FF 0%, #FAF5FF 100%);
`

export const StyledColorText = styled(Box)`
    display: inline-block;
    color: #615FFF;
`

export const StyledHeaderTop = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    padding: 8px 24px;
    border: 1px solid #000;
    background: linear-gradient(90deg, #4F39F6 0%, #9810FA 100%);
`

export const StyledLogo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#6A0DAD',
}));

export const StyledAIIcon = styled(Box)`
    display: flex;
    width: 56px;
    height: 56px;
    justify-content: center;
    align-items: center;

    border-radius: 16px;
    background: linear-gradient(135deg, #615FFF 0%, #155DFC 100%);
    box-shadow: 0 10px 15px -3px rgba(97, 95, 255, 0.30), 0 4px 6px -4px rgba(97, 95, 255, 0.30);
`

export const StyledChromeIcon = styled(Box)`
    display: flex;
    width: 56px;
    height: 56px;
    justify-content: center;
    align-items: center;

    border-radius: 16px;
    background: linear-gradient(135deg, #AD46FF 0%, #E60076 100%);
    box-shadow: 0 10px 15px -3px rgba(173, 70, 255, 0.30), 0 4px 6px -4px rgba(173, 70, 255, 0.30);
`

export const StyledExcelIcon = styled(Box)`
    display: flex;
    width: 56px;
    height: 56px;
    justify-content: center;
    align-items: center;

    border-radius: 16px;
    background: linear-gradient(135deg, #00C950 0%, #096 100%);
    box-shadow: 0 10px 15px -3px rgba(0, 201, 80, 0.30), 0 4px 6px -4px rgba(0, 201, 80, 0.30);
`

export const StyledMonitorIcon = styled(Box)`
    display: flex;
    width: 56px;
    height: 56px;
    justify-content: center;
    align-items: center;

    border-radius: 16px;
    background: linear-gradient(135deg, #FF6900 0%, #E7000B 100%);
    box-shadow: 0 10px 15px -3px rgba(255, 105, 0, 0.30), 0 4px 6px -4px rgba(255, 105, 0, 0.30);
`

export const StyledLampIcon = styled(Box)`
    display: flex;
    width: 56px;
    height: 56px;
    justify-content: center;
    align-items: center;

    border-radius: 16px;
    background: linear-gradient(135deg, #AD46FF 0%, #E60076 100%);
    box-shadow: 0 10px 15px -3px rgba(173, 70, 255, 0.30), 0 4px 6px -4px rgba(173, 70, 255, 0.30);
`

export const StyledBookIcon = styled(Box)`
    display: flex;
    width: 48px;
    height: 48px;
    justify-content: center;
    align-items: center;

    border-radius: 14px;
    background: linear-gradient(135deg, #615FFF 0%, #9810FA 100%);
`

export const StyledWhiteHeader = styled(Box)`
    color: #101828;
    text-align: center;
    font-size: 48px;
    font-style: normal;
    font-weight: 400;
    line-height: 48px; /* 100% */
    letter-spacing: 0.35px;
    margin-top: 16px;
    margin-bottom: 24px;
`

export const StyledWhiteText = styled(Box)`
    color: #4A5565;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 29.25px; /* 162.5% */
    letter-spacing: -0.439px;
    margin-top: 16px;
`

export const StyledTypographyCrossed = styled(Box)`
    color: #99A1AF;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    line-height: 29.25px; /* 162.5% */
    letter-spacing: -0.439px;
    text-decoration-line: line-through;
`

export const StyledTypographyStressed = styled(Box)`
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: 29.25px; /* 162.5% */
    letter-spacing: -0.439px;
    background: linear-gradient(90deg, #4F39F6 0%, #9810FA 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`

export const StyledRedHeader = styled(Box)`
    color: #FFF;
    text-align: center;
    font-size: 48px;
    font-style: normal;
    font-weight: 400;
    line-height: 48px; /* 100% */
    letter-spacing: 0.352px;
`

export const StyledRedDescription = styled(Box)`
    color: rgba(255, 255, 255, 0.90);
    text-align: center;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 28px; /* 140% */
    letter-spacing: -0.449px;
    margin-top: 32px;
    margin-bottom: 32px;
`
export const StyledChip = styled(Chip)`
    display: flex;
    width: 291.617px;
    height: 42px;
    padding: 11.5px 17px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    margin-bottom: 32px;

    border-radius: 16777200px;
    border: 1px solid rgba(255, 255, 255, 0.40);
    background: linear-gradient(90deg, rgba(97, 95, 255, 0.20) 0%, rgba(173, 70, 255, 0.20) 100%);
`
export const StyledFS = styled(Box)`
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px; /* 150% */
    letter-spacing: -0.312px;

    background: linear-gradient(90deg, #4F39F6 0%, #9810FA 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`

export const StyledFirstScreenTitle = styled(Box)`
    color: #101828;
    font-size: 60px;
    font-style: normal;
    font-weight: 400;
    line-height: 60px; /* 100% */
    letter-spacing: 0.264px;
`

export const StyledFirstScreenDescription = styled(Box)`
    color: #4A5565;
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 32.5px; /* 162.5% */
    letter-spacing: -0.449px;
    margin-top: 32px;
    margin-bottom: 32px;
`

export const StyledInButton = styled(Button)`
    display: flex;
    // height: 40px;
    padding: 16px 24px 16px 24px;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
    color: #FFF;

    text-align: center;
    text-transform: none;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; /* 142.857% */
    // letter-spacing: -0.15px;

    border-radius: 8px;
    background: linear-gradient(90deg, #4F39F6 0%, #9810FA 100%);
    box-shadow: 0 20px 25px -5px rgba(97, 95, 255, 0.30), 0 8px 10px -6px rgba(97, 95, 255, 0.30);
`

export const StyledShowButton = styled(Button)`
    display: flex;
    // height: 40px;
    padding: 16px 24px 16px 24px;
    justify-content: center;
    align-items: flex-start;
    gap: 16px;
    color: #6A0DAD;

    text-align: center;
    text-transform: none;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; /* 142.857% */
    // letter-spacing: -0.15px;

    border-radius: 8px;
    border-color: #6A0DAD;

    &:hover {
       border-color: #5A0B9D;
       background-color: rgba(106, 13, 173, 0.05);
    }
    
`

