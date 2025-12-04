import { CheckboxUI } from '@/shared/ui/checkbox-ui';

interface SelectAllCardsProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const SelectAllCards = ({ checked, onChange }: SelectAllCardsProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
    };

    return (
        <CheckboxUI
            checked={checked}
            onChange={handleChange}
        />
    );
};

