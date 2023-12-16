import FunctionWriter from '../components/FunctionWriter.vue'
import {createApp} from 'vue/dist/vue.runtime.esm-bundler'

console.log(`[FunctionWriter] Initializing`)

let index = createApp(FunctionWriter);
index.component("function-writer", FunctionWriter);

index.use(store);

index.mount("#functionWriter");