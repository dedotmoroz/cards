import { ContextReadingArtifact } from '../domain/context-reading';

export type AppendContextReadingArtifactInput = {
    id: string;
    userId: string;
    folderId: string;
    jobId: string;
    cardIds: string[];
    cardsSnapshot: Array<{ question: string; answer: string }>;
    text: string;
    translation: string;
    level: string;
    hasAudio: boolean;
    createdAt: Date;
};

export type AppendContextReadingArtifactResult = {
    artifact: ContextReadingArtifact;
    /** True when an existing row with the same jobId was returned. */
    alreadyExisted: boolean;
};

export interface ContextReadingArtifactRepository {
    listByFolder(
        userId: string,
        folderId: string
    ): Promise<ContextReadingArtifact[]>;
    findByJobId(
        userId: string,
        folderId: string,
        jobId: string
    ): Promise<ContextReadingArtifact | null>;
    findByIdForUser(
        userId: string,
        artifactId: string
    ): Promise<ContextReadingArtifact | null>;
    insertAppend(
        input: AppendContextReadingArtifactInput
    ): Promise<AppendContextReadingArtifactResult>;
    /**
     * Deletes oldest artifacts beyond `limit` for the folder.
     * Returns ids of deleted artifacts (for audio cleanup).
     */
    pruneOldestBeyond(
        userId: string,
        folderId: string,
        limit: number
    ): Promise<string[]>;
    deleteByUserId(userId: string, executor?: any): Promise<void>;
}
