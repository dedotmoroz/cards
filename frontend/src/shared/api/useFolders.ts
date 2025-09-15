// src/shared/api/useFolders.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

export type Folder = {
    id: string;
    name: string;
    userId: string;
};

export function useFolders() {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const fetchFolders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await axios.get<Folder[]>('http://localhost:3000/folders/11111111-1111-1111-1111-111111111111');
                setFolders(res.data);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFolders();
    }, []);

    return {
        folders,
        isLoading,
        error,
    };
}