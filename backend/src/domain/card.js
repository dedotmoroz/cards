export class Card {
    id;
    folderId;
    question;
    answer;
    isLearned;
    constructor(id, folderId, question, answer, isLearned = false) {
        this.id = id;
        this.folderId = folderId;
        this.question = question;
        this.answer = answer;
        this.isLearned = isLearned;
    }
    markAsLearned() {
        this.isLearned = true;
    }
    markAsUnlearned() {
        this.isLearned = false;
    }
}
