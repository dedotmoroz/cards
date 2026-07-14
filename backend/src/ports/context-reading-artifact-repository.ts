import { ContextReadingArtifact } from '../domain/context-reading';

export type UpsertContextReadingArtifactInput = {
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

export type UpsertContextReadingArtifactResult = {
    artifact: ContextReadingArtifact;
    previousArtifactId: string | null;
};

export interface ContextReadingArtifactRepository {
    findLatest(
        userId: string,
        folderId: string
    ): Promise<ContextReadingArtifact | null>;
    findByIdForUser(
        userId: string,
        artifactId: string
    ): Promise<ContextReadingArtifact | null>;
    upsertLatest(
        input: UpsertContextReadingArtifactInput
    ): Promise<UpsertContextReadingArtifactResult>;
    deleteByUserId(userId: string, executor?: any): Promise<void>;
}
