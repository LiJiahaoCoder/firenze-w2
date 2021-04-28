export const createInterface = jest.fn().mockReturnValue({
  question: jest.fn().mockImplementationOnce((_, cb) => cb()),
});
