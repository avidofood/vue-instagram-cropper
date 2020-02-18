<template>
    <rounded-button class="top-right-abs">
        <svg
            viewBox="0 0 12.81 12.81"
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
        >
            <g
                fill="none"
                stroke="#fff"
                stroke-linecap="round"
                stroke-miterlimit="10"
                stroke-width="1.5"
            >
                <path d="m.75.75 5.66 5.66 5.65-5.66" />
                <path d="m12.06 12.06-5.65-5.65-5.66 5.65" />
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
    .top-right-abs{
        top: 8px;
        right: 8px;

        svg {
            margin: 1px;
        }
    }
</style>
