import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'

export function installElementPlus(app) {
    app.use(ElementPlus, {size: 'small', zIndex: 3000});
}