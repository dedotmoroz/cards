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
    public answerSentences: string | null = null
  ) {}

  setQuestionSentences(sentences: string | null): void {
    this.questionSentences = sentences ?? null;
  }

  setAnswerSentences(sentences: string | null): void {
    this.answerSentences = sentences ?? null;
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
   * Важно: `lastLearnedAt` используем как "момент первого изучения" для подборки «Вспомни».
   * Поэтому на повторных `know`, если карточка уже была выучена, `lastLearnedAt` не меняем.
   */
  review(outcome: 'know' | 'dontknow', now: Date = new Date()): void {
    // Показ + счетчик повторов
    this.lastShownAt = now;
    this.reviewCount += 1;

    const rating = outcome === 'know' ? 5 : 1;
    if (outcome === 'know') {
      this.correctCount += 1;
      this.updateAverageRating(rating);
      if (!this.isLearned) {
        this.isLearned = true;
        this.lastLearnedAt = now;
      }
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
      ...(this.questionSentences != null
        ? { questionSentences: this.questionSentences }
        : {}),
      ...(this.answerSentences != null
        ? { answerSentences: this.answerSentences }
        : {})
    };
  }
}
