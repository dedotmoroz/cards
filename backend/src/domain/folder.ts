export class Folder {
  constructor(
    public readonly id: string,
    public name: string,
    public readonly userId: string,
    public sideALanguage: string,
    public sideBLanguage: string,
    public readonly createdAt: Date = new Date(),
    public pinned: boolean = false,
  ) {}
}
