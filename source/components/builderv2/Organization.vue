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
        clickRemoveOrganization(orgId) {
            this.$emit('removeorganization', orgId);
        },
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
  <span>
    ID: {{ organization.id }} Name: {{ organization.name }} Billing Email: {{ organization.billing_email }}
    <button @click="clickRemoveOrganization(organization.id)">remove</button>
    <HideableSection :initially-hidden="true" display-name="Users">
      <span v-for="user in organization.users" :key="user.user_id">
        User: {{ JSON.stringify(user) }}
        <button @click="clickRemoveRole(organization.id, user.user_id)">remove</button>
        <br />
      </span>
      <br />
      <br />
      <form>
        <input type="text" placeholder="user id" v-model="newUserId" />
        <input type="text" placeholder="role" v-model="newUserRole" />
        <button @click="clickNewUser(e, organization.id)">Add User</button>
      </form>
    </HideableSection>
  </span>
</template>
<style lang="scss" scoped>
</style>