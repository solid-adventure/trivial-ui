<template>
    <Sidebar v-model:visible="visible" header="Actuals - Audit Log" position="right" @hide="closeSidebar" :pt="sidebarPt" class="w-30rem border-round-left-xl">
        <h3 class="font-medium mb-5">Activites</h3>

        <Timeline :value="events" class="w-16rem">
            <template #content="slotProps">
                {{ slotProps.item.status }}
            </template>
        </Timeline>
    </Sidebar>
</template>

<script setup>
    import { ref, watch } from "vue";

    const props = defineProps(['visible'])
    const emit = defineEmits(['closeAuditLogsSidebar'])

    const visible = ref(false),
        sidebarPt = ref({
            header: {
                class: 'border-bottom-1 border-200'
            }
        }),
        events = ref([
            { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0'},
            { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
            { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
            { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
        ])

    watch(props, newVal => visible.value = newVal.visible)

    const closeSidebar = () => {
        visible.value = false
        emit('closeAuditLogsSidebar')
    }
</script>