export abstract class IRepository<T> {
    abstract get(id: string): Promise<T>;

    abstract create(user: string, id: T): Promise<T>;

    abstract update(user: string, item: T): Promise<T>;

    abstract delete(user: string, id: string): Promise<string>;
}
