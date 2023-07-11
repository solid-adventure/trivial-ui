<template>
  <div class="modal-overlay visible" @click="close">
    <div class="modal modal-medium-large">
      <h1 class="modal-title">Keyboard Shortcuts</h1>
      <span @click="close" class="close-icon"></span>
      <div class="registry">
        <table>
          <tr v-for="id in ids">
            <td class="name">{{ registry[id].name }}</td> <td class="id"> {{ id }}</td>
          </tr>
        </table>
      </div>

    </div>
  </div>
</template>

<script>

  import Modal from '../Modal.vue'

  export default {

    mixins: [
      Modal
    ],

    computed: {

      registry() {
        return this.$store.state.keyboardControl.registry
      },

      ids() {
        let obj = this.$store.state.keyboardControl.registry
        return Object.keys(obj).
          filter((id) => obj[id] && obj[id].name != '')//.
          // reduce((c, id) => { return Object.assign(c, { [id]: obj[id] })}, {})
      }

    }

  }
</script>

<style lang="scss" scoped>

  .id, .name {
    color: var(--on-background);
  }

  .name {
    padding-right: 4em;
  }


</style>
