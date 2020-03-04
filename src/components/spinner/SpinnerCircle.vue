<template>
    <div class="cropper-spinner" />
</template>

<script>
export default {

};
</script>

<style lang="scss" scoped>
.cropper-spinner {
    display: flex;
    position: absolute;
    top:50%;
    left:50%;
    margin-left:-21px;
    margin-top:-21px;
    box-sizing: border-box;
    justify-content: center;
    perspective-origin: 60px 60px;
    transform-origin: 60px 60px;
    border: 0px solid rgb(0, 0, 0);
    flex: 0 0 auto;
    flex-flow: column nowrap;

    &:after,
    &:before {
        height: 42px;
        width: 42px;
        border-radius: 50%;
        border-style: solid;
        border-width: 2px;
        box-sizing: border-box;
        content: '';
        left: 0;
        position: absolute;
        top: 0;
    }
    &:after {
        animation: rotate 2s infinite ease;
        border-color: #3897f0 transparent transparent;
        transform-origin: 50%;
    }
    &:before {
        border-color: #c7c7c7;
    }
}

@keyframes rotate {
    0% {
        transform: rotate(0deg)
    }
    to {
        transform: rotate(360deg)
    }
}
</style>
