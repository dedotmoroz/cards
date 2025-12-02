import { CheckboxUI } from '@/shared/ui/checkbox-ui';

interface ToggleCardLearnedProps {
    cardId: string;
    isLearned: boolean;
    onToggle: (cardId: string, isLearned: boolean) => void;
}

export const ToggleCardLearned = ({ cardId, isLearned, onToggle }: ToggleCardLearnedProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle(cardId, e.target.checked);
    };

    return (
        <CheckboxUI
            edge="end"
            checked={isLearned}
            onChange={handleChange}
        />
    );
};

