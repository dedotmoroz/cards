export const defaultSetting = {
    createFolder: true,
    folderName: 'new folder',
    card: [{
        question: 'cat',
        answer: '...',
    }] as Array<{ question: string; answer: string }>
} as const