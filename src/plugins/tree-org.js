import vue3TreeOrg from 'vue3-tree-org';
import "vue3-tree-org/lib/vue3-tree-org.css";
import VueTree from "@ssthouse/vue3-tree-chart";
import "@ssthouse/vue3-tree-chart/dist/vue3-tree-chart.css";

export function installTreeOrg(app) {
    app.use(vue3TreeOrg)
    app.component('vue-tree', VueTree)
}
