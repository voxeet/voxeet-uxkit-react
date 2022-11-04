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

  test("it should return the default state when flushing errors", () => {
    //1- arrange
    const action = { type: Types.CLEAR_ERROR };
    const initialState = {};

    //2- act
    const newState = reducer(initialState, action);

    //3- assert
    expect(newState).toEqual(
      expect.objectContaining({
        isError: false,
        errorMessage: null,
      })
    );
  });

  test("it should return initial test when action type does not match", () => {
    const action = { type: undefined };
    const initialState = {};

    //2- act
    const newState = reducer(initialState, action);

    //3- assert
    expect(newState).toEqual(initialState);
  });
});
