<template>
	<header class="main__header">
		<div class="main__header__top">
			<h1>{{ title }}</h1>

			<Button @click="openMobileMenu" icon="pi pi-bars" aria-label="Open aside menu" outlined severity="secondary" class="main__header__top__mobile__menu" />

			<div class="main__header__top__content">
				<Dropdown v-model="selectedOrg" :options="organisations" optionLabel="name" placeholder="Select Organization" class="main__header__top__content__dropdown" :change="handleSelected()" />

				<ToggleButton v-model="checkedTheme" @click="toggleTheme()" v-ripple onLabel="" offLabel="" onIcon="pi pi-sun" offIcon="pi pi-moon" class="w-2.5rem main__header__top__content__theme-btn" aria-label="Do you confirm" />

				<Button type="button" icon="pi pi-user" @click="toggleMenu" aria-haspopup="true" aria-controls="overlay_menu" severity="secondary" aria-label="User" class="main__header__top__content__user-btn" />
				
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

		<h1 class="main__header__mobile__title">{{ title }}</h1>

		<Breadcrumb :breadcrumbs="breadcrumbs" />
	</header>
</template>

<script setup>
	//import { Icon } from '@iconify/vue'
	import Breadcrumb from '../Breadcrumb.vue'
	import { ref, watch, onMounted, computed } from 'vue'
	import { useStore } from 'vuex'
	import AvatarIcon from '@/assets/images/user.svg'
	import LogoImgArrows from '../../assets/images/trivial-logo-arrows-warm.svg'
	import { useDark, useToggle } from '@vueuse/core'
	import { useRouter } from 'vue-router'
	import { usePrimeVue } from 'primevue/config'
	import { useToastNotifications } from '@/composable/toastNotification'

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
		organisations = ref([]),
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
		primeVue = usePrimeVue(),
		{ showErrorToast } = useToastNotifications()

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

	const getOrganizations = computed(() => store.getters.getOrganizations)
	const user = computed(() => store.state.user)

	watch(getOrganizations, async (newVal, oldVal) => { 
		organisations.value = newVal
		organisations.value.unshift({name: 'None', id: null})
		setSelectedOrg()
	})
	watch(selectedOrg, async (newVal, oldVal) => {
		let org = newVal === undefined ? oldVal : newVal
		localStorage.setItem('orgId', JSON.stringify(org.id))
	})

	onMounted(() => {
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
			currentTheme = 'aura-light-green'
			nextTheme = 'aura-dark-blue'
			store.dispatch('getDarkTheme', isDark.value)
		} else {
			currentTheme = 'aura-dark-blue'
			nextTheme = 'aura-light-green'
			store.dispatch('getDarkTheme', isDark.value)
		}

		primeVue.changeTheme(currentTheme, nextTheme, 'theme-link')
	}

	const toggleMenu = event => menu.value.toggle(event)
	const handleSelected = () => store.dispatch('selectOrgId', selectedOrg.value?.id)

	// Set the org. dropdown value if there is org. id in the localstorage when user refresh the page
	const setSelectedOrg = () => {
		localStorageOrgId = JSON.parse(localStorage.getItem('orgId'))

		// Select organization dropdown value if organization ID is stored in local storage
		if (localStorageOrgId) {
			selectedOrg.value = organisations.value.find(item => item.id === parseInt(localStorageOrgId, 10))
		} else {
			selectedOrg.value = {name: 'None', id: null}
		}
	}

	const setCheckedTheme = () => checkedTheme.value = localStorage.getItem('vueuse-color-scheme') === 'light' ? true : false
	const openMobileMenu = () => store.dispatch('mobileMenu', true)
</script>