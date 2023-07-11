<script>
  import Icon from '../Icon.vue'

	export default {

		props: {
			searchTerm: {
				type: String,
				required: true
			}
		},

		components: {
			Icon
		}
	}
</script>

<template>
  <div class="search-box">
    <input
    	type="text"
    	placeholder="Filter / Search"
		  @input='$emit("update", $event.target.value)'
    	/>
    <Icon icon="search" class="icon"></Icon>
  </div>
</template>

<style lang="scss" scoped>
  @import "../../assets/stylesheets/includes/variables";

	.search-box {
	    width: 12em;
	    height: 2em;
	    border-radius: 1em;
	    background-color: var(--background-high-contrast);
	    color: var(--on-background);
	    position: relative;

	    input {
	      position: absolute;
	      top: 0;
	      left: 0;
	      width: 100%;
	      height: 2em;
	      box-sizing: border-box;
	      padding: .5em;
	      font-size: 1em;
	      font-family: inherit;
	      font-weight: inherit;
	      color: inherit;
	      border: 1px solid;
	      border-radius: 1em;

	      &::placeholder {
	        color: inherit;
	      }
	    }

	    .icon {
	      height: 1em;
	      width: auto;
	      position: absolute;
	      top: .5em;
	      right: .5em;
	    }
	  }


</style>