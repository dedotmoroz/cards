import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const StyledWrapper = styled(Box)`
    max-width: 900px;
    margin: 0 auto;
    padding: 20px 20px;
`;

export const StyledTitle = styled(Box)`
    font-size: 28px;
    font-weight: 600;
    padding: 20px 0;
    @media (min-width: 600px) {
        font-size: 32px;
    }
`;

export const StyledContent = styled(Box)``;