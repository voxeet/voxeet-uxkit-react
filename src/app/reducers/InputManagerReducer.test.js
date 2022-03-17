import InputManagerReducer from "./InputManagerReducer";
import { Types } from "../actions/InputManagerActions";

describe("input manager reducer test suite", () => {
  test("reducer should return default state", () => {
    //1- arrange
    const action = { type: "" };

    //2- act
    const state = InputManagerReducer({}, action);

    //3- assert
    expect(state).toMatchSnapshot();
  });

  test("state should match snapshot when handling audio input update", () => {
    const device = {
      deviceId: "123",
      label: "audio input",
      kind: "audioinput",
      groupId: "123",
    };
    const action = {
      type: Types.INPUT_AUDIO_CHANGE,
      payload: {
        device,
      },
    };

    const state = InputManagerReducer({}, action);

    expect(state).toMatchSnapshot();
  });

  test("state should match snapshot when handling audio output update", () => {
    const device = {
      deviceId: "123",
      label: "audio output",
      kind: "audiooutput",
      groupId: "123",
    };
    const action = {
      type: Types.OUTPUT_AUDIO_CHANGE,
      payload: {
        device,
      },
    };

    const state = InputManagerReducer({}, action);

    expect(state).toMatchSnapshot();
  });

  test("state should match snapshot when handling video input update", () => {
    const device = {
      deviceId: "123",
      label: "video input",
      kind: "videoinput",
      groupId: "123",
    };
    const action = {
      type: Types.INPUT_VIDEO_CHANGE,
      payload: {
        device,
      },
    };

    const state = InputManagerReducer({}, action);

    expect(state).toMatchSnapshot();
  });
});
