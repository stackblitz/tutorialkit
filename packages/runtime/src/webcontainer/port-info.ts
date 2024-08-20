export class PortInfo {
  constructor(
    readonly port: number,
    public origin?: string,
    public ready: boolean = false,
  ) {}
}
