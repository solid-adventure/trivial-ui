import chai from "chai";
import sinon from "sinon";

const expect = chai.expect;

import Permissions from "../../src/models/Permissions.js";

let mockPermissionsResponse = {
  destroy: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
    ],
    credential_set_ids: [],
  },
  grant: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
    ],
    credential_set_ids: [],
  },
  transfer: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
    ],
    credential_set_ids: [],
  },
  update: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
    ],
    credential_set_ids: [],
  },
};

describe("Permissions", () => {
  let permissions;
  let sessionMock;
  let consoleErrorSpy;
  let model;
  let ability;
  let appName;
  const userId = 2;

  beforeEach(() => {
    sessionMock = {
      apiCall: sinon.stub().resolves(mockPermissionsResponse),
    };
    permissions = new Permissions(sessionMock);
    consoleErrorSpy = sinon.spy(console, "error");
  });

  afterEach(() => {
    consoleErrorSpy.restore();
  });

  describe("load", () => {
    it("should throw an error if user ID is not provided", async () => {
        await permissions.load();
        expect(consoleErrorSpy.calledWith("Error loading permissions:", "User ID is required.")).to.be.true;
    });

    it("should load a list of Permissions when userId is provided", async ()=> {
        await permissions.load(userId);
        expect(permissions._permissions).to.exist;
    })
  });

  describe("can", () => {
    it("should throw an error if model is not available", async () => {
        model = "unknown"
        appName = "i3bd0aefud13s6"
        await permissions.load(userId);
        await permissions.can('update', model, {appName: appName});  
        expect(consoleErrorSpy.calledWith(`Model: ${model} not found`)).to.be.true;
    })

    it("should throw an error if ability is not available for App", async () => {
        ability = "unknown"
        appName = "i3bd0aefud13s6"
        await permissions.load(userId);
        await permissions.can("unknown", "App", {appName: appName});  
        expect(consoleErrorSpy.calledWith(`Ability: ${ability} not found in App permissions`)).to.be.true;
    })
  })
});
