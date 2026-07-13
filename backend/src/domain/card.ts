export const MAX_CARD_CONTEXTS = 5;

export type CardContext = {
  id: string;
  text: string;
  translation: string;
  createdAt: string;
};

export class ContextLimitReachedError extends Error {
  readonly code = 'CONTEXT_LIMIT_REACHED' as const;

  constructor(message = 'Card already has the maximum number of contexts') {
    super(message);
    this.name = 'ContextLimitReachedError';
  }
}

export class Card {
  constructor(
    public readonly id: string,
    public folderId: string,
    public question: string,
    public answer: string,
    public isLearned: boolean = false,
    public createdAt: Date = new Date(),
    // Интервальное повторение (внутренние поля)
    public lastShownAt: Date | null = null,
    public lastLearnedAt: Date | null = null,
    public nextReviewAt: Date | null = null,
    // Статистика обучения
    public reviewCount: number = 0,
    public correctCount: number = 0,
    public incorrectCount: number = 0,
    // Алгоритм SM-2
    public currentInterval: number = 0,
    public repetitions: number = 0,
    public easeFactor: number = 2.5,
    public lastRating: number | null = null,
    public averageRating: number = 0,
    public questionSentences: string | null = null,
    public answerSentences: string | null = null,
    public contexts: CardContext[] = [],
    public activeContextId: string | null = null,
  ) {
    if (this.contexts.length > 0) {
      this.syncSentenceMirrors();
    }
  }

  private syncSentenceMirrors(): void {
    const active = this.getActiveContext();
    if (!active) {
      this.questionSentences = null;
      this.answerSentences = null;
      this.activeContextId = null;
      return;
    }
    this.activeContextId = active.id;
    this.questionSentences = active.text || null;
    this.answerSentences = active.translation || null;
  }

  getActiveContext(): CardContext | null {
    if (this.contexts.length === 0) return null;
    if (this.activeContextId) {
      const found = this.contexts.find((c) => c.id === this.activeContextId);
      if (found) return found;
    }
    return this.contexts[this.contexts.length - 1] ?? null;
  }

  /**
   * Legacy API: set mirror sentence fields as a single context slot (or clear).
   */
  replaceLegacySentences(
    questionSentences: string | null,
    answerSentences: string | null,
  ): void {
    const text = questionSentences?.trim() ?? '';
    const translation = answerSentences?.trim() ?? '';
    if (!text && !translation) {
      this.contexts = [];
      this.activeContextId = null;
      this.questionSentences = null;
      this.answerSentences = null;
      return;
    }
    if (this.contexts.length === 0) {
      const id = crypto.randomUUID();
      this.contexts = [
        {
          id,
          text,
          translation,
          createdAt: new Date().toISOString(),
        },
      ];
      this.activeContextId = id;
    } else {
      const active = this.getActiveContext();
      if (active) {
        active.text = text;
        active.translation = translation;
      }
    }
    this.syncSentenceMirrors();
  }

  setQuestionSentences(sentences: string | null): void {
    this.replaceLegacySentences(sentences, this.answerSentences);
  }

  setAnswerSentences(sentences: string | null): void {
    this.replaceLegacySentences(this.questionSentences, sentences);
  }

  appendContext(
    input: { text: string; translation: string },
    options: { replaceOldest?: boolean } = {},
  ): CardContext {
    const text = input.text.trim();
    const translation = input.translation.trim();
    if (!text && !translation) {
      throw new Error('Context text and translation are empty');
    }

    if (this.contexts.length >= MAX_CARD_CONTEXTS) {
      if (!options.replaceOldest) {
        throw new ContextLimitReachedError();
      }
      // Array order is chronological (append-only); index 0 is oldest.
      this.contexts = this.contexts.slice(1);
    }

    const context: CardContext = {
      id: crypto.randomUUID(),
      text,
      translation,
      createdAt: new Date().toISOString(),
    };
    this.contexts = [...this.contexts, context];
    this.activeContextId = context.id;
    this.syncSentenceMirrors();
    return context;
  }

  setActiveContext(contextId: string): void {
    const found = this.contexts.find((c) => c.id === contextId);
    if (!found) {
      throw new Error('Context not found');
    }
    this.activeContextId = found.id;
    this.syncSentenceMirrors();
  }

  removeContext(contextId: string): void {
    const index = this.contexts.findIndex((c) => c.id === contextId);
    if (index < 0) {
      throw new Error('Context not found');
    }
    const wasActive = this.activeContextId === contextId;
    this.contexts = this.contexts.filter((c) => c.id !== contextId);
    if (this.contexts.length === 0) {
      this.activeContextId = null;
    } else if (wasActive) {
      const next = this.contexts[Math.min(index, this.contexts.length - 1)];
      this.activeContextId = next.id;
    }
    this.syncSentenceMirrors();
  }

  markAsLearned(): void {
    this.isLearned = true;
    this.lastLearnedAt = new Date();
  }

  markAsUnlearned(): void {
    this.isLearned = false;
  }

  // Методы для интервального повторения
  markAsShown(): void {
    this.lastShownAt = new Date();
    this.reviewCount++;
  }

  recordCorrect(): void {
    this.correctCount++;
    this.updateAverageRating(5); // Предполагаем, что правильный ответ = 5
  }

  recordIncorrect(): void {
    this.incorrectCount++;
    this.updateAverageRating(1); // Предполагаем, что неправильный ответ = 1
  }

  updateAverageRating(rating: number): void {
    this.lastRating = rating;
    const totalReviews = this.correctCount + this.incorrectCount;
    if (totalReviews > 0) {
      this.averageRating = ((this.averageRating * (totalReviews - 1)) + rating) / totalReviews;
    } else {
      this.averageRating = rating;
    }
  }

  /**
   * Review карточки: единая точка, которая обновляет показ/статистику/SM-2.
   * При каждом `know` обновляем `lastLearnedAt`, чтобы виртуальная папка «Вспомни»
   * (сортировка по давности) не застревала на одних и тех же карточках.
   */
  review(outcome: 'know' | 'dontknow', now: Date = new Date()): void {
    // Показ + счетчик повторов
    this.lastShownAt = now;
    this.reviewCount += 1;

    const rating = outcome === 'know' ? 5 : 1;
    if (outcome === 'know') {
      this.correctCount += 1;
      this.updateAverageRating(rating);
      this.isLearned = true;
      this.lastLearnedAt = now;
    } else {
      this.incorrectCount += 1;
      this.updateAverageRating(rating);
      this.isLearned = false;
    }

    this.applySm2(rating, now);
  }

  private applySm2(rating: number, now: Date): void {
    // rating: 0..5, мы используем 1/5, но оставляем общий вариант
    const q = Math.max(0, Math.min(5, rating));

    // EF update (classic SM-2)
    const nextEf =
      this.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    this.easeFactor = Math.max(1.3, Number.isFinite(nextEf) ? nextEf : 1.3);

    if (q < 3) {
      this.repetitions = 0;
      this.currentInterval = 1;
    } else {
      const nextReps = (this.repetitions ?? 0) + 1;
      this.repetitions = nextReps;

      if (nextReps === 1) {
        this.currentInterval = 1;
      } else if (nextReps === 2) {
        this.currentInterval = 6;
      } else {
        const base = this.currentInterval > 0 ? this.currentInterval : 6;
        this.currentInterval = Math.max(1, Math.round(base * this.easeFactor));
      }
    }

    this.lastRating = q;
    this.nextReviewAt = new Date(now.getTime() + this.currentInterval * 24 * 60 * 60 * 1000);
  }

  // Получить карточки для повторения (только основные поля для фронта)
  toPublicDTO() {
    return {
      id: this.id,
      folderId: this.folderId,
      question: this.question,
      answer: this.answer,
      isLearned: this.isLearned,
      createdAt: this.createdAt,
      contexts: this.contexts,
      activeContextId: this.activeContextId,
      ...(this.questionSentences != null
        ? { questionSentences: this.questionSentences }
        : {}),
      ...(this.answerSentences != null
        ? { answerSentences: this.answerSentences }
        : {}),
    };
  }
}
