<template>
	<div class="build-event-marker">
		<hr class="divider" />
		<span class="message">{{ resultMessage }}</span>
		<hr class="divider" />
	</div>
</template>

<script>

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'


	  export default {
	  	props: {
	  		event: Object,
	  		required: true
	  	},

	  	computed: {

	  		relativeBuildTime() {
					TimeAgo.addDefaultLocale(en)
					const timeAgo = new TimeAgo('en-US')
					return timeAgo.format(new Date(this.event.created_at))
	  		},

	  		resultMessage() {
		      if (!this.event.status) { return 'Build Failed, no changes' }
		      if (this.event.status >= 200 && this.event.status < 400) { return `Deployed ${this.relativeBuildTime}` }
		      if (this.event.status >= 400) { return 'Build Failed, no changes' }
	  		}
	  	},

	  	methods: {

	  	}
	  }
</script>

<style lang="scss" scoped>
	.build-event-marker {

		display: flex;
		justify-content: space-between;

		span.message {
	    text-align: center;
	    flex: none;
	    margin: 0 1em;
			font-family: 'Lato';
			color: var(--primary);

  	}

		hr.divider {
			border: 1px solid var(--primary);
			width: 100%;
			height: 0;
		}

	}	
</style>