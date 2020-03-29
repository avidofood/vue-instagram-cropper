<template>
    <button
        class="rounded-button"
        type="button"
    >
        <span
            class="btn__content"
            tabindex="-1"
        >
            <slot />
        </span>
    </button>
</template>

<style lang="scss" scoped>
    .rounded-button{
        position: absolute;
        display: flex;
        text-align: center;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        background-color: rgba(37, 37, 37, 0.6);
        border: 1px solid transparent;
        padding:0;
        font-size: 16px;
        line-height: 1.5;
        border-radius: 100px;
        box-shadow: 0 0 1px #949494;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;

        // https://stackoverflow.com/questions/31402576/enable-focus-only-on-keyboard-use-or-tab-press
        &:hover{
            background-color: rgba(37, 37, 37, 0.75);
        }

        & .btn__content{
            display:flex;
            padding: 6px;
            border-radius: 100px;
        }

        &:focus, & .btn__content:focus{
            outline: none;
        }


    }

    .rounded-button:focus > .btn__content  {
        box-shadow: 0 0 2px 2px #51a7e8; /* keyboard-only focus styles */
    }
</style>
