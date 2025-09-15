import axios from 'axios';

export const apiCreateFolder = async (name: string, userId: string = '11111111-1111-1111-1111-111111111111') => {
    const res = await axios.post('http://localhost:3000/folders', {
        name,
        userId,
    });
    return res.data;
};