<template>
    <span :class="className"><slot></slot></span>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            default: null,
        },
    },

    computed: {
        color() {
            return this.type;
        },

        className() {
            return `badge rounded-pill bg-${this.color}`;
        },
    },
};
</script>

<style>
.badge {
    min-width: 62px;
}
</style>
