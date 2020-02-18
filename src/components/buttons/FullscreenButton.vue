<template>
    <rounded-button class="bottom-left-abs">
        <svg
            viewBox="0 0 22.5 22.5"
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
        >
            <g
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-miterlimit="10"
                stroke-width="1.5"
            >
                <path d="m.75 13.75v7.6a.4.4 0 0 0 .4.4h7.6" />
                <path d="m21.75 8.75v-7.6a.4.4 0 0 0 -.4-.4h-7.6" />
            </g>
        </svg>
    </rounded-button>
</template>


<script>
import RoundedButton from './RoundedButton.vue';

export default {
    components: {
        RoundedButton,
    },
};
</script>

<style lang="scss" scoped>
    .bottom-left-abs{
        bottom: 8px;
        left: 8px;
    }
</style>
