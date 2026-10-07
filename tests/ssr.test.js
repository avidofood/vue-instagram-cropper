// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import InstagramCropper from '../src/index';

// Nuxt renders pages on the server, where window and document do not exist
describe('server-side rendering', () => {
    it('renders the cropper without a browser', async () => {
        const app = createSSRApp({
            render: () => h(InstagramCropper, { src: '/images/photo.jpg', class: 'w-100' }),
        });

        const html = await renderToString(app);

        expect(typeof window).toBe('undefined');
        expect(html).toContain('class="cropper-container w-100"');
        expect(html).toMatch(/<canvas[^>]*tabindex="0"/);
    });
});
