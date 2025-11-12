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
