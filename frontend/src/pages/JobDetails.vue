<template>
    <div class="functions">
        <div class="btn-group" role="group">
            <router-link :to=" '/job/' + job.id +'/edit' " class="btn btn-normal">
                <font-awesome-icon icon="edit" /> {{ $t("Edit") }}
            </router-link>
            <button class="btn btn-danger" @click="deleteDialog">
                <font-awesome-icon icon="trash" /> {{ $t("Delete") }}
            </button>
        </div>
    </div>
</template>

<script lang="ts">
export default {

    data() {
        return {
            job: {},
        };
    },

    mounted() {
        let id = this.$route.params.id;
        this.job.id = id;
    }

};
</script>

<style scoped lang="scss">

</style>
