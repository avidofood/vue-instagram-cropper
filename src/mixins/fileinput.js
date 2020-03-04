// Handles the methods for the input field with the type "file"
import events from '../core/events';
import u from '../core/util';

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

            const fr = new FileReader();
            fr.onload = (e) => {
                let fileData = e.target.result;
                const orientation = this.$_c_getFileOrientation(fileData);

                const img = new Image();
                img.src = fileData;
                fileData = null; // Weird..
                img.onload = () => {
                    this.emitEvent(events.FILE_LOADED_EVENT);
                    this.$_c_onload(img, orientation);
                    this.emitEvent(events.NEW_IMAGE_EVENT);
                };
            };
            fr.readAsDataURL(file);
        },
        $_c_getFileOrientation(fileData) {
            const base64 = u.parseDataUrl(fileData);
            let orientation = 1;

            try {
                orientation = u.getFileOrientation(u.base64ToArrayBuffer(base64));
            } catch (err) {
                //
            }

            if (orientation < 1) orientation = 1;

            return orientation;
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
