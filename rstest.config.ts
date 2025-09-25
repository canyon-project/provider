import { defineConfig } from '@rstest/core';

export default defineConfig({
    coverage:{
        provider:'istanbul',
        enabled: true
    }
});
