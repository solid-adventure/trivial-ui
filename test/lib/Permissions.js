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
      "5b83e11ab9ff8e"
    ],
    credential_set_ids: [],
  },
  grant: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
      "a2dcf60ef9a7c3"
    ],
    credential_set_ids: [],
  },
  transfer: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
      "fb2e09a5c381d6"
    ],
    credential_set_ids: [],
  },
  update: {
    app_names: [
      "af6abd07ecdcdd",
      "0b07af48aa8991",
      "5fbd0cef5d9306",
      "c4c270d211fea2",
      "8dfe7a96b0b5e4"
    ],
    credential_set_ids: [],
  },
};

describe("Permissions", () => {
  let permissions;
  let sessionMock;
  let model;
  let ability;
  let appName;
  let result;

  sessionMock = {
    apiCall: sinon.stub().resolves(mockPermissionsResponse),
  };

  let mockUser = {
    id: "1",
  };

  describe("new Permission", () => {
    it("should throw an error if user ID or Session is not provided", async () => {
      expect(() => new Permissions(sessionMock)).to.throw(
        "User and Session is required."
      );
      expect(() => new Permissions()).to.throw("User and Session is required.");
    });
  });

  describe("can-org", () => {
    it("removeMember: should return false when userRole is admin, memberRole is admin and lastAdmin is true ", async () => {
      result = await permissions.can("removeMember", "Org", { memberRole: "admin", userRole: "admin", lastAdmin: true });
      expect(result).to.be.false;

    });
    
    it("removeMember: should return true when userRole is admin, memberRole is admin and lastAdmin is true ", async () => {
      result = await permissions.can("removeMember", "Org", { memberRole: "member", userRole: "admin", lastAdmin: true });
      expect(result).to.be.true;
    });

    it("removeMember: should return true when userRole is admin and lastAdmin is false", async () => {
      result = await permissions.can("removeMember", "Org", { memberRole: "admin", userRole: "admin", lastAdmin: false });
      expect(result).to.be.true;
      result = await permissions.can("removeMember", "Org", { memberRole: "member", userRole: "admin", lastAdmin: false });
      expect(result).to.be.true;
    });

    // userRole member automatically defaults to false before checking memberRole and lastAdmin
    it("removeMember: should return false when userRole is member", async () => {
      result = await permissions.can("removeMember", "Org", { memberRole: "admin", userRole: "member", lastAdmin: false });
      expect(result).to.be.false;
      result = await permissions.can("removeMember", "Org", { memberRole: "member", userRole: "member", lastAdmin: false });
      expect(result).to.be.false;
      result = await permissions.can("removeMember", "Org", { memberRole: "admin", userRole: "member", lastAdmin: true });
      expect(result).to.be.false;
      result = await permissions.can("removeMember", "Org", { memberRole: "member", userRole: "member", lastAdmin: true });
      expect(result).to.be.false;
    });

    it("addMember: should return false when user is member", async () => {
      result = await permissions.can("addMember", "Org", { userRole: "member" });
      expect(result).to.be.false;
    })

    it("addMember: should return true when user is admin", async () => {
      result = await permissions.can("addMember", "Org", { userRole: "admin" });
      expect(result).to.be.true;
    })
  })

  beforeEach(() => {
    permissions = new Permissions(sessionMock, mockUser);
  });

  describe("can-app", () => {

    it("should return true when app exists in users permissions", async () => {
      appName = "8dfe7a96b0b5e4";
      result = await permissions.can("update", "App", { appName: appName });
      expect(result).to.be.true;
      appName = "fb2e09a5c381d6"
      result = await permissions.can("transfer", "App", { appName: appName });
      expect(result).to.be.true;
      appName = "5b83e11ab9ff8e"
      result = await permissions.can("destroy", "App", { appName: appName });
      expect(result).to.be.true;
      appName = "a2dcf60ef9a7c3"
      result = await permissions.can("grant", "App", { appName: appName });
      expect(result).to.be.true;
    });

    it("should return false when app doesn't exist in users permissions", async () => {
      appName = "i3bd0aefud13s6"; // random app name
      result = await permissions.can("update", "App", { appName: appName });
      expect(result).to.be.false;
    });
  });

  describe("validateModelAndAbility", () => {
    it("should throw error when model is not found", async () => {
      appName = "af6abd07ecdcdd";
      try {
        permissions.validate(mockPermissionsResponse, "update", "unknown", { appName: appName });
        expectt.fail("Validation model fail did not pass");
      } catch (error) {
        expect(error.message).to.equal("Model: unknown not found");
      }
    });

    it("should throw error when app ability is not found", async () => {
      try {
        appName = "af6abd07ecdcdd";
        permissions.validateAppAbility(mockPermissionsResponse, "unknown", { appName: appName });
        expectt.fail("Validation app ability fail did not pass");
      } catch (error) {
        expect(error.message).to.equal("Ability: unknown not found in App permissions");
      }
    });

    it("should throw error when org ability is not found", async () => {
      try {
        permissions.validateOrgAbility("unknown", { memberRole: "admin", userRole: "member", lastAdmin: true });
        expectt.fail("Validation org ability fail did not pass");
      } catch (error) {
        expect(error.message).to.equal("Ability: unknown not found in Org permissions");
      }
    });
  });

  describe("validateArgs", () => {
    it("should throw an error if appropriate args are not set for validating org abilities", () => {
      try {
        permissions.validateOrgAbility("removeMember", {memberRole: undefined, userRole: undefined, lastAdmin: undefined});
        expectt.fail("Validation for org args fail did not pass");
      } catch (error) {
        expect(error.message).to.equal("memberRole, userRole, and lastAdmin are required in args");
      }
    })
    it("should throw an error if appropriate args are not set for validating app abilities", () => {
      try {
        permissions.validateAppAbility(mockPermissionsResponse, "update", {appName: undefined});
        expectt.fail("Validation for app args fail did not pass");
      } catch (error) {
        expect(error.message).to.equal("appName is required in args");
      }
    })
  })

  describe("reset", () => {
    it("should set _permissions to null when reset() is called", () => {
      permissions.reset()
      expect(permissions._permissions).to.equal(null);
    })
  })
});
