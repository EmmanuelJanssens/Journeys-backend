import { GeneralExceptionFilter } from "./general-exception.filter";

describe("HttpExceptionFilter", () => {
    it("should be defined", () => {
        expect(new GeneralExceptionFilter()).toBeDefined();
    });
});
