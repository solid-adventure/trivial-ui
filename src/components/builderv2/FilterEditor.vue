<script>
  import SearchFilter from '../../lib/SearchFilter'
  import Icon from '../Icon.vue'

  export default {
    components: {
      Icon
    },

    data() {
      return {
        filters: [],
        searchFilter: new SearchFilter([]),
        selectedColumn: null,
        selectFilterKeys: [],
        selectedKey: null,
        selectedName: null,
        selectedOperator: '=',
        selectedValue: null,
        comperators: ['<', '>', '<=', '>=', '=', '<>', '!='],
        predicates: ['IS NULL','IS NOT NULL','IS TRUE','IS FALSE'],
        isLoadingFilterKeys: false
        // The API also supports 'IS NOT TRUE', 'IS NOT FALSE'
        // Technically these could produce results, but they *feel* redundant, and aren't expected to be necesssary
      }
    },

    async mounted() {
      if (this.$route.query.search) {
        let search = JSON.parse(this.$route.query.search)
        this.filters = search
      }
      this.searchFilter = new SearchFilter(this.filters, this.$store.state.Session, this.$route.params.id, 'payload')
      await this.searchFilter.setPossibleFilters()
    },

    watch: {
      searchParams: function (newVal) {
        this.$router.push({query: {search: JSON.stringify(this.filters)} })
      },

      selectedFilter: async function (newVal) {
        if (Object.keys(newVal).length !== 0){
          this.isLoadingFilterKeys = true
          this.selectFilterKeys = await this.searchFilter.getFilterKeys(newVal)
          setTimeout(() => { this.isLoadingFilterKeys = false }, 1000)
        }
      }

    },

    methods: {
      addFilter() {
         let filter = {
          column: this.selectedFilter.column,
          type: this.selectedFilter.type,
          name: this.selectedName,
          key: this.selectedKey,
          operator: this.selectedOperator,
          value: this.selectedValue
        }
        this.filters.push(filter)
        this.selectedKey = null
        this.selectedName = null
        this.selectedOperator = '='
        this.selectedValue = null
      },

    },

    computed: {

      selectedFilter() {
        return this.searchFilter.possibleFilters.find(f => f.name === this.selectedName) || {}
      },

      selectedFilterRequiresKey() {
        return this.selectFilterKeys.length > 0
      },

      selectedFilterKeySatisfied() {
        if (!this.selectedFilterRequiresKey) return true
        return this.selectedName !== null && this.selectedKey !== null
      },

      displayOperatorInput() {
        return this.selectedName || !this.selectedFilterKeySatisfied
      },

      displayValueInput() {
        if (this.selectedFilterRequiresKey && !this.selectedKey) return false
        if (this.predicates.find(p => p === this.selectedOperator)) return false
        return this.selectedFilter && this.selectedOperator
      },

      operators() {
        return this.comperators.concat(this.predicates)
      },

      searchParams() {
        return this.searchFilter.searchParams
      }

    }
  }

</script>

<template>
  <div class="filters-container page-inset">
    <h2>Filters</h2>

      <!-- Uncomment for easy debugging of queries -->
      <!-- <pre> searchParam </pre> -->
      <!-- <pre> {{ searchParams }}</pre> -->

      <!-- FilterRow -->
      <div class='filter-rows'>

        <div v-if="filters.length === 0">
          <p>No filters</p>
        </div>

        <div class='filter-row' v-for="filter of filters">
          <span>{{ filter.name }} {{ filter.key }} {{ filter.operator }} {{ filter.value }}</span>
          <span>
            <button class='remove' @click.prevent="filters.splice(filters.indexOf(filter), 1)">
              <Icon icon="times-circle"></Icon>
            </button>
          </span>
        </div>
      </div>

      <!-- New Filter Form -->
      <div class="form-row">
        <div class="row-column">
          <p><label for="filter-name">Filters</label></p>
          <select v-model="selectedName" class="filter-row">
            <option v-for="filter of searchFilter.possibleFilters" type="text" id="filter-name" name="filter-name" placeholder="Filter Name">
              {{ filter.name }}
            </option>
          </select>
        </div>


        <div class ="row-column" v-if ="isLoadingFilterKeys">
          <p>Loading keys...</p>
        </div>
        <div v-else>
          <!-- If filter requires key  -->
          <div class="row-column" v-if="selectedFilterRequiresKey">
            <p><label for="filter-key">Key</label></p>
            <select v-model="selectedKey" class="filter-row">
              <option v-for="key of selectFilterKeys" type="text" id="filter-key" name="filter-key" placeholder="Filter Key">
                {{ key }}
              </option>
            </select>
          </div>
        </div>


        <div class="row-column" v-if="displayOperatorInput">
          <p><label for="filter-operator">Match</label></p>
          <select v-model="selectedOperator" class="filter-row">
            <option v-for="operator of operators" type="text" id="filter-operator" name="filter-name" placeholder="Filter Name">
              {{ operator }}
            </option>
          </select>
        </div>

        <!-- If operator requires a value -->
        <div class="row-column" v-if="displayValueInput">
          <p><label for="filter-value">Value</label></p>
          <input type="text" v-model="selectedValue">
        </div>


        <div class="row-column">
          <button @click.prevent="addFilter" class="button-medium">Add Filter</button>
        </div>

      </div>




    </div>
</template>

<style lang="scss" scoped>
  div.page-inset {
    margin: 0;
  }

  .filters-container {

    button.remove {
      background: none;
      border: none;
      color: var(--on-surface);
      cursor: pointer;
    }


    .hidden {
      display: none;
    }

    .form-row {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }

    .row-column {
      margin-right: 1em;
    }

    div.filter-row {
      border: 1px solid #ccc;
      padding: 1em;
    }


  }

</style>