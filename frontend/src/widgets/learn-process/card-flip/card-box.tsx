import {Card, CardContent, Typography} from "@mui/material";


export const CardBox = ({children}) => {

    return (
        <Card
            sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '20px',
                '&:hover': {
                    boxShadow: 3
                },
            }}
        >
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
        </Card>
    )
}