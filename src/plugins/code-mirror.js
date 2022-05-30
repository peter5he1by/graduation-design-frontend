import {GlobalCmComponent} from 'codemirror-editor-vue3';
import Codemirror from 'codemirror-editor-vue3';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/xml/xml.js';
import 'codemirror/mode/yaml/yaml.js';
import 'codemirror/theme/idea.css';

export function installCodeMirrorEditor(app) {
    app.component('Codemirror', Codemirror);
    return app.use(GlobalCmComponent);
}