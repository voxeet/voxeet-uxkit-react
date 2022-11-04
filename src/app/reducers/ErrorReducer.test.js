import { Types } from "../actions/ErrorActions";
import reducer from "./ErrorReducer";

jest.mock("@voxeet/voxeet-web-sdk", () => () => {
  return {};
});

describe("ErrorReducer test suite", () => {
  test("returned state should have an error message set and isError flag set to true", () => {
    //1- arrange
    const message = "oops";
    const action = { type: Types.ERROR, payload: { error: message } };
    const initialState = {};

    //2- act
    const newState = reducer(initialState, action);

    //3- assert
    expect(newState).toEqual(
      expect.objectContaining({
        isError: true,
        errorMessage: message,
      })
    );
  });
});
