<template>
    <Sidebar v-model:visible="visible" header="Audit Logs" position="right" @hide="closeSidebar" :pt="sidebarPt" class="w-30rem border-round-left-xl">
        <template #header>
            <div class="flex flex-column justify-content-start align-items-start">
                <div class="text-xs font-medium text-500 uppercase">Sales</div>
                <div class="flex align-items-center gap-1">
                    <h2 class="m-0">Audit Logs</h2>
                    <RouterLink to="/auditlogs">
                        <Button label="View All" text icon="pi pi-external-link" iconPos="right" class="text-base text-blue-400" />
                    </RouterLink>
                </div>
            </div>
        </template>

        <h3 class="font-semibold mb-5">Activites</h3>

        <Timeline :value="events" class="w-full">
            <template #content="slotProps">
                <div class="flex align-items-center">
                    <Avatar :label="slotProps.item.label" class="mr-2" shape="circle" :style="`background-color: ${slotProps.item.bgColor}; color: #333`" />
                    <div class="flex flex-column justify-content-start align-items-start">
                        <div class="w-23rem text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis">
                            <span class="font-medium">{{ slotProps.item.user }}</span> {{ slotProps.item.description }}
                        </div>
                        <div class="mt-1 text-xs text-600">{{ slotProps.item.timestamp }}</div>
                    </div>
                </div>
            </template>
        </Timeline>
    </Sidebar>
</template>

<script setup>
    import { ref, watch } from "vue"

    const props = defineProps(['visible'])
    const emit = defineEmits(['closeAuditLogsSidebar'])

    const visible = ref(false),
        sidebarPt = ref({
            header: {
                class: 'border-bottom-1 border-200'
            }
        }),
        events = ref(
            [
              {
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
              }
            ])

    watch(props, newVal => visible.value = newVal.visible)

    const closeSidebar = () => {
        visible.value = false
        emit('closeAuditLogsSidebar')
    }
</script>