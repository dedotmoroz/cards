import axios from 'axios';

// shared/api/apiCreateCard.ts
export async function apiCreateCard({
                                        folderId,
                                        question,
                                        answer,
                                    }: {
    folderId: string;
    question: string;
    answer: string;
}) {
    await axios.post('http://localhost:3000/cards', {
        folderId,
        question,
        answer,
    });
}