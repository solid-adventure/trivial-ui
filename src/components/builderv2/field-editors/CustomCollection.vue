<script>
  import { allFieldsWithDefaults } from 'trivial-core/lib/schema-utils'
  import CustomField from './CustomField.vue'

  export default {
    components: {
      CustomField
    },

    props: {
      name: String,
      field: Object,
      config: Object,
      credentials: Object,
      context: Object
    },

    computed: {
      memberType() {
        return this.field.type.member_type
      },

      visibleFields() {
        return Object.fromEntries(
          [...Object.entries(this.memberType.fields)].filter(f => ! f[1].hidden)
        )
      },

      entries() {
        return this.config[this.name] || []
      }
    },

    methods: {
      humanize(value) {
        return String(value).replaceAll('_', ' ')
      },

      addEntry() {
        this.config[this.name].push(allFieldsWithDefaults(this.memberType))
      },

      removeEntry(entry) {
        const idx = this.config[this.name].indexOf(entry)
        if (idx !== -1) {
          this.config[this.name].splice(idx, 1)
        }
      }
    }
  }
</script>

<template>
  <div>
    <h3>{{humanize(name)}}</h3>
    <div v-for="entry in entries" class="entry">
      <div class="field-group">
        <CustomField
          v-for="(field, fieldName) in visibleFields"
          :key="fieldName"
          :name="fieldName"
          :field="field"
          :config="entry"
          :credentials="credentials"></CustomField>
        </div>
        <div class="entry-actions">
          <button class="button-small" @click="removeEntry(entry)">- Remove</button>
        </div>
    </div>
    <button class="button-small" @click="addEntry">+ Add {{humanize(name)}}</button>
  </div>
</template>

<style lang="scss" scoped>
  h3 {
    text-transform: capitalize;
  }

  .entry {
    display: flex;

    .field-group {
      flex-grow: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: .25em;
      row-gap: .25em;
    }

    .entry-actions {
      margin-left: .25em;
      padding-top: 2.25em;
    }
  }
</style>
