import {Box, Skeleton} from "@mui/material";

export const CardSkeleton = () => {
    return (<Box flex={1} sx={{mt: 1}}>
        <Skeleton variant="text" width="100%" height={20}/>
        <Skeleton variant="text" width="80%" height={20}/>
    </Box>)
}