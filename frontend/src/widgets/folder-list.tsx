import { List, ListItemButton, ListItemText } from '@mui/material';

export interface Folder {
    id: string;
    name: string;
}

interface FolderListProps {
    folders: Folder[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export const FolderList = ({ folders, selectedId, onSelect }: FolderListProps) => {
    return (
        <List>
            {folders.map((folder) => (
                <ListItemButton
                    key={folder.id}
                    selected={selectedId === folder.id}
                    onClick={() => onSelect(folder.id)}
                >
                    <ListItemText primary={folder.name} />
                </ListItemButton>
            ))}
        </List>
    );
};