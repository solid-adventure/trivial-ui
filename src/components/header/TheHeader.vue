<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<div class="main__header__top__content">
				<Dropdown v-model="selectedOrg" :options="organisations" optionLabel="name" placeholder="Select Organization" class="main__header__top__content__dropdown" :change="handleSelected()" />
				
				<Button type="button" icon="pi pi-user" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" aria-label="User" class="main__header__top__content__user-btn" />

				<ToggleButton v-model="checkedTheme" @click="toggleTheme()" v-ripple onLabel="" offLabel="" onIcon="pi pi-sun" offIcon="pi pi-moon" class="w-2.5rem main__header__top__content__theme-btn" aria-label="Do you confirm" />
				
				<div class="card flex justify-content-center">
			        <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" class="w-full md:w-15rem">
			            <template #start>
			                <span class="inline-flex align-items-center gap-1 px-2 py-2">
								<Image :src="LogoImgArrows" transition alt="Logo image" imageClass="w-2rem" />
			                    <span class="font-medium text-xl font-semibold">Trivial</span>
			                </span>
			            </template>
			            <template #submenuheader="{ item }">
			                <span class="text-primary font-bold">{{ item.label }}</span>
			            </template>
			            <template #item="{ item, props }">
							<a v-ripple class="flex align-items-center" v-bind="props.action">
								<span :class="item.icon" />
								<span class="ml-2">{{ item.label }}</span>
							</a>
			            </template>
			            <template #end>
			                <button v-ripple class="relative overflow-hidden w-full p-link flex align-items-center p-2 pl-3 text-color hover:surface-200 border-noround">
			                    <Avatar :image="AvatarIcon" class="mr-2" shape="circle" />
			                    <span class="inline-flex flex-column">
			                        <span class="font-bold">{{ user.name }}</span>
			                        <span class="text-sm capitalize">{{ user.role }}</span>
			                    </span>
			                </button>
			            </template>
			        </Menu>
			    </div>
			</div>
		</div>

		<Breadcrumb :breadcrumbs="breadcrumbs" />
	</header>
</template>

<script setup>
	import { Icon } from '@iconify/vue'
	import Breadcrumb from '../Breadcrumb.vue'
	import { ref, watch, onMounted, computed } from 'vue'
	import { useStore } from 'vuex'
	import notifications from '@/components/notifications'
	import AvatarIcon from '@/assets/images/user.svg'
	import LogoImgArrows from '../../assets/images/trivial-logo-arrows-warm.svg'
	import { useDark, useToggle } from '@vueuse/core'
	import { useRouter } from 'vue-router'
	import { usePrimeVue } from 'primevue/config'

	defineProps({
		title: {
			type: String,
			required: true,
			default: ''
		},
		breadcrumbs: {
			type: Array,
			required: true,
			default: []
		}
	})

	const selectedOrg = ref(),
		organisations = ref([{name: '', id: null}]),
		store = useStore(),
		checkedTheme = ref(false),
		router = useRouter(),
		menu = ref(),
		items = ref([
		    { separator: true },
		    {
		        label: 'Profile',
		        items: [
					{
						label: 'Settings',
						icon: 'pi pi-cog',
						command: () => router.push('/settings')
					},
					{
						label: 'Logout',
						icon: 'pi pi-sign-out',
						command: () => router.push('/signout')
					}
				]
		    },
		    { separator: true }
		]),
		primeVue = usePrimeVue()

	let localStorageOrgId = null,
		currentTheme = 'aura-light-green',
		nextTheme = 'aura-dark-blue'

	const isDark = useDark({
		selector: 'html',
		attribute: 'color-scheme',
		valueDark: 'dark',
		valueLight: 'light'
	})

	const toggleDark = useToggle(isDark)

	const user = computed(() => store.state.user)

	watch(selectedOrg, async (newVal, oldVal) => {
		let org = newVal === undefined ? oldVal : newVal
		localStorage.setItem('orgId', JSON.stringify(org.id))
	})

	onMounted(async () => {
		await fetchData()
		setSelectedOrg()
		setCheckedTheme()
		setPrimeVueTheme()
	})

	const toggleTheme = () => {
		toggleDark() // Main page theme
		setPrimeVueTheme() // VuePrime theme
	}

	const setPrimeVueTheme = () => {
		// Toggle PrimeVue theme for UI components
		if (isDark.value) {
			currentTheme = 'aura-light-green';
			nextTheme = 'aura-dark-blue';
		} else {
			currentTheme = 'aura-dark-blue';
			nextTheme = 'aura-light-green';
		}

		primeVue.changeTheme(currentTheme, nextTheme, 'theme-link')
	}

	const toggleMenu = (event) => menu.value.toggle(event)

	const handleSelected = () => store.dispatch('selectOrgId', selectedOrg.value?.id)
	
	const fetchData = async () => {
		try {
			organisations.value = await store.state.Session.apiCall('/organizations')
		} catch (err) {
			notifications.error(`Failed to fetch data: ${err}`)
		}
	}

	// Set the org. dropdown value if there is org. id in the localstorage when user refresh the page
	const setSelectedOrg = () => {
		localStorageOrgId = JSON.parse(localStorage.getItem('orgId'))

		// Select organization dropdown value if organization ID is stored in local storage
		if (localStorageOrgId) {
			selectedOrg.value = organisations.value.find(item => item.id === parseInt(localStorageOrgId, 10))
		}
	}

	const setCheckedTheme = () => checkedTheme.value = localStorage.getItem('vueuse-color-scheme') === 'light' ? true : false
</script>