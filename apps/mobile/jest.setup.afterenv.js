require("@testing-library/jest-native/extend-expect");

jest.spyOn(require("react-native").Alert, "alert");

const { notifyManager } = require("@tanstack/query-core");
const { act } = require("@testing-library/react-native");

notifyManager.setNotifyFunction(act);
