<template>
  <div class="overview">
    <super-bar></super-bar>
    <div class="overview-container">
      <div class="title-row">
        <div class="search-container">
          <SearchField v-if="!hasNoApps" :searchTerm="searchTerm" v-on:update="searchTerm=$event"></SearchField>
        </div>
      </div>
<!--       <div class="tabs-container">
        <div v-for="group of panelTypeGroups" class="tab" :class="{active: group.filter == panelTypeFilter }">
          <a href="#" v-on:click.prevent="panelTypeFilter=group.filter" >{{group.name}}</a>
        </div>
      </div>
 -->
      <table class="stats">
        <thead class="active">
          <SortableHead
          class="app-name"
          name="name"
          v-bind="{sortBy, sortAsc}"
          @sort="setSort">App Name</SortableHead>
          <SortableHead
          class="panel-type"
          name="panelType"
          v-bind="{sortBy, sortAsc}"
          @sort="setSort">Panel Type</SortableHead>
          <SortableHead
          class="last-run"
          name="lastRun"
          v-bind="{sortBy, sortAsc}"
          @sort="setSort">Last Run</SortableHead>
          <th class="edit"></th>
          <SortableHead
          class="status"
          name="activity"
          v-bind="{sortBy, sortAsc}"
          @sort="setSort">Status</SortableHead>
          <th class="period">
            <button
              :class="{selected: 'hourly' === chartType}"
              @click.prevent="setChartType('hourly')">HR</button>
            <span>/</span>
            <button
              :class="{selected: 'daily' === chartType}"
              @click.prevent="setChartType('daily')">D</button>
            <span>/</span>
            <button
              :class="{selected: 'weekly' === chartType}"
              @click.prevent="setChartType('weekly')">W</button>
          </th>
        </thead>
        <tbody>
          <tr v-for="app in sortedApps" :key="app.id">
            <td><a :href="`/apps/${app.name}/`">{{app.descriptive_name}}</a></td>
            <td><a :href="`/apps/${app.name}/`">{{panelType(app)}}</a></td>
            <td>{{lastRun(app)}}</td>
            <td><a :href="editLink(app)">Edit</a></td>
            <!-- <td><a :href="`/apps/${app.name}/builder2`">Edit</a></td> -->
            <td colspan="2">
              <a :href="`/apps/${app.name}/activity`">
                <StatusLine
                  :start-range="startRange"
                  :end-range="endRange"
                  :stats="statsFor(app)"
                  :interval="chartInterval">
                </StatusLine>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="hasNoApps" class="no-apps">
        <em>You do not have any apps. Click <strong>New</strong> to create a new app.</em>
      </p>

      <p v-if="hasNoSearchResults" class="no-apps">
        <em>No results</em>
      </p>


      <div><a class="button-medium headroom-small" :href="`/apps/new?paneltype=${this.panelTypeFilter}`">New</a></div>


    </div>
  </div>
</template>

<style lang="scss" scoped>
  .overview {
    position: absolute;
    width: 100%;
    top: 80px; /* clear the SuperBar*/
    padding: 0;
    margin: 0;
    height: calc(100% - 80px);
    z-index: 10;
  }

  .overview-container {
    padding: 1em 3em 3em 3em;
    overflow: auto;
  }

  .search-container {
    margin-top: 3em;
    margin-bottom: 2em;
  }

  h1 {
    font-size: 3em;
    font-weight: 100;
    margin: 1em 0 .5em 0;
  }

  .title-row {
    display: flex;
    justify-content: space-between;
  }

  .tabs-container {
    display: flex;
    margin-top: 1em;
    margin-left: 2em;

    .tab {
      padding: 0.6em 1em;
      margin-left: 0.2em;
      margin-right: 0.2em;
      border-top: 1px solid;
      border-left: 1px solid;
      border-right: 1px solid;
      border-color: var(--background-80);
      background-color: var(--surface);
      color: var(--on-surface);
    }

  }

 .tab.active, .active{
    background-color: var(--table-column-head-color);
    color: var(--on-background);
    border-bottom: 0;
    border-color: var(--accent);
  }

  table.stats {
    width: 100%;
    border-collapse: collapse;
    border: none;

    thead {
      font-weight: bold;
      text-transform: uppercase;
      border-bottom: 1px solid var(--table-head-border);

      th {
        &.app-name { width: 20%; }
        &.panel-type { width: 20%; }
        &.last-run { width: 15%; }
        &.edit { width: 10%; }
        &.status { width: 20%; }
        &.period { width: 15%; }

        span {
          font-weight: 100;
        }

        button {
          background: transparent;
          color: inherit;
          display: inline;
          cursor: pointer;
          margin-bottom: -.5em;
          padding-bottom: .5em;

          &.selected {
            margin-bottom: calc(-.5em - 2px);
            border-bottom: 3px solid var(--on-background);
          }
        }
      }
    }

    tbody {
      tr {
        cursor: pointer;

        &:nth-child(even) {
          background-color: var(--table-striping);
        }

        &:hover {
          background-color: var(--table-row-hover-background);
          color: var(--on-table-row-hover-background);
        }

        td {
          border: none;
          padding: .5em;
          font-weight: 100;

          a {
            color: inherit;
          }
        }
      }
    }
  }

  .no-apps {
    text-align: center;
    margin-top: 8em;
  }
</style>

<script>
  import { mapState } from 'vuex'
  import { fetchJSON } from 'trivial-core/lib/component-utils'
  import SearchField from './controls/SearchField.vue'
  import StatusLine from './StatusLine.vue'
  import SortableHead from './controls/SortableHead.vue'



  export default {
    components: {
      SearchField,
      StatusLine,
      SortableHead
    },

    data() {
      return {
        stats: [],
        startRange: '',
        endRange: '',
        sortBy: 'name',
        sortAsc: true,
        chartType: 'hourly',
        searchTerm: '',
        panelTypeFilter: null
        // panelTypeGroups: [
        //   {name: 'Dashboards', filter: 'Dashboard'},
        //   // {name: 'Workbooks', filter: 'Workbook'},
        //   {name: 'Data Connectors', filter: 'Unset'}
        // ]
      }
    },

    created() {
      let params =  new URLSearchParams(window.location.search)
      this.panelTypeFilter = params.get('paneltype') || 'dashboard'

      this.loadStats(this.chartType)
    },

    computed: {

      filteredApps() {
        const term = this.searchTerm.toUpperCase()
        let apps = this.apps.filter(app => {
          return (
            (! term) ||
            (String(app.descriptive_name).toUpperCase().indexOf(term) !== -1)
          )
        })

        if (!['any', 'all'].includes(this.panelTypeFilter)) {
          apps = apps
            .filter(app => app.panels)
            .filter(app => app.panels.component.toLowerCase() == this.panelTypeFilter.toLowerCase())
        }
        return apps

      },

      sortedApps() {
        const sorts = {
          name: (app) => app.descriptive_name,
          panelType: (app) => (app.panels || {}).component || 'Unset',
          lastRun: (app) => (this.appInfo(app) || {}).last_run,
          status: (app) => ((this.appInfo(app) || {}).stats || []).reduce((s,info) => s + info.failures, 0)
        }
        const sortField = sorts[this.sortBy]

        return [...this.filteredApps].sort((a,b) => {
          const cmp = String(sortField(a)).localeCompare(sortField(b))
          return this.sortAsc ? cmp : -1 * cmp;
        })
      },

      chartInterval() {
        if ('hourly' === this.chartType) {
          return 'minute'
        } else if ('daily' === this.chartType) {
          return 'hour'
        } else if ('weekly' === this.chartType) {
          return 'day'
        }
      },

      hasNoApps() {
        return this.appsLoaded && this.apps.length === 0
      },

      hasNoSearchResults() {
        return this.appsLoaded && this.sortedApps.length === 0
      },


      ...mapState([
        'apps',
        'appsLoaded'
      ])

    },

    methods: {

      editLink(app) {
        if (app.panels && app.panels.component == 'Dashboard') {
          return `/apps/${app.name}?mode=edit`
        } else {
          return `/apps/${app.name}/builder2`
        }
      },

      async loadStats(type) {
        if ('hourly' === type) {
          await this.loadHourlyStats()
        } else if ('daily' === type) {
          await this.loadDailyStats()
        } else if ('weekly' === type) {
          await this.loadWeeklyStats()
        }
      },

      async loadHourlyStats() {
        this.setStats(await fetchJSON('/proxy/trivial?path=/apps/stats/hourly'))
      },

      async loadDailyStats() {
        this.setStats(await fetchJSON('/proxy/trivial?path=/apps/stats/daily'))
      },

      async loadWeeklyStats() {
        this.setStats(await fetchJSON('/proxy/trivial?path=/apps/stats/weekly'))
      },

      setStats(data) {
        this.stats = data.stats
        this.startRange = data.start_range
        this.endRange = data.end_range
      },

      appInfo(app) {
        return this.stats.find(s => s.id === app.id)
      },

      panelType(app) {
        return (app.panels || {}).component || 'Unset'
      },

      lastRun(app) {
        return this.dateFormat((this.appInfo(app) || {}).last_run)
      },

      statsFor(app) {
        return ((this.appInfo(app) || {}).stats || [])
      },

      dateFormat(str) {
        if (str) {
          return new Date(str).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})
        } else {
          return ''
        }
      },

      setSort(opts) {
        this.sortBy = opts.sortBy
        this.sortAsc = opts.sortAsc
      },

      async setChartType(type) {
        this.stats = []
        await this.loadStats(type)
        this.chartType = type
      }
    }
  }
</script>
