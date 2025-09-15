export class Card {
  constructor(
    public readonly id: string,
    public folderId: string,
    public question: string,
    public answer: string,
    public isLearned: boolean = false
  ) {}

  markAsLearned(): void {
    this.isLearned = true;
  }

  markAsUnlearned(): void {
    this.isLearned = false;
  }
}
