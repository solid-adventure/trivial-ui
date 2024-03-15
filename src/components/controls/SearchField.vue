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

<!-- Deliberately unscoped to allow icon overriddes -->
<style lang="scss" >

	.search-box {
	    width: 30em;
	    height: 4em;
	    border-radius: 1em;
	    background-color: var(--background-high-contrast);
	    color: var(--on-background);
	    position: relative;

	    input {
	      position: absolute;
	      top: 0;
	      left: 0;
	      width: 30em;
	      height: 4em;
	      box-sizing: border-box;
	      padding: 1em;
	      font-size: 1em;
	      font-family: inherit;
	      font-weight: inherit;
	      color: inherit;
	      border: 1px solid var(--background-80);
	      border-radius: 1em;

	      &::placeholder {
	        color: inherit;
	      }
	    }

	    .icon {
	      height: 2em;
	      width: auto;
	      position: absolute;
				top: 1em;
		    right: 1em;
		    color: var(--background-80);
	    }

	    .icon-wrapper svg {
		    	width: unset;
		    	height: 100%;
	    }


}





</style>