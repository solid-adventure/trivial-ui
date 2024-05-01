<script>
import { schema, arrayOf } from "trivial-core/lib/schema-utils";
import BuilderAssistant from "./BuilderAssistant.vue";
import ManifestMigrator from "trivial-core/lib/ManifestMigrator";
import ActionDescriptors from "trivial-core/lib/actionsv2/catalog/ActionDescriptors";
import ActionCatalog from "trivial-core/lib/actionsv2/catalog/ActionCatalog";
import ActionIterator from "trivial-core/lib/actionsv2/catalog/ActionIterator";
import ChangeSequence from "./help/ChangeSequence.vue";
import ConfigResolver from "trivial-core/lib/ConfigResolver";
import NavTree from "./NavTree.vue";
import Notifications from "../notifications";
import CustomFunctionList from "../CustomFunctionList.vue";
import BuildButton from "../controls/BuildButton.vue";
import Notices from "../Notices.vue";
import Editor from "./Editor.vue";
import AppTrigger from "./AppTrigger.vue";
import PayloadEditor from "./PayloadEditor.vue";
import ProgramBreadcrumb from './ProgramBreadcrumb.vue'
import Confirmation from "./Confirmation.vue";
import CredentialsVault from "./CredentialsVault.vue";
import { mapActions, mapMutations, mapState } from "vuex";

export default {
  components: {
    BuilderAssistant,
    AppTrigger,
    BuildButton,
    ChangeSequence,
    CredentialsVault,
    CustomFunctionList,
    Editor,
    NavTree,
    Notices,
    PayloadEditor,
    ProgramBreadcrumb,
    Confirmation,
  },

  data() {
    return {
      actionId: null,
      functions: [],
      webhookListener: (event) => this.receivedWebhook(event),
      editingPayload: false,
      confirm: { inProgress: false, message: "", onConfirm: () => {} },
      displayVault: false,
      buildDirty: false,
      buildInProgress: false,
      displayChangeSequence: false,
      loaded: false,
    };
  },

  mounted() {
    // Make the val globally accessible so it can be triggered in an afterAdd
    window.displayChangeSequence = () => {
      this.displayChangeSequence = true;
    };
  },

  async created() {
    await this.loadCredentialsOrDraft();
    const manifest = await this.loadManifestOrDraft();
    const migrator = new ManifestMigrator(manifest.content);
    migrator.migrateV1(this.app.descriptive_name);
    migrator.normalize();
    this.manifest = migrator.content;
    this.action = this.program;
    this.functions = this.manifest.definitions.filter(
      (d) => d.type === "function"
    );
    this.notifyManifestLoaded();

    if (this.$store.state.currentAction) {
      this.navigateToIdentifier(this.$store.state.currentAction);
    } else if (this.$store.state.currentCredentialSet) {
      this.displayVault = true;
    }

    await this.loadCredentialSets();
    this.loaded = true;
  },

  watch: {
    functions: {
      handler(newVal) {
        if (this.containsFunctionChanges(newVal)) {
          this.setManifestDefinitions(this.definitions);
        }
      },
      deep: true,
    },
    async app(newApp) {
      if (newApp) {
        window.document.title = `Edit: ${newApp.descriptive_name}`;
      }
    },
  },

  computed: {
    manifest: {
      get() {
        return this.$store.state.manifest.content;
      },
      set(value) {
        this.setManifestContent(value);
      },
    },

    program() {
      return (
        this.manifest.program ||
        ActionDescriptors.actionDefinitionOfType("ReceiveWebhook", 1)
      );
    },

    customPayload() {
      return this.$store.state.customPayload;
    },

    action: {
      get() {
        if (!this.program) {
          return;
        }
        const iter = new ActionIterator(this.program);
        return iter.find((a) => a.identifier === this.actionId) || this.program;
      },
      set(value) {
        this.actionId = value.identifier;
      },
    },

    selectedAction() {
      return this.displayVault ? undefined : this.action;
    },

    descriptor() {
      return ActionDescriptors.forType(this.action.type);
    },

    definitions() {
      return this.functions.map((f) => Object.assign({ type: "function" }, f));
    },

    nextIdentifier() {
      return parseInt(new ActionIterator(this.program).maxIdentifier()) + 1;
    },

    configResolver() {
      return new ConfigResolver(this.credentials);
    },

    configForAction() {
      return this.configResolver.resolve(this.action.config);
    },

    leftNavWidth() {
      return this.playgroundMode ? "6em" : "24em";
    },

    ...mapState(["app", "credentials", "playgroundMode"]),
  },

  methods: {
    edit(action) {
      this.action = action;
    },

    navigateTo(action) {
      const iter = new ActionIterator(this.program);
      iter.find((def, idx, parents) => {
        if (def === action) {
          this.action = def;
          if (this.$refs.actionbody) {
            this.$refs.actionbody.scrollIntoView(true);
          }
          this.displayVault = false;
          return true;
        } else {
          return false;
        }
      });
    },

    navigateToIdentifier(id) {
      const def = this.closestVisibleForIdentifier(id);
      if (def) this.navigateTo(def);
    },

    closestVisibleForIdentifier(id) {
      let parents = null;
      const iter = new ActionIterator(this.program);
      const def = iter.find((def, idx, defParents) => {
        if (def.identifier === id) {
          parents = defParents.slice();
          return true;
        }
        return false;
      });
      return def ? this.lastVisibleNode(parents.concat(def)) : def;
    },

    lastVisibleNode(nodes) {
      for (let i = 0, descr = null; i < nodes.length; ++i) {
        descr = ActionDescriptors.forType(nodes[i].type);
        if (!descr.contentsUserVisible) return nodes[i];
      }
      return nodes[nodes.length - 1];
    },

    receivedWebhook(event) {
      Notifications.info("New activity data available", {
        actions: {
          View: () => this.$router.push({path: `/apps/${this.app.name}/activity`}),
        },
      });
    },

    containsFunctionChanges(newVal) {
      return (
        newVal.length !== this.manifest.definitions.length ||
        undefined !==
          newVal.find((newDef) => {
            const existing = this.manifest.definitions.find((def) => {
              return def.type === "function" && def.name == newDef.name;
            });
            return (
              !existing ||
              newDef.definition !== existing.definition ||
              newDef.testInput !== existing.testInput ||
              newDef.notes !== existing.notes
            );
          })
      );
    },

    showVault() {
      this.displayVault = true;
    },

    ...mapActions([
      "loadCredentialSets",
      "loadCredentialsOrDraft",
      "loadManifestOrDraft",
      "notifyManifestLoaded",
    ]),

    ...mapMutations(["setManifestContent", "setManifestDefinitions"]),
  },
};
</script>

<template>
  <!--<div class="builder" :style="{ paddingLeft: this.leftNavWidth }">-->
  <div class="builder">
    <div v-if="!playgroundMode" class="action-bar">
      <div class="action-holder">
        <div class="trigger-section">
          <AppTrigger
            :customPayload="customPayload"
            :buildDirty="buildDirty"
            :buildInProgress="buildInProgress"
            @edit:payload="editingPayload = true"
            @confirm:run="
              confirm.message = $event.message;
              confirm.onConfirm = $event.onConfirm;
              confirm.inProgress = true;
            "
          ></AppTrigger>
        </div>
        <BuildButton
          class="build"
          @update:dirty="buildDirty = $event"
          @update:buildInProgress="buildInProgress = $event"
        ></BuildButton>
      </div>
      <div class="notice-holder">
        <Notices :pinned="false" class="right"></Notices>
      </div>
    </div>
    <ProgramBreadcrumb
      v-if="program"
      :value="program"
      :selected="selectedAction"
      @navigate="navigateTo"
    ></ProgramBreadcrumb>
    <NavTree
      :selectedTitle="'builder'"
      :program="program"
      :selectedAction="selectedAction"
      @programNavigate="navigateTo"
    ></NavTree>
    <ChangeSequence
      v-if="displayChangeSequence"
      @close="displayChangeSequence = false"
    />
    <BuilderAssistant
      v-if="loaded"
      :app="app"
      :actions="program.definition.actions"
      :nextIdentifier="nextIdentifier"
    />
    <div v-if="!displayVault" class="action-function">
      <div v-if="loaded" class="action-body" ref="actionbody">
        <Editor
          :value="action"
          :credentials="credentials"
          :nextIdentifier="nextIdentifier"
          :editor="descriptor.editorComponent"
          :class="{ disabled: !action.enabled }"
          @edit="edit"
        ></Editor>
      </div>
      <div v-else class= "action-body">
        <p>Loading...</p>
      </div>
      <CustomFunctionList :value="functions"></CustomFunctionList>
    </div>
    <CredentialsVault v-if="displayVault"></CredentialsVault>
    <PayloadEditor
      v-if="editingPayload"
      :payload="customPayload"
      @close="editingPayload = false"
    ></PayloadEditor>
    <Confirmation
      v-if="confirm.inProgress"
      :message="confirm.message"
      :onConfirm="confirm.onConfirm"
      @close="confirm.inProgress = false"
    ></Confirmation>
  </div>
</template>

<style lang="scss" scoped>
.builder {
  /*padding-top: calc(80px + 3.625em + 1px + 1em);
  padding-right: 1em;
  padding-bottom: 1em;
  // padding-left: set inline
  */

  display: flex;
  flex-wrap: wrap;

  input {
    font-family: inherit;
  }

  .action-bar {
    /*position: fixed;
    top: 120px;
    left: 23em;
    box-sizing: border-box;
    height: 3.625em;
    width: calc(100% - 23em);
    padding: 0.5em 2em;
    border-bottom: 1px solid var(--on-background-20);
    background-color: var(--background);
    z-index: 50;
    display: flex;
    flex-direction: column;*/

    position: sticky;
    top: 120px;
    width: 100%;
    padding-block: 1rem;
    border-bottom: 1px solid var(--on-background-20);
    z-index: 50;

    .action-holder {
      /*width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;*/

      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      z-index: 100;
    }

    .notice-holder {
      width: 100%;
      position: relative;
    }

    .build {
      margin: 0;
    }

    .trigger-section {
      display: flex;
      align-items: center;
    }
  }

  .action-function {
    width: calc(100% - 250px);
  }
  .action-body, .function-body {
    /*padding: 1em;
    margin: 1em 0;
    background: transparent;*/
    padding: 1rem;
  }

  .disabled {
    opacity: 0.4;
  }

  h2 button {
    background: transparent;
    font-size: 0.75em;
  }
}
</style>
