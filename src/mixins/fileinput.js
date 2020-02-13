// Handles the methods for the input field with the type "file"
import events from '../core/events';

export default {
    methods: {
        $_c_onNewFileIn(file) {
            this.currentIsInitial = false;
            this.loading = true;
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

            const fr = new FileReader();
            fr.onload = (e) => {
                let fileData = e.target.result;

                const img = new Image();
                img.src = fileData;
                fileData = null; // Weird..
                img.onload = () => {
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
