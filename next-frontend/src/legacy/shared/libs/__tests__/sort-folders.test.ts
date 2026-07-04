import { describe, expect, it } from 'vitest';
import { sortFolders } from '../sort-folders';

const folders = [
    { id: '1', name: 'Beta', createdAt: '2024-01-01T00:00:00.000Z', pinned: false },
    { id: '2', name: 'Alpha', createdAt: '2024-03-01T00:00:00.000Z', pinned: true },
    { id: '3', name: 'Gamma', createdAt: '2024-02-01T00:00:00.000Z', pinned: false },
    { id: '4', name: 'Delta', createdAt: '2024-04-01T00:00:00.000Z', pinned: true },
];

describe('sortFolders', () => {
    it('places pinned folders before unpinned', () => {
        const sorted = sortFolders(folders, 'created_desc');
        expect(sorted.map((f) => f.id)).toEqual(['4', '2', '3', '1']);
    });

    it('sorts by createdAt desc within each group', () => {
        const sorted = sortFolders(folders, 'created_desc');
        expect(sorted.slice(0, 2).map((f) => f.id)).toEqual(['4', '2']);
        expect(sorted.slice(2).map((f) => f.id)).toEqual(['3', '1']);
    });

    it('sorts by name asc within each group', () => {
        const sorted = sortFolders(folders, 'name_asc');
        expect(sorted.map((f) => f.id)).toEqual(['2', '4', '1', '3']);
    });

    it('uses reversed API order when createdAt is missing', () => {
        const withoutDates = [
            { id: '1', name: 'Beta' },
            { id: '2', name: 'Alpha' },
            { id: '3', name: 'Gamma' },
        ];
        const byDate = sortFolders(withoutDates, 'created_desc');
        const byName = sortFolders(withoutDates, 'name_asc');
        expect(byDate.map((f) => f.id)).toEqual(['3', '2', '1']);
        expect(byName.map((f) => f.id)).toEqual(['2', '1', '3']);
    });

    it('uses reversed API order when createdAt is equal', () => {
        const sameDate = [
            { id: '1', name: 'Bravo', createdAt: '2024-01-01T00:00:00.000Z' },
            { id: '2', name: 'Alpha', createdAt: '2024-01-01T00:00:00.000Z' },
        ];
        const sorted = sortFolders(sameDate, 'created_desc');
        expect(sorted.map((f) => f.id)).toEqual(['2', '1']);
    });
});
