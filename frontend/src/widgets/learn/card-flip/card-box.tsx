import {CardContent, Typography} from "@mui/material";
import React from "react";
import { StyledCardBox } from "./styled-components";

interface CardBoxProps {
    children: React.ReactNode;
}

export const CardBox: React.FC<CardBoxProps> = ({children}) => {

    return (
        <StyledCardBox>
            <CardContent sx={{width: '100%', textAlign: 'center', p: 4}}>
                <Typography variant="h4" sx={{
                    mb: 3,
                    minHeight: 120,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {children}
                </Typography>
            </CardContent>
        </StyledCardBox>
    )
}