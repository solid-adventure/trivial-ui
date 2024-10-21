<template>
    <Sidebar v-model:visible="visible" header="Audit Logs" position="right" @hide="closeSidebar" :pt="sidebarPt" class="audits__logs__sidebar border-round-left-xl">
        <template #header>
            <div v-if="!selectedUser" class="flex flex-column justify-content-start align-items-start">
                <div class="text-xs font-medium text-500 uppercase">Sales</div>
                <div class="flex align-items-center gap-1">
                    <h2 class="m-0">Audit Logs</h2>
                    <RouterLink to="/auditlogs">
                        <Button label="View All" text icon="pi pi-external-link" iconPos="right" class="text-base text-blue-400" />
                    </RouterLink>
                </div>
            </div>
            <div v-else class="flex flex-column justify-content-start align-items-start">
                <div class="flex align-items-center gap-1">
                    <Button @click="selectUser()" text icon="pi pi-arrow-left" iconPos="left" class="text-base text-gray-900" />
                    <h2 class="m-0">{{ userName }}</h2>
                </div>
            </div>
        </template>

        <h3 class="font-semibold mb-5">Activites</h3>

        <Timeline :value="events" class="w-full">
            <template #content="slotProps">
                <div v-if="!selectedUser" class="flex align-items-center">
                    <Button label="Primary" text class="p-0" @click="selectUser(slotProps.item.user)">
                        <Avatar :label="slotProps.item.label" class="mr-2" shape="circle" :style="`background-color: ${slotProps.item.bgColor}; color: #333`" />
                    </Button>
                    <div class="flex flex-column justify-content-start align-items-start">
                        <div class="max-w-20rem text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                            <span class="font-medium">{{ slotProps.item.user }}</span> {{ slotProps.item.action }} {{ slotProps.item.description }}
                        </div>
                        <div class="mt-1 text-xs text-600">
                            {{ useFormatDate(slotProps.item.timestamp, dateOptions) }} at {{ useFormatDate(slotProps.item.timestamp, timeOptions) }}
                        </div>
                    </div>
                </div>
                <div v-else class="flex align-items-center">
                    <Avatar :label="slotProps.item.label" class="mr-2" shape="circle" :style="`background-color: ${slotProps.item.bgColor}; color: #333`" />
                    <div class="flex flex-column justify-content-start align-items-start">
                        <div class="max-w-20rem text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                            <span class="capitalize font-medium">{{ slotProps.item.action }}</span> {{ slotProps.item.description }}
                        </div>
                        <div class="mt-1 text-xs text-600">
                            {{ useFormatDate(slotProps.item.timestamp, dateOptions) }} at {{ useFormatDate(slotProps.item.timestamp, timeOptions) }}
                        </div>
                    </div>
                </div>
            </template>
        </Timeline>
    </Sidebar>
</template>

<script setup>
    import { ref, watch, computed, onMounted } from "vue"
    import { useStore } from 'vuex'
    import { useFormatDate } from '@/composable/formatDate.js'
    import { useDateTimeZoneOptions } from '@/composable/dateTimeZoneOptions.js'

    const props = defineProps(['visible'])
    const emit = defineEmits(['closeAuditLogsSidebar'])

    const visible = ref(false),
        loading = ref(false),
        store = useStore(),
        sidebarPt = ref({
            header: {
                class: 'border-bottom-1 border-200'
            }
        }),
        {dateOptions, timeOptions, timeZoneOptions} = useDateTimeZoneOptions(),
        selectedUser = ref(false),
        userName = ref(''),
        events = ref([
          /*{
            user: "Charles Brown",
            action: "Edit",
            description: "Renamed column GL Code to Income Account",
            timestamp: "07/01/2024 12:11 AM PST",
            bgColor: "#bbce82",
            label: "CB",
            actionIcon: "pi-pencil"
          },
          {
            user: "Charles Brown",
            action: "Create",
            description: "Added column GL Code",
            timestamp: "07/01/2024 10:10 AM PST",
            bgColor: "#bbce82",
            label: "CB",
            actionIcon: "pi-plus"
          },
          {
            user: "Charles Brown",
            action: "Create",
            description: "Created Register Sales",
            timestamp: "07/01/2024 09:00 AM PST",
            bgColor: "#bbce82",
            label: "CB",
            actionIcon: "pi-plus"
          },
          {
            user: "Kurt Preston",
            action: "Create",
            description: "Added column Location ID",
            timestamp: "07/01/2024 08:56 AM PST",
            bgColor: "#a3cdf2",
            label: "KP",
            actionIcon: "pi-plus"
          },
          {
            user: "Chris Thorpe",
            action: "Create",
            description: "Added column Customer Type",
            timestamp: "06/30/2024 04:11 PM PST",
            bgColor: "#e594d7",
            label: "CT",
            actionIcon: "pi-plus"
          },
          {
            user: "Edwin Brown",
            action: "Delete",
            description: "Deleted column Location",
            timestamp: "06/30/2024 02:11 PM PST",
            bgColor: "#9892a5",
            label: "EB",
            actionIcon: "pi-times"
          }*/
        ])

    let copyEvents = []

    watch(props, newVal => visible.value = newVal.visible)

    const orgId = computed(() => store.getters.getOrgId)

    onMounted(async () => await auditsInit())


    const auditsInit = async () => {
        loading.value = true

        let apps = []

        apps = await getApps()

        apps = filteredOrgApps(apps) 

        let auditPromises = apps.map(item => getAuditsLogs(item.id)),
            allAudits = await Promise.all(auditPromises)

        console.log('allAudits - ', allAudits)
        let auditLogs = []

        allAudits.forEach(item => {
            item?.audits.forEach(audit => {
                let dataObj = {}

                dataObj.user = audit?.user_id
                dataObj.action = audit?.action
                dataObj.description = audit?.audited_changes || 'No description'
                dataObj.timestamp = audit?.created_at

                auditLogs.push(dataObj)
            })
        })

        events.value = formatAuditLogs(auditLogs)
        copyEvents = [...events.value]

        loading.value = false
    }

    const getApps = async () => {
        try {
            return await store.state.Session.apiCall('/apps')
        } catch (err) {
            console.log(err)
        }
    }

    const filteredOrgApps = apps => apps.filter(item => item.owner_id === orgId.value && item.owner_type === 'Organization')

    const getAuditsLogs = async appId => {
        try {
            return await store.state.Session.apiCall(`/apps/${appId}/audits`)
        } catch (err) {
            console.log(err)
        }
    }

    const getNameInitials = name => name.toString().match(/(\b\S)?/g).join("").toUpperCase()

    const getActionIcon = action => {
        switch(action) {
            case 'update':
                return 'pi-pencil'
            break;
            case 'create':
                return 'pi-plus'
            break;
            case 'delete':
                return 'pi-times'
            break;
            default:
                return ''
        }
    }

    const generatePastelColor = () => {
        const r = Math.floor((Math.random() * 127) + 127), // values between 127 and 255
            g = Math.floor((Math.random() * 127) + 127),
            b = Math.floor((Math.random() * 127) + 127)

        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` // Convert to hex
    }

    const formatAuditLogs = auditLogs => {
        const userColors = {}

        auditLogs.forEach(log => {
            if (!userColors[log.user]) {
                userColors[log.user] = generatePastelColor();
            }

            log.bgColor = userColors[log.user] // Add the color to the log
            log.label = getNameInitials(log.user)
            log.actionIcon = getActionIcon(log.action)
        })

        return auditLogs
    }

    const closeSidebar = () => {
        visible.value = false
        emit('closeAuditLogsSidebar')
    }

    const selectUser = (name = '') => {
        userName.value = name

        if (name === '') {
            events.value = copyEvents
        } else {
            events.value = events.value.filter(item => item.user == name)
        }
        
        selectedUser.value = !selectedUser.value
    }
</script>