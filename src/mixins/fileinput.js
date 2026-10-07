// Handles the methods for the input field with the type "file"
import events from '../core/events';

export default {
    methods: {
        $_c_onNewFileIn(file) {
            this.currentIsInitial = false;
            this.loading = true;
            this.$_c_paintBackground();
            this.emitEvent(events.FILE_CHOOSE_EVENT, file);
            this.chosenFile = file;

            if (!this.$_c_fileSizeIsValid(file)) {
                this.loading = false;
                this.emitEvent(events.FILE_SIZE_EXCEED_EVENT, file);
                return;
            }
            if (!this.$_c_fileTypeIsValid(file)) {
                this.loading = false;
                this.emitEvent(events.FILE_TYPE_MISMATCH_EVENT, file);
                return;
            }

            if (typeof window === 'undefined' || typeof window.FileReader === 'undefined') {
                return;
            }

            // The file replaces an image that still loads and a src that waits for the debounce
            const loadId = this.$_c_startLoad();
            const fr = new FileReader();
            fr.onload = (e) => {
                if (!this.$_c_isCurrentLoad(loadId)) return;
                // The browser applies the EXIF orientation of the image itself
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    if (!this.$_c_isCurrentLoad(loadId)) return;
                    this.emitEvent(events.FILE_LOADED_EVENT);
                    // A handler of file-loaded can call remove()
                    if (!this.$_c_isCurrentLoad(loadId)) return;
                    this.$_c_onload(img);
                    this.emitEvent(events.NEW_IMAGE_EVENT);
                };
            };
            fr.readAsDataURL(file);
        },
        $_c_fileSizeIsValid(file) {
            if (!file) return false;
            if (!this.fileSizeLimit || this.fileSizeLimit === 0) return true;
            return file.size < this.fileSizeLimit;
        },

        $_c_fileTypeIsValid(file) {
            const acceptableMimeType = /^image/.test(file.type);

            if (!acceptableMimeType) return false;

            return true;
        },
    },

};
