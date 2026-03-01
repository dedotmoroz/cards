import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

export const StyledWrapper = styled(Box)(({  }) => ({
    maxWidth: 900,
    margin: '40px auto',
}));

export const StyledTitle = styled('h1')({
    margin: 0,
    fontSize: '32px',
    fontWeight: 600,
    padding: '20px 0',
});

export const StyledList = styled('ul')({
    listStyle: 'none',
    paddingLeft: 0,
    margin: 0,
});

export const StyledListItem = styled('li')(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

export const StyledLink = styled(Link)({
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
});

export const StyledCover = styled('img')(({ theme }) => ({
    width: 80,
    height: 60,
    objectFit: 'cover',
    borderRadius: theme.shape.borderRadius,
}));
