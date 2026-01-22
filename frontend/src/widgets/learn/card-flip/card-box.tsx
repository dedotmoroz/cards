import React, { useMemo } from "react";
import { StyledCardBox, StyledCardTypography, StyledCardContent } from "./styled-components";

interface CardBoxProps {
    children: React.ReactNode;
}

// Функция для извлечения текста из ReactNode
const getTextFromNode = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }
    if (React.isValidElement(node)) {
        const element = node as React.ReactElement;
        if ('props' in element && element.props && typeof element.props === 'object' && 'children' in element.props) {
            return getTextFromNode(element.props.children as React.ReactNode);
        }
    }
    if (Array.isArray(node)) {
        return node.map(getTextFromNode).join('');
    }
    return '';
};

export const CardBox: React.FC<CardBoxProps> = ({children}) => {
    // Определяем длину текста и размер шрифта
    const fontSize = useMemo(() => {
        const text = getTextFromNode(children);
        const textLength = text.length;
        return textLength > 60 ? '28px' : undefined;
    }, [children]);

    return (
        <StyledCardBox>
            <StyledCardContent>
                <StyledCardTypography variant="h4" $fontSize={fontSize}>
                    {children}
                </StyledCardTypography>
            </StyledCardContent>
        </StyledCardBox>
    )
}