<script>

  export default {

    mounted() {
      this.$store.state.keyboardControl.register('Escape', "", this.close.bind(this))
      this.$store.state.keyboardControl.register('command-.', "Close Modal", this.close.bind(this))
    },

    methods: {

      close() {
        this.$emit('close')
      }


    }
  }
</script>