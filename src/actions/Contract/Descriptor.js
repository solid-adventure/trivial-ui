const ActionDescriptorBase = require('../../base/ActionDescriptorBase')

export default class Contract extends ActionDescriptorBase {
  // get iconUrl() {
  //   return '/assets/images/action-icons/webhook-relay.svg'
  // }

  // get fullDescriptionHTML() {
  //   let h = `
    
  //   <h2>Contract</h2>
  //   <p>Create a list of fees to charge and map them to events.</p>
  //   `;
  //   return h;
  // }

  get actionSlots() {
    return ['actions']
  }

  get actionSlotDisplayName() {
    return "Rules"
  }

  get embedTransform() {
    return false
  }

  get editorComponent() {
    return 'Contract'
  }

  static get isUserSearchable() {
    return false
  }

}
