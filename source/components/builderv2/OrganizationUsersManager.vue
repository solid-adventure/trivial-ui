<script>
import HideableSection from '../controls/HideableSection.vue';

export default {
    props: {
        organization: Object
    },
    data() {
        return {
            newUserRole: "",
            newUserId: "",
        };
    },
    methods: {
        clickRemoveRole(orgId, userId) {
            this.$emit('removerole', {orgId, userId});
        },
        clickNewUser(e, orgId) {
            e.preventDefault();
            this.$emit('newuser', {orgId, userId:this.newUserId, role: this.newUserRole});
            this.newUserId = this.newUserRole = '';
        },
    },
    components: { HideableSection }
};
</script>
<template>
    <td><HideableSection :initially-hidden="true" display-name="Users">
      <span v-for="user in organization.users" :key="user.user_id" class="user">
        {{ JSON.stringify(user) }}
        <button @click="clickRemoveRole(organization.id, user.user_id)">remove</button>
        <br />
      </span>
      <br />
      <br />
      <form>
        <input type="text" placeholder="user id" v-model="newUserId" />
        <input type="text" placeholder="role" v-model="newUserRole" />
        <button @click="clickNewUser($event, organization.id)">Add User</button>
      </form>
    </HideableSection></td>
</template>
<style lang="scss" scoped>
.user{
    padding: 0.25rem 0.5rem;
}
</style>